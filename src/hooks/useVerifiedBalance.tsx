import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BalanceData {
  balance: number;
  trustState: 'cold' | 'warm' | 'active' | 'trusted';
  ups: number;
  accountType: 'user' | 'creator' | 'both';
}

interface UseVerifiedBalanceReturn {
  balance: number;
  trustState: string;
  ups: number;
  accountType: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useVerifiedBalance = (): UseVerifiedBalanceReturn => {
  const [data, setData] = useState<BalanceData>({
    balance: 0,
    trustState: 'cold',
    ups: 0.5,
    accountType: 'user',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setData({ balance: 0, trustState: 'cold', ups: 0.5, accountType: 'user' });
        setIsLoading(false);
        return;
      }

      const response = await supabase.functions.invoke('get-balance');

      if (response.error) {
        throw new Error(response.error.message);
      }

      setData({
        balance: response.data?.balance || 0,
        trustState: response.data?.trust_state || 'cold',
        ups: response.data?.ups || 0.5,
        accountType: response.data?.account_type || 'user',
      });
      setError(null);
    } catch (err) {
      console.error('Balance fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Subscribe to realtime balance updates via attention_ledger
  useEffect(() => {
    const channel = supabase
      .channel('balance-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'attention_ledger',
        },
        () => {
          // Refetch balance when new ledger entry is added
          fetchBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBalance]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        fetchBalance();
      } else if (event === 'SIGNED_OUT') {
        setData({ balance: 0, trustState: 'cold', ups: 0.5, accountType: 'user' });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchBalance]);

  return {
    balance: data.balance,
    trustState: data.trustState,
    ups: data.ups,
    accountType: data.accountType,
    isLoading,
    error,
    refetch: fetchBalance,
  };
};

export default useVerifiedBalance;
