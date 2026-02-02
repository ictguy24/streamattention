-- Migration to add missing components for the decay system

-- Create functions for decay system that were referenced in the edge function

-- Function to get users eligible for decay (inactive 31+ days with balance)
CREATE OR REPLACE FUNCTION public.get_decay_eligible_users()
RETURNS TABLE(user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id as user_id
  FROM profiles p
  JOIN wallets w ON p.id = w.user_id
  WHERE p.last_active_at < now() - INTERVAL '31 days'
    AND w.ac_balance > 0;
END;
$$;

-- Function to apply AC decay to a user
CREATE OR REPLACE FUNCTION public.apply_ac_decay(p_user_id UUID)
RETURNS TABLE(decayed_amount BIGINT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet RECORD;
  v_decay_amount BIGINT;
  v_new_balance BIGINT;
BEGIN
  -- Get current wallet balance
  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id;
  
  IF v_wallet IS NULL OR v_wallet.ac_balance <= 0 THEN
    RETURN QUERY SELECT 0::BIGINT, 'No balance to decay'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate decay (10% of balance, minimum 1 AC)
  v_decay_amount := GREATEST(1, (v_wallet.ac_balance * 0.1)::BIGINT);
  v_decay_amount := LEAST(v_decay_amount, v_wallet.ac_balance); -- Don't decay more than balance
  
  -- Update wallet
  UPDATE wallets 
  SET ac_balance = ac_balance - v_decay_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Log the decay event
  INSERT INTO attention_ledger (
    user_id, 
    raw_ac, 
    quality_factor, 
    verification_ratio, 
    verified_ac, 
    created_at
  )
  VALUES (
    p_user_id, 
    -v_decay_amount::FLOAT, 
    1.0, 
    1.0, 
    -v_decay_amount::FLOAT, 
    now()
  );
  
  -- Reduce UPS slightly for inactivity
  PERFORM update_ups(
    p_user_id, 
    -0.02, 
    'inactivity_decay_' || EXTRACT(YEAR FROM now()) || '-' || EXTRACT(MONTH FROM now())
  );
  
  RETURN QUERY SELECT 
    v_decay_amount, 
    'Applied ' || v_decay_amount || ' AC decay for inactivity'::TEXT;
END;
$$;

-- Function to apply UPS forgiveness to returning users
CREATE OR REPLACE FUNCTION public.apply_ups_forgiveness(p_user_id UUID)
RETURNS TABLE(ups_boost FLOAT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_boost_amount FLOAT;
  v_new_ups FLOAT;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF v_profile IS NULL THEN
    RETURN QUERY SELECT 0.0::FLOAT, 'User not found'::TEXT;
    RETURN;
  END IF;
  
  -- Only apply forgiveness if user was previously penalized (UPS < 0.7)
  IF v_profile.ups >= 0.7 THEN
    RETURN QUERY SELECT 0.0::FLOAT, 'User does not need forgiveness'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate boost to bring user back toward baseline (0.5)
  v_boost_amount := LEAST(0.1, (0.5 - v_profile.ups));
  
  -- Apply the boost
  v_new_ups := update_ups(
    p_user_id, 
    v_boost_amount, 
    'returning_user_forgiveness'
  );
  
  RETURN QUERY SELECT 
    v_boost_amount, 
    'Applied ' || v_boost_amount || ' UPS boost for returning user'::TEXT;
END;
$$;

-- Additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_wallets_balance ON wallets(ac_balance) WHERE ac_balance > 0;

-- Make sure the decay-cron function is configured properly in config.toml
-- This is handled in the config file, not in SQL