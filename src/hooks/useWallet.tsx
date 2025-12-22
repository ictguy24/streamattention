import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Wallet {
  id: string;
  user_id: string;
  ac_balance: number;
  withdrawable_balance: number;
  lifetime_earned: number;
  lifetime_withdrawn: number;
  withdrawal_frozen: boolean;
  freeze_reason: string | null;
  last_earning_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UseWalletReturn {
  wallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getWithdrawableBalance: () => Promise<number>;
}

export const useWallet = (): UseWalletReturn => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    if (!user?.id) {
      setWallet(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching wallet:', fetchError);
        setError(fetchError.message);
        setWallet(null);
      } else {
        setWallet(data as Wallet | null);
        setError(null);
      }
    } catch (err) {
      console.error('Exception fetching wallet:', err);
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const getWithdrawableBalance = useCallback(async (): Promise<number> => {
    if (!user?.id) return 0;

    try {
      const { data, error } = await supabase
        .rpc('calculate_withdrawable_balance', { p_user_id: user.id });

      if (error) {
        console.error('Error calculating withdrawable balance:', error);
        return 0;
      }

      return data || 0;
    } catch (err) {
      console.error('Exception calculating withdrawable balance:', err);
      return 0;
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('wallet-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallets',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Wallet updated via realtime:', payload);
          if (payload.new) {
            setWallet(payload.new as Wallet);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    wallet,
    isLoading,
    error,
    refetch: fetchWallet,
    getWithdrawableBalance
  };
};
