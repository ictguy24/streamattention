
-- =====================================================
-- ATTENTION SUPER SERVER - PHASE 2: DATABASE FUNCTIONS
-- =====================================================

-- 1. Get interaction band based on type
CREATE OR REPLACE FUNCTION public.get_interaction_band(p_type interaction_type)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE p_type
    WHEN 'like' THEN 'low'
    WHEN 'emoji_comment' THEN 'low'
    WHEN 'sentence_comment' THEN 'medium'
    WHEN 'thread_read' THEN 'medium'
    WHEN 'video_watch' THEN 'medium'
    WHEN 'insightful_comment' THEN 'high'
    WHEN 'save' THEN 'high'
    WHEN 'post' THEN 'premium'
    WHEN 'voice_message' THEN 'premium'
    WHEN 'video_message' THEN 'premium'
    ELSE 'low'
  END;
END;
$$;

-- 2. Calculate raw AC based on interaction type (random within band)
CREATE OR REPLACE FUNCTION public.calculate_raw_ac(p_type interaction_type)
RETURNS FLOAT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_band TEXT;
  v_min FLOAT;
  v_max FLOAT;
BEGIN
  v_band := get_interaction_band(p_type);
  
  CASE v_band
    WHEN 'low' THEN v_min := 0.1; v_max := 0.4;
    WHEN 'medium' THEN v_min := 0.6; v_max := 1.2;
    WHEN 'high' THEN v_min := 1.8; v_max := 3.5;
    WHEN 'premium' THEN v_min := 5.0; v_max := 12.0;
    ELSE v_min := 0.1; v_max := 0.4;
  END CASE;
  
  -- Random value within range
  RETURN v_min + (random() * (v_max - v_min));
END;
$$;

-- 3. Calculate quality factor based on interaction metadata
CREATE OR REPLACE FUNCTION public.calculate_quality_factor(
  p_type interaction_type,
  p_duration_ms INTEGER,
  p_metadata JSONB
)
RETURNS FLOAT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_quality FLOAT := 0.7;
  v_duration_bonus FLOAT := 0.0;
  v_content_bonus FLOAT := 0.0;
BEGIN
  -- Duration-based quality (for time-based interactions)
  IF p_type IN ('video_watch', 'thread_read') AND p_duration_ms IS NOT NULL THEN
    IF p_duration_ms >= 30000 THEN -- 30+ seconds
      v_duration_bonus := 0.15;
    ELSIF p_duration_ms >= 15000 THEN -- 15+ seconds
      v_duration_bonus := 0.1;
    ELSIF p_duration_ms >= 5000 THEN -- 5+ seconds
      v_duration_bonus := 0.05;
    ELSIF p_duration_ms < 2000 THEN -- Less than 2 seconds = low quality
      v_base_quality := 0.4;
    END IF;
  END IF;
  
  -- Content-based quality (for comments)
  IF p_type IN ('sentence_comment', 'insightful_comment') THEN
    IF p_metadata ? 'word_count' THEN
      IF (p_metadata->>'word_count')::int >= 20 THEN
        v_content_bonus := 0.15;
      ELSIF (p_metadata->>'word_count')::int >= 10 THEN
        v_content_bonus := 0.1;
      ELSIF (p_metadata->>'word_count')::int >= 5 THEN
        v_content_bonus := 0.05;
      END IF;
    END IF;
  END IF;
  
  -- Cap at 1.0
  RETURN LEAST(1.0, v_base_quality + v_duration_bonus + v_content_bonus);
END;
$$;

-- 4. Get verification ratio based on user UPS and trust state
CREATE OR REPLACE FUNCTION public.get_verification_ratio(p_user_id UUID)
RETURNS FLOAT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_base_ratio FLOAT;
  v_variance FLOAT;
BEGIN
  SELECT ups, trust_state INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF v_profile IS NULL THEN
    RETURN 0.5; -- Default for new users
  END IF;
  
  -- Base ratio from trust state
  CASE v_profile.trust_state
    WHEN 'cold' THEN v_base_ratio := 0.475; -- 0.40-0.55 range
    WHEN 'warm' THEN v_base_ratio := 0.65;  -- 0.55-0.75 range
    WHEN 'active' THEN v_base_ratio := 0.825; -- 0.75-0.90 range
    WHEN 'trusted' THEN v_base_ratio := 0.94; -- 0.90-0.98 range
    ELSE v_base_ratio := 0.5;
  END CASE;
  
  -- Add small random variance within range
  v_variance := (random() - 0.5) * 0.1;
  
  RETURN LEAST(0.98, GREATEST(0.4, v_base_ratio + v_variance));
END;
$$;

-- 5. Calculate trust state from UPS value
CREATE OR REPLACE FUNCTION public.calculate_trust_state(p_ups FLOAT)
RETURNS trust_state
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN CASE
    WHEN p_ups >= 0.85 THEN 'trusted'::trust_state
    WHEN p_ups >= 0.65 THEN 'active'::trust_state
    WHEN p_ups >= 0.40 THEN 'warm'::trust_state
    ELSE 'cold'::trust_state
  END;
END;
$$;

