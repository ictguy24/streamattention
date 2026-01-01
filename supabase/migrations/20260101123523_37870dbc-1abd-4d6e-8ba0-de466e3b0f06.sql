-- Create follows table for follower/following relationships
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view follows"
ON public.follows FOR SELECT
USING (true);

CREATE POLICY "Users can follow others"
ON public.follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
ON public.follows FOR DELETE
USING (auth.uid() = follower_id);

-- Create withdrawal processing function
CREATE OR REPLACE FUNCTION public.process_withdrawal(p_user_id UUID, p_amount BIGINT)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet RECORD;
  v_withdrawable BIGINT;
BEGIN
  -- Get wallet
  SELECT * INTO v_wallet FROM wallets WHERE user_id = p_user_id;
  
  IF v_wallet IS NULL THEN
    RETURN QUERY SELECT FALSE, 'No wallet found'::TEXT;
    RETURN;
  END IF;
  
  -- Check if frozen
  IF v_wallet.withdrawal_frozen THEN
    RETURN QUERY SELECT FALSE, 'Withdrawals are currently frozen'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate withdrawable
  v_withdrawable := calculate_withdrawable_balance(p_user_id);
  
  IF p_amount > v_withdrawable THEN
    RETURN QUERY SELECT FALSE, 'Amount exceeds withdrawable balance'::TEXT;
    RETURN;
  END IF;
  
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 'Invalid withdrawal amount'::TEXT;
    RETURN;
  END IF;
  
  -- Process withdrawal
  UPDATE wallets
  SET ac_balance = ac_balance - p_amount,
      lifetime_withdrawn = lifetime_withdrawn + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT TRUE, 'Withdrawal processed successfully'::TEXT;
END;
$$;