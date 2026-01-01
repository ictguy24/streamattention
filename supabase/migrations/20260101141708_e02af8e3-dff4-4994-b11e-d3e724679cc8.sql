
-- =====================================================
-- ATTENTION SUPER SERVER - PHASE 1: DATABASE SCHEMA
-- =====================================================

-- 1. Create ENUMs
CREATE TYPE account_type AS ENUM ('user', 'creator', 'both');
CREATE TYPE trust_state AS ENUM ('cold', 'warm', 'active', 'trusted');
CREATE TYPE interaction_type AS ENUM (
  'like', 'emoji_comment', 'sentence_comment', 'insightful_comment',
  'thread_read', 'video_watch', 'save', 'post', 'voice_message', 'video_message'
);
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- 2. Enhance profiles table with UPS and trust tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type account_type DEFAULT 'user',
ADD COLUMN IF NOT EXISTS ups FLOAT DEFAULT 0.5 CHECK (ups >= 0.0 AND ups <= 1.0),
ADD COLUMN IF NOT EXISTS trust_state trust_state DEFAULT 'cold',
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT now();

-- 3. Create sessions table (device/timing tracking)
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint_hash TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  abnormal_flag BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create interactions table (immutable log)
CREATE TABLE public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  target_id UUID,
  interaction_type interaction_type NOT NULL,
  duration_ms INTEGER,
  content_hash TEXT,
  context_hash TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create attention_ledger table (append-only AC records)
CREATE TABLE public.attention_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_id UUID REFERENCES public.interactions(id) ON DELETE SET NULL,
  raw_ac FLOAT NOT NULL,
  quality_factor FLOAT NOT NULL CHECK (quality_factor >= 0.4 AND quality_factor <= 1.0),
  verification_ratio FLOAT NOT NULL CHECK (verification_ratio >= 0.0 AND verification_ratio <= 1.0),
  verified_ac FLOAT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create ups_history table (UPS change tracking)
CREATE TABLE public.ups_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  previous_ups FLOAT NOT NULL,
  new_ups FLOAT NOT NULL,
  delta FLOAT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create payouts table (withdrawal records)
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id TEXT,
  amount_ac BIGINT NOT NULL,
  amount_fiat DECIMAL(10,2),
  status payout_status DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- 8. Enable RLS on all new tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attention_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ups_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for sessions
CREATE POLICY "Users can view own sessions"
ON public.sessions FOR SELECT
USING (auth.uid() = user_id);

-- 10. RLS Policies for interactions (insert via service role only)
CREATE POLICY "Users can view own interactions"
ON public.interactions FOR SELECT
USING (auth.uid() = user_id);

-- 11. RLS Policies for attention_ledger (insert via service role only)
CREATE POLICY "Users can view own ledger entries"
ON public.attention_ledger FOR SELECT
USING (auth.uid() = user_id);

-- 12. RLS Policies for ups_history
CREATE POLICY "Users can view own UPS history"
ON public.ups_history FOR SELECT
USING (auth.uid() = user_id);

-- 13. RLS Policies for payouts
CREATE POLICY "Users can view own payouts"
ON public.payouts FOR SELECT
USING (auth.uid() = user_id);

-- 14. Create indexes for performance
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_start_time ON public.sessions(start_time DESC);
CREATE INDEX idx_interactions_user_id ON public.interactions(user_id);
CREATE INDEX idx_interactions_session_id ON public.interactions(session_id);
CREATE INDEX idx_interactions_created_at ON public.interactions(created_at DESC);
CREATE INDEX idx_attention_ledger_user_id ON public.attention_ledger(user_id);
CREATE INDEX idx_attention_ledger_created_at ON public.attention_ledger(created_at DESC);
CREATE INDEX idx_ups_history_user_id ON public.ups_history(user_id);
CREATE INDEX idx_payouts_user_id ON public.payouts(user_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);

-- 15. Enable realtime for attention_ledger (for balance updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.attention_ledger;