-- 6. Update UPS with history logging
CREATE OR REPLACE FUNCTION public.update_ups(
  p_user_id UUID,
  p_delta FLOAT,
  p_reason TEXT
)
RETURNS FLOAT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_ups FLOAT;
  v_new_ups FLOAT;
  v_new_trust trust_state;
BEGIN
  SELECT ups INTO v_current_ups FROM profiles WHERE id = p_user_id;
  
  IF v_current_ups IS NULL THEN
    v_current_ups := 0.5;
  END IF;
  
  -- Calculate new UPS (bounded 0.0-1.0)
  v_new_ups := LEAST(1.0, GREATEST(0.0, v_current_ups + p_delta));
  v_new_trust := calculate_trust_state(v_new_ups);
  
  -- Log to history
  INSERT INTO ups_history (user_id, previous_ups, new_ups, delta, reason)
  VALUES (p_user_id, v_current_ups, v_new_ups, p_delta, p_reason);
  
  -- Update profile
  UPDATE profiles 
  SET ups = v_new_ups, 
      trust_state = v_new_trust,
      last_active_at = now(),
      updated_at = now()
  WHERE id = p_user_id;
  
  RETURN v_new_ups;
END;
$$;

-- 7. Get user verified balance from attention_ledger
CREATE OR REPLACE FUNCTION public.get_verified_balance(p_user_id UUID)
RETURNS FLOAT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_earned FLOAT;
  v_total_withdrawn BIGINT;
BEGIN
  -- Sum all verified AC
  SELECT COALESCE(SUM(verified_ac), 0) INTO v_total_earned
  FROM attention_ledger
  WHERE user_id = p_user_id;
  
  -- Sum completed payouts
  SELECT COALESCE(SUM(amount_ac), 0) INTO v_total_withdrawn
  FROM payouts
  WHERE user_id = p_user_id AND status = 'completed';
  
  RETURN GREATEST(0, v_total_earned - v_total_withdrawn);
END;
$$;

-- 8. Main AC minting function (called from edge function)
CREATE OR REPLACE FUNCTION public.mint_verified_ac(
  p_user_id UUID,
  p_session_id UUID,
  p_target_id UUID,
  p_interaction_type interaction_type,
  p_duration_ms INTEGER DEFAULT NULL,
  p_content_hash TEXT DEFAULT NULL,
  p_context_hash TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(interaction_id UUID, verified_ac FLOAT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_interaction_id UUID;
  v_raw_ac FLOAT;
  v_quality_factor FLOAT;
  v_verification_ratio FLOAT;
  v_verified_ac FLOAT;
BEGIN
  -- 1. Create interaction record
  INSERT INTO interactions (
    user_id, session_id, target_id, interaction_type, 
    duration_ms, content_hash, context_hash, metadata
  )
  VALUES (
    p_user_id, p_session_id, p_target_id, p_interaction_type,
    p_duration_ms, p_content_hash, p_context_hash, p_metadata
  )
  RETURNING id INTO v_interaction_id;
  
  -- 2. Calculate raw AC
  v_raw_ac := calculate_raw_ac(p_interaction_type);
  
  -- 3. Calculate quality factor
  v_quality_factor := calculate_quality_factor(p_interaction_type, p_duration_ms, p_metadata);
  
  -- 4. Get verification ratio based on UPS
  v_verification_ratio := get_verification_ratio(p_user_id);
  
  -- 5. Calculate final verified AC
  v_verified_ac := v_raw_ac * v_quality_factor * v_verification_ratio;
  
  -- 6. Insert into attention ledger
  INSERT INTO attention_ledger (
    user_id, interaction_id, raw_ac, quality_factor, verification_ratio, verified_ac
  )
  VALUES (
    p_user_id, v_interaction_id, v_raw_ac, v_quality_factor, v_verification_ratio, v_verified_ac
  );
  
  -- 7. Update user's last active timestamp
  UPDATE profiles SET last_active_at = now() WHERE id = p_user_id;
  
  -- 8. Small UPS boost for engagement (diminishing returns built into quality)
  PERFORM update_ups(p_user_id, 0.001, 'interaction_' || p_interaction_type::text);
  
  RETURN QUERY SELECT v_interaction_id, v_verified_ac;
END;
$$;

-- 9. Create session function
CREATE OR REPLACE FUNCTION public.create_session(
  p_user_id UUID,
  p_device_hash TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  -- End any existing open sessions for this user
  UPDATE sessions 
  SET end_time = now()
  WHERE user_id = p_user_id AND end_time IS NULL;
  
  -- Create new session
  INSERT INTO sessions (user_id, device_fingerprint_hash, metadata)
  VALUES (p_user_id, p_device_hash, p_metadata)
  RETURNING id INTO v_session_id;
  
  -- Update last active
  UPDATE profiles SET last_active_at = now() WHERE id = p_user_id;
  
  RETURN v_session_id;
END;
$$;

-- 10. End session function
CREATE OR REPLACE FUNCTION public.end_session(
  p_session_id UUID,
  p_abnormal BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE sessions 
  SET end_time = now(), abnormal_flag = p_abnormal
  WHERE id = p_session_id AND end_time IS NULL;
  
  RETURN FOUND;
END;
$$;
