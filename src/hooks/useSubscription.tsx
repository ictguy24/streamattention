import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Tier {
  id: string;
  name: string;
  display_name: string;
  base_multiplier: number;
  monthly_fee_ac: number;
  withdrawal_fee_percent: number;
  min_withdrawal_ac: number;
  features: Record<string, unknown>;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier_id: string;
  started_at: string;
  next_deduction_at: string | null;
  last_deduction_at: string | null;
  last_deduction_amount: number;
  consecutive_failed_deductions: number;
  status: 'active' | 'grace_period' | 'frozen';
  created_at: string;
  updated_at: string;
}

export interface SubscriptionWithTier extends Subscription {
  tier: Tier;
}

export interface UseSubscriptionReturn {
  subscription: SubscriptionWithTier | null;
  tiers: Tier[];
  isLoading: boolean;
  error: string | null;
  changeTier: (tierName: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionWithTier | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTiers = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('tiers')
      .select('*')
      .order('base_multiplier', { ascending: true });

    if (fetchError) {
      console.error('Error fetching tiers:', fetchError);
    } else {
      setTiers((data || []) as Tier[]);
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch subscription with tier
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          tier:tiers(*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching subscription:', fetchError);
        setError(fetchError.message);
        setSubscription(null);
      } else if (data) {
        setSubscription({
          ...data,
          tier: data.tier as unknown as Tier
        } as SubscriptionWithTier);
        setError(null);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Exception fetching subscription:', err);
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const changeTier = useCallback(async (tierName: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase
        .rpc('change_subscription_tier', { 
          p_user_id: user.id, 
          p_new_tier_name: tierName 
        });

      if (error) {
        console.error('Error changing tier:', error);
        setError(error.message);
        return false;
      }

      // Refetch to get updated subscription
      await fetchSubscription();
      return true;
    } catch (err) {
      console.error('Exception changing tier:', err);
      setError(String(err));
      return false;
    }
  }, [user?.id, fetchSubscription]);

  // Initial fetch
  useEffect(() => {
    fetchTiers();
    fetchSubscription();
  }, [fetchTiers, fetchSubscription]);

  // Realtime subscription for subscription changes
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('subscription-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Subscription updated via realtime');
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchSubscription]);

  return {
    subscription,
    tiers,
    isLoading,
    error,
    changeTier,
    refetch: fetchSubscription
  };
};
