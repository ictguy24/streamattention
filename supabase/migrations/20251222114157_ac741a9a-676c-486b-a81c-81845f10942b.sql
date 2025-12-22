-- =============================================
-- PHASE 1: TIERS TABLE (Subscription Levels)
-- =============================================
CREATE TABLE public.tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  base_multiplier NUMERIC(4,2) DEFAULT 1.0,
  monthly_fee_ac INTEGER DEFAULT 0,
  withdrawal_fee_percent NUMERIC(5,2) DEFAULT 10.0,
  min_withdrawal_ac INTEGER DEFAULT 100,
  features JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO tiers (name, display_name, base_multiplier, monthly_fee_ac, withdrawal_fee_percent, min_withdrawal_ac, features) VALUES
  ('free', 'Free', 1.0, 0, 15.0, 100, '{"watch_multiplier": 1.0, "interaction_bonus": false}'::jsonb),
  ('user', 'User', 1.25, 200, 10.0, 50, '{"watch_multiplier": 1.25, "interaction_bonus": true}'::jsonb),
  ('both', 'Both', 1.5, 500, 7.5, 25, '{"watch_multiplier": 1.5, "interaction_bonus": true, "priority_support": true}'::jsonb),
  ('premium', 'Premium', 2.0, 1000, 5.0, 0, '{"watch_multiplier": 2.0, "interaction_bonus": true, "priority_support": true, "exclusive_content": true}'::jsonb);

-- =============================================
-- PHASE 2: WALLETS TABLE (Separate from Profiles)
-- =============================================
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  ac_balance BIGINT DEFAULT 0 CHECK (ac_balance >= 0),
  withdrawable_balance BIGINT DEFAULT 0,
  lifetime_earned BIGINT DEFAULT 0,
  lifetime_withdrawn BIGINT DEFAULT 0,
  withdrawal_frozen BOOLEAN DEFAULT FALSE,
  freeze_reason TEXT,
  last_earning_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wallets_user ON wallets(user_id);

-- =============================================
-- PHASE 3: SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  tier_id UUID REFERENCES tiers(id) NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  next_deduction_at TIMESTAMPTZ,
  last_deduction_at TIMESTAMPTZ,
  last_deduction_amount BIGINT DEFAULT 0,
  consecutive_failed_deductions INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'grace_period', 'frozen')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_next_deduction ON subscriptions(next_deduction_at) WHERE status = 'active';

-- =============================================
-- PHASE 4: SUBSCRIPTION DEDUCTIONS LEDGER
-- =============================================
CREATE TABLE public.subscription_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE NOT NULL,
  tier_name TEXT NOT NULL,
  amount_due BIGINT NOT NULL,
  amount_deducted BIGINT NOT NULL,
  balance_before BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_deductions_user ON subscription_deductions(user_id, created_at DESC);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_deductions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Tiers: Public read access
CREATE POLICY "Anyone can view tiers" ON tiers FOR SELECT USING (true);

-- Wallets: Users can only view their own
CREATE POLICY "Users view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions: Users can view their own
CREATE POLICY "Users view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Deductions: Users can view their own history
CREATE POLICY "Users view own deductions" ON subscription_deductions FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- PHASE 5: AUTO-CREATE WALLET & SUBSCRIPTION TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_free_tier_id UUID;
BEGIN
  -- Get free tier ID
  SELECT id INTO v_free_tier_id FROM tiers WHERE name = 'free';
  
  -- Create wallet
  INSERT INTO wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create subscription (free tier, no deduction needed)
  INSERT INTO subscriptions (user_id, tier_id, next_deduction_at)
  VALUES (NEW.id, v_free_tier_id, NULL)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_profile_created_wallet_subscription ON profiles;

-- Create new trigger
CREATE TRIGGER on_profile_created_wallet_subscription
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_wallet_subscription();

