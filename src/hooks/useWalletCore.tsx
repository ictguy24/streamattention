import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// =================== TYPES ===================

interface WalletData {
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

interface BalanceData {
  balance: number;
  trustState: 'cold' | 'warm' | 'active' | 'trusted';
  ups: number;
  accountType: 'user' | 'creator' | 'both';
}

interface ACEarningConfig {
  baseRatePerSecond: number;
  bufferTime: number;
  speedModifiers: Record<number, number>;
}

const DEFAULT_EARNING_CONFIG: ACEarningConfig = {
  baseRatePerSecond: 0.5,
  bufferTime: 0.8,
  speedModifiers: {
    0.75: 1.05,
    1: 1,
    1.25: 0.9,
    1.5: 0.8,
  },
};

interface UseWalletCoreReturn {
  // Balance state (from verified balance)
  balance: number;
  trustState: 'cold' | 'warm' | 'active' | 'trusted';
  ups: number;
  accountType: 'user' | 'creator' | 'both';
  
  // Wallet state (from wallets table)
  wallet: WalletData | null;
  withdrawableBalance: number;
  lifetimeEarned: number;
  lifetimeWithdrawn: number;
  withdrawalFrozen: boolean;
  freezeReason: string | null;
  
  // Earning controls
  startEarning: (playbackSpeed?: number) => void;
  pauseEarning: () => void;
  stopEarning: () => void;
  flushEarnings: () => number;
  isEarning: boolean;
  pendingAC: number;
  getSpeedIndicator: (speed: number) => { speed: number; modifier: number; isModified: boolean };
  
  // Mutations
  refetch: () => Promise<void>;
  getWithdrawableBalance: () => Promise<number>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

// =================== HOOK ===================

export const useWalletCore = (): UseWalletCoreReturn => {
  const { user } = useAuth();
  
  // Balance state (from edge function)
  const [balanceData, setBalanceData] = useState<BalanceData>({
    balance: 0,
    trustState: 'cold',
    ups: 0.5,
    accountType: 'user',
  });
  
  // Wallet state (from database)
  const [wallet, setWallet] = useState<WalletData | null>(null);
  
  // Earning state
  const [isEarning, setIsEarning] = useState(false);
  const [pendingAC, setPendingAC] = useState(0);
  const [currentPlaybackSpeed, setCurrentPlaybackSpeed] = useState(1);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for earning
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const bufferTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(0);
  const accumulatedACRef = useRef<number>(0);
  const config = DEFAULT_EARNING_CONFIG;

  // =================== FETCH BALANCE ===================
  
  const fetchBalance = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setBalanceData({ balance: 0, trustState: 'cold', ups: 0.5, accountType: 'user' });
        return;
      }

      const response = await supabase.functions.invoke('get-balance');

      if (response.error) {
        throw new Error(response.error.message);
      }

      setBalanceData({
        balance: response.data?.balance || 0,
        trustState: response.data?.trust_state || 'cold',
        ups: response.data?.ups || 0.5,
        accountType: response.data?.account_type || 'user',
      });
      setError(null);
    } catch (err) {
      console.error('Balance fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    }
  }, []);

  // =================== FETCH WALLET ===================
  
  const fetchWallet = useCallback(async () => {
    if (!user?.id) {
      setWallet(null);
      return;
    }

    try {
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
        setWallet(data as WalletData | null);
      }
    } catch (err) {
      console.error('Exception fetching wallet:', err);
      setError(String(err));
    }
  }, [user?.id]);

  // =================== REFETCH ALL ===================
  
  const refetch = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchBalance(), fetchWallet()]);
    setIsLoading(false);
  }, [fetchBalance, fetchWallet]);

  // =================== GET WITHDRAWABLE BALANCE ===================
  
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

  // =================== EARNING CONTROLS ===================
  
  const getSpeedModifier = useCallback((speed: number) => {
    const speeds = Object.keys(config.speedModifiers).map(Number).sort((a, b) => a - b);
    const closestSpeed = speeds.reduce((prev, curr) =>
      Math.abs(curr - speed) < Math.abs(prev - speed) ? curr : prev
    );
    return config.speedModifiers[closestSpeed] || 1;
  }, [config.speedModifiers]);

  const getSpeedIndicator = useCallback((speed: number) => {
    const modifier = getSpeedModifier(speed);
    return {
      speed,
      modifier,
      isModified: speed !== 1,
    };
  }, [getSpeedModifier]);

  const startEarning = useCallback((playbackSpeed: number = 1) => {
    if (bufferTimerRef.current || intervalRef.current) return;
    setCurrentPlaybackSpeed(playbackSpeed);

    bufferTimerRef.current = setTimeout(() => {
      setIsEarning(true);
      lastTickRef.current = Date.now();

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - lastTickRef.current) / 1000;
        lastTickRef.current = now;

        const modifier = getSpeedModifier(currentPlaybackSpeed);
        const earned = config.baseRatePerSecond * elapsed * modifier;
        accumulatedACRef.current += earned;
        setPendingAC(Math.floor(accumulatedACRef.current));
      }, 100);

      bufferTimerRef.current = null;
    }, config.bufferTime * 1000);
  }, [config.baseRatePerSecond, config.bufferTime, getSpeedModifier, currentPlaybackSpeed]);

  const pauseEarning = useCallback(() => {
    if (bufferTimerRef.current) {
      clearTimeout(bufferTimerRef.current);
      bufferTimerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsEarning(false);
  }, []);

  const stopEarning = useCallback(() => {
    pauseEarning();
    accumulatedACRef.current = 0;
    setPendingAC(0);
  }, [pauseEarning]);

  const flushEarnings = useCallback((): number => {
    const remaining = Math.floor(accumulatedACRef.current);
    accumulatedACRef.current = 0;
    setPendingAC(0);
    return remaining;
  }, []);

  // =================== EFFECTS ===================
  
  // Initial fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

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
          fetchBalance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBalance]);

  // Subscribe to wallet updates
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
          if (payload.new) {
            setWallet(payload.new as WalletData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        refetch();
      } else if (event === 'SIGNED_OUT') {
        setBalanceData({ balance: 0, trustState: 'cold', ups: 0.5, accountType: 'user' });
        setWallet(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  // Cleanup earning timers on unmount
  useEffect(() => {
    return () => {
      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    // Balance state
    balance: balanceData.balance,
    trustState: balanceData.trustState,
    ups: balanceData.ups,
    accountType: balanceData.accountType,
    
    // Wallet state
    wallet,
    withdrawableBalance: wallet?.withdrawable_balance || 0,
    lifetimeEarned: wallet?.lifetime_earned || 0,
    lifetimeWithdrawn: wallet?.lifetime_withdrawn || 0,
    withdrawalFrozen: wallet?.withdrawal_frozen || false,
    freezeReason: wallet?.freeze_reason || null,
    
    // Earning controls
    startEarning,
    pauseEarning,
    stopEarning,
    flushEarnings,
    isEarning,
    pendingAC,
    getSpeedIndicator,
    
    // Mutations
    refetch,
    getWithdrawableBalance,
    
    // Loading states
    isLoading,
    error,
  };
};

export default useWalletCore;
