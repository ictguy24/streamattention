
-- =====================================================
-- DECAY & FORGIVENESS DATABASE FUNCTIONS
-- =====================================================

-- 1. Calculate AC decay based on inactivity period
CREATE OR REPLACE FUNCTION public.calculate_ac_decay(p_user_id UUID)
RETURNS TABLE(decay_amount FLOAT, days_inactive INTEGER, decay_percent FLOAT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_active TIMESTAMPTZ;
  v_days_inactive INTEGER;
  v_balance FLOAT;
  v_decay_percent FLOAT;
  v_decay_amount FLOAT;
BEGIN
  -- Get user's last active time and current balance
  SELECT last_active_at INTO v_last_active FROM profiles WHERE id = p_user_id;
  v_balance := get_verified_balance(p_user_id);
  
  IF v_last_active IS NULL OR v_balance <= 0 THEN
    RETURN QUERY SELECT 0.0::FLOAT, 0::INTEGER, 0.0::FLOAT;
    RETURN;
  END IF;
  
  v_days_inactive := EXTRACT(DAY FROM (now() - v_last_active))::INTEGER;
  
  -- Calculate decay percentage based on inactivity period
  IF v_days_inactive <= 30 THEN
    v_decay_percent := 0;
  ELSIF v_days_inactive <= 90 THEN
    -- Linear scale from 0% to 5% between days 31-90
    v_decay_percent := ((v_days_inactive - 30)::FLOAT / 60.0) * 5.0;
  ELSE
    -- Capped at 10% for 90+ days
    v_decay_percent := 10.0;
  END IF;
  
  v_decay_amount := v_balance * (v_decay_percent / 100.0);
  
  RETURN QUERY SELECT v_decay_amount, v_days_inactive, v_decay_percent;
END;
$$;

-- 2. Apply AC decay to a user (creates negative ledger entry)
CREATE OR REPLACE FUNCTION public.apply_ac_decay(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, decayed_amount FLOAT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_decay RECORD;
BEGIN
  -- Calculate decay
  SELECT * INTO v_decay FROM calculate_ac_decay(p_user_id);
  
  IF v_decay.decay_amount <= 0 THEN
    RETURN QUERY SELECT TRUE, 0.0::FLOAT, 'No decay needed'::TEXT;
    RETURN;
  END IF;
  
  -- Insert negative ledger entry for decay
  INSERT INTO attention_ledger (
    user_id, 
    interaction_id, 
    raw_ac, 
    quality_factor, 
    verification_ratio, 
    verified_ac
  )
  VALUES (
    p_user_id,
    NULL, -- No interaction for decay
    -v_decay.decay_amount,
    1.0,
    1.0,
    -v_decay.decay_amount
  );
  
  -- Log the decay in UPS history as a note
  INSERT INTO ups_history (user_id, previous_ups, new_ups, delta, reason)
  SELECT ups, ups, 0, 
    'ac_decay_' || v_decay.days_inactive || '_days_' || ROUND(v_decay.decay_percent, 2) || '%'
  FROM profiles WHERE id = p_user_id;
  
  RETURN QUERY SELECT TRUE, v_decay.decay_amount, 
    ('Decayed ' || ROUND(v_decay.decay_percent, 2) || '% after ' || v_decay.days_inactive || ' days')::TEXT;
END;
$$;

-- 3. Apply UPS forgiveness for returning users
CREATE OR REPLACE FUNCTION public.apply_ups_forgiveness(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, ups_boost FLOAT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_days_away INTEGER;
  v_boost FLOAT;
  v_new_ups FLOAT;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF v_profile IS NULL THEN
    RETURN QUERY SELECT FALSE, 0.0::FLOAT, 'User not found'::TEXT;
    RETURN;
  END IF;
  
  v_days_away := EXTRACT(DAY FROM (now() - v_profile.last_active_at))::INTEGER;
  
  -- Only apply forgiveness if user was away 7+ days and has reduced UPS
  IF v_days_away < 7 OR v_profile.ups >= 0.7 THEN
    RETURN QUERY SELECT TRUE, 0.0::FLOAT, 'No forgiveness needed'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate forgiveness boost (proportional to time away, capped)
  -- Max boost of 0.15 UPS for users returning after long absence
  v_boost := LEAST(0.15, (v_days_away::FLOAT / 90.0) * 0.15);
  v_new_ups := LEAST(1.0, v_profile.ups + v_boost);
  
  -- Apply the boost
  UPDATE profiles 
  SET ups = v_new_ups, 
      trust_state = calculate_trust_state(v_new_ups),
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Log the forgiveness
  INSERT INTO ups_history (user_id, previous_ups, new_ups, delta, reason)
  VALUES (p_user_id, v_profile.ups, v_new_ups, v_boost, 'ups_forgiveness_return_after_' || v_days_away || '_days');
  
  RETURN QUERY SELECT TRUE, v_boost, 
    ('UPS boosted by ' || ROUND(v_boost, 3) || ' for returning after ' || v_days_away || ' days')::TEXT;
END;
$$;

-- 4. Get users eligible for decay processing (inactive 31+ days with balance)
CREATE OR REPLACE FUNCTION public.get_decay_eligible_users()
RETURNS TABLE(user_id UUID, days_inactive INTEGER, balance FLOAT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, 
    EXTRACT(DAY FROM (now() - p.last_active_at))::INTEGER as days_inactive,
    get_verified_balance(p.id) as balance
  FROM profiles p
  WHERE p.last_active_at < now() - INTERVAL '31 days'
    AND get_verified_balance(p.id) > 0
  ORDER BY p.last_active_at ASC
  LIMIT 100; -- Process in batches
END;
$$;