-- =============================================
-- PHASE 6: PROCESS SUBSCRIPTION DEDUCTION FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.process_subscription_deduction(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, deducted BIGINT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_subscription RECORD;
  v_wallet RECORD;
  v_amount_to_deduct BIGINT;
  v_actual_deducted BIGINT;
  v_new_balance BIGINT;
  v_status TEXT;
  v_new_sub_status TEXT;
BEGIN
  -- Get subscription with tier info
  SELECT s.*, t.name as tier_name, t.monthly_fee_ac
  INTO v_subscription
  FROM subscriptions s
  JOIN tiers t ON s.tier_id = t.id
  WHERE s.user_id = p_user_id;
  
  IF v_subscription IS NULL THEN
    RETURN QUERY SELECT FALSE, 0::BIGINT, 'No subscription found'::TEXT;
    RETURN;
  END IF;
  
  -- Free tier = no deduction
  IF v_subscription.monthly_fee_ac = 0 THEN
    RETURN QUERY SELECT TRUE, 0::BIGINT, 'Free tier - no deduction required'::TEXT;
    RETURN;
  END IF;
  
  -- Get current wallet
  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id;
  
  IF v_wallet IS NULL THEN
    RETURN QUERY SELECT FALSE, 0::BIGINT, 'No wallet found'::TEXT;
    RETURN;
  END IF;
  
  v_amount_to_deduct := v_subscription.monthly_fee_ac;
  
  -- Determine actual deduction
  IF v_wallet.ac_balance >= v_amount_to_deduct THEN
    v_actual_deducted := v_amount_to_deduct;
    v_status := 'success';
    v_new_sub_status := 'active';
  ELSIF v_wallet.ac_balance > 0 THEN
    v_actual_deducted := v_wallet.ac_balance;
    v_status := 'partial';
    v_new_sub_status := 'grace_period';
  ELSE
    v_actual_deducted := 0;
    v_status := 'failed';
    v_new_sub_status := CASE 
      WHEN v_subscription.consecutive_failed_deductions >= 1 THEN 'frozen'
      ELSE 'grace_period'
    END;
  END IF;
  
  -- Deduct from wallet
  UPDATE wallets
  SET ac_balance = ac_balance - v_actual_deducted,
      withdrawal_frozen = CASE WHEN v_status != 'success' THEN TRUE ELSE FALSE END,
      freeze_reason = CASE WHEN v_status != 'success' THEN 'Insufficient AC for subscription fee' ELSE NULL END,
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING ac_balance INTO v_new_balance;
  
  -- Log deduction
  INSERT INTO subscription_deductions 
    (user_id, subscription_id, tier_name, amount_due, amount_deducted, balance_before, balance_after, status, notes)
  VALUES 
    (p_user_id, v_subscription.id, v_subscription.tier_name, v_amount_to_deduct, v_actual_deducted, v_wallet.ac_balance, v_new_balance, v_status,
     CASE v_status
       WHEN 'success' THEN 'Monthly subscription fee deducted successfully'
       WHEN 'partial' THEN 'Partial deduction - insufficient balance'
       ELSE 'Deduction failed - no balance'
     END);
  
  -- Update subscription
  UPDATE subscriptions
  SET last_deduction_at = NOW(),
      last_deduction_amount = v_actual_deducted,
      next_deduction_at = NOW() + INTERVAL '1 month',
      consecutive_failed_deductions = CASE 
        WHEN v_status = 'success' THEN 0 
        ELSE consecutive_failed_deductions + 1 
      END,
      status = v_new_sub_status,
      updated_at = NOW()
  WHERE id = v_subscription.id;
  
  RETURN QUERY SELECT 
    v_status = 'success',
    v_actual_deducted,
    CASE v_status
      WHEN 'success' THEN 'Deduction successful'
      WHEN 'partial' THEN 'Partial deduction - withdrawal frozen'
      ELSE 'Deduction failed - withdrawal frozen'
    END;
END;
$$;

-- =============================================
-- PHASE 7: CALCULATE WITHDRAWABLE BALANCE
-- =============================================
CREATE OR REPLACE FUNCTION public.calculate_withdrawable_balance(p_user_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet RECORD;
  v_subscription RECORD;
  v_pending_fee BIGINT;
  v_withdrawable BIGINT;
BEGIN
  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id;
  
  IF v_wallet IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Check if withdrawal is frozen
  IF v_wallet.withdrawal_frozen THEN
    RETURN 0;
  END IF;
  
  SELECT s.*, t.monthly_fee_ac
  INTO v_subscription
  FROM subscriptions s
  JOIN tiers t ON s.tier_id = t.id
  WHERE s.user_id = p_user_id;
  
  -- Calculate pending fee (reserve for next subscription)
  IF v_subscription IS NOT NULL AND v_subscription.monthly_fee_ac > 0 THEN
    v_pending_fee := v_subscription.monthly_fee_ac;
  ELSE
    v_pending_fee := 0;
  END IF;
  
  -- Withdrawable = balance - pending subscription fee
  v_withdrawable := GREATEST(0, v_wallet.ac_balance - v_pending_fee);
  
  RETURN v_withdrawable;
END;
$$;

-- =============================================
-- PHASE 8: CHANGE SUBSCRIPTION TIER
-- =============================================
CREATE OR REPLACE FUNCTION public.change_subscription_tier(
  p_user_id UUID,
  p_new_tier_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_tier RECORD;
BEGIN
  SELECT * INTO v_new_tier FROM tiers WHERE name = p_new_tier_name;
  
  IF v_new_tier IS NULL THEN
    RAISE EXCEPTION 'Invalid tier name: %', p_new_tier_name;
  END IF;
  
  -- Update subscription
  UPDATE subscriptions
  SET tier_id = v_new_tier.id,
      next_deduction_at = CASE 
        WHEN v_new_tier.monthly_fee_ac > 0 THEN COALESCE(next_deduction_at, NOW() + INTERVAL '1 month')
        ELSE NULL
      END,
      status = 'active',
      consecutive_failed_deductions = 0,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Update profile tier reference
  UPDATE profiles SET tier = p_new_tier_name, updated_at = NOW() WHERE id = p_user_id;
  
  -- Unfreeze withdrawal if switching to free tier or has enough balance
  IF v_new_tier.monthly_fee_ac = 0 THEN
    UPDATE wallets 
    SET withdrawal_frozen = FALSE, freeze_reason = NULL, updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- =============================================
-- PHASE 9: GET SUBSCRIPTIONS DUE FOR DEDUCTION
-- =============================================
CREATE OR REPLACE FUNCTION public.get_subscriptions_due()
RETURNS TABLE(user_id UUID, tier_name TEXT, fee_amount INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT s.user_id, t.name as tier_name, t.monthly_fee_ac as fee_amount
  FROM subscriptions s
  JOIN tiers t ON s.tier_id = t.id
  WHERE s.next_deduction_at IS NOT NULL
    AND s.next_deduction_at <= NOW()
    AND t.monthly_fee_ac > 0
    AND s.status IN ('active', 'grace_period');
END;
$$;

-- =============================================
-- ENABLE REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;