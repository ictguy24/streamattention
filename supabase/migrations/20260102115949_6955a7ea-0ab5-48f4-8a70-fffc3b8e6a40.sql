-- Daily AC ceiling enforcement per trust tier
-- Add ceiling tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_ac_earned double precision DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_ac_reset_at timestamp with time zone DEFAULT now();

-- Create posts/content table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'image', 'audio', 'text')),
  title TEXT,
  description TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  cover_image_url TEXT,
  duration_ms INTEGER,
  
  -- Music attachment
  music_url TEXT,
  music_volume FLOAT DEFAULT 1.0 CHECK (music_volume >= 0 AND music_volume <= 1),
  original_volume FLOAT DEFAULT 1.0 CHECK (original_volume >= 0 AND original_volume <= 1),
  music_source TEXT CHECK (music_source IN ('upload', 'library')),
  music_title TEXT,
  
  -- Engagement
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Metadata
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Hashtags table
CREATE TABLE public.hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Post hashtags junction
CREATE TABLE public.post_hashtags (
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, hashtag_id)
);

-- User interests for algorithmic matching
CREATE TABLE public.user_interests (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
  interest_score FLOAT DEFAULT 1.0,
  source TEXT CHECK (source IN ('onboarding', 'engagement', 'follow')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (user_id, hashtag_id)
);

-- Music library for built-in tracks
CREATE TABLE public.music_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  genre TEXT,
  duration_ms INTEGER,
  audio_url TEXT NOT NULL,
  preview_url TEXT,
  is_active BOOLEAN DEFAULT true,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_library ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Public posts viewable by everyone" ON public.posts
FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own posts" ON public.posts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create posts" ON public.posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.posts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.posts
FOR DELETE USING (auth.uid() = user_id);

-- Hashtags policies (public read)
CREATE POLICY "Hashtags viewable by everyone" ON public.hashtags
FOR SELECT USING (true);

CREATE POLICY "Authenticated can create hashtags" ON public.hashtags
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Post hashtags policies
CREATE POLICY "Post hashtags viewable by everyone" ON public.post_hashtags
FOR SELECT USING (true);

CREATE POLICY "Users can add hashtags to own posts" ON public.post_hashtags
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid())
);

CREATE POLICY "Users can remove hashtags from own posts" ON public.post_hashtags
FOR DELETE USING (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND user_id = auth.uid())
);

-- User interests policies
CREATE POLICY "Users can view own interests" ON public.user_interests
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own interests" ON public.user_interests
FOR ALL USING (auth.uid() = user_id);

-- Music library policies (public read)
CREATE POLICY "Music library viewable by everyone" ON public.music_library
FOR SELECT USING (is_active = true);

-- Function to get daily AC ceiling based on trust state
CREATE OR REPLACE FUNCTION public.get_daily_ac_ceiling(p_trust_state trust_state)
RETURNS TABLE(min_ac FLOAT, max_ac FLOAT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE p_trust_state
      WHEN 'cold' THEN 8.0
      WHEN 'warm' THEN 18.0
      WHEN 'active' THEN 35.0
      WHEN 'trusted' THEN 60.0
      ELSE 8.0
    END as min_ac,
    CASE p_trust_state
      WHEN 'cold' THEN 15.0
      WHEN 'warm' THEN 30.0
      WHEN 'active' THEN 55.0
      WHEN 'trusted' THEN 90.0
      ELSE 15.0
    END as max_ac;
END;
$$;

-- Function to check/reset daily AC tracking
CREATE OR REPLACE FUNCTION public.check_daily_ac_reset(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET daily_ac_earned = 0,
      daily_ac_reset_at = now()
  WHERE id = p_user_id
    AND daily_ac_reset_at < now() - INTERVAL '24 hours';
END;
$$;

-- Update mint_verified_ac to enforce daily ceiling
CREATE OR REPLACE FUNCTION public.mint_verified_ac(
  p_user_id uuid, 
  p_session_id uuid, 
  p_target_id uuid, 
  p_interaction_type interaction_type, 
  p_duration_ms integer DEFAULT NULL, 
  p_content_hash text DEFAULT NULL, 
  p_context_hash text DEFAULT NULL, 
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE(interaction_id uuid, verified_ac double precision)
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
  v_profile RECORD;
  v_ceiling RECORD;
  v_remaining_capacity FLOAT;
BEGIN
  -- Reset daily tracking if needed
  PERFORM check_daily_ac_reset(p_user_id);
  
  -- Get profile with trust state and daily earnings
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  IF v_profile IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, 0.0::FLOAT;
    RETURN;
  END IF;
  
  -- Get ceiling for this trust level
  SELECT * INTO v_ceiling FROM get_daily_ac_ceiling(v_profile.trust_state);
  
  -- Calculate remaining capacity (randomized within tier range)
  v_remaining_capacity := (v_ceiling.min_ac + (random() * (v_ceiling.max_ac - v_ceiling.min_ac))) - v_profile.daily_ac_earned;
  
  -- If already at ceiling, return 0
  IF v_remaining_capacity <= 0 THEN
    RETURN QUERY SELECT NULL::UUID, 0.0::FLOAT;
    RETURN;
  END IF;
  
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
  
  -- 5. Calculate final verified AC (capped to remaining capacity)
  v_verified_ac := LEAST(v_raw_ac * v_quality_factor * v_verification_ratio, v_remaining_capacity);
  
  -- 6. Insert into attention ledger
  INSERT INTO attention_ledger (
    user_id, interaction_id, raw_ac, quality_factor, verification_ratio, verified_ac
  )
  VALUES (
    p_user_id, v_interaction_id, v_raw_ac, v_quality_factor, v_verification_ratio, v_verified_ac
  );
  
  -- 7. Update daily tracking
  UPDATE profiles 
  SET daily_ac_earned = daily_ac_earned + v_verified_ac,
      last_active_at = now(),
      updated_at = now()
  WHERE id = p_user_id;
  
  -- 8. Small UPS boost for engagement
  PERFORM update_ups(p_user_id, 0.001, 'interaction_' || p_interaction_type::text);
  
  RETURN QUERY SELECT v_interaction_id, v_verified_ac;
END;
$$;

-- Function to get personalized feed based on algorithmic blend
CREATE OR REPLACE FUNCTION public.get_personalized_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  post_id UUID,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  content_type TEXT,
  title TEXT,
  description TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  cover_image_url TEXT,
  music_url TEXT,
  music_volume FLOAT,
  original_volume FLOAT,
  music_title TEXT,
  like_count INTEGER,
  comment_count INTEGER,
  view_count INTEGER,
  created_at TIMESTAMPTZ,
  relevance_score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH user_hashtag_interests AS (
    SELECT hashtag_id, interest_score FROM user_interests WHERE user_id = p_user_id
  ),
  followed_users AS (
    SELECT following_id FROM follows WHERE follower_id = p_user_id
  ),
  scored_posts AS (
    SELECT 
      p.id as post_id,
      p.user_id,
      pr.username,
      pr.display_name,
      pr.avatar_url,
      p.content_type,
      p.title,
      p.description,
      p.media_url,
      p.thumbnail_url,
      p.cover_image_url,
      p.music_url,
      p.music_volume,
      p.original_volume,
      p.music_title,
      p.like_count,
      p.comment_count,
      p.view_count,
      p.created_at,
      -- Relevance scoring: interests + follows + recency + engagement
      (
        COALESCE((
          SELECT SUM(uhi.interest_score) 
          FROM post_hashtags ph 
          JOIN user_hashtag_interests uhi ON ph.hashtag_id = uhi.hashtag_id 
          WHERE ph.post_id = p.id
        ), 0) * 2 +
        CASE WHEN p.user_id IN (SELECT following_id FROM followed_users) THEN 5 ELSE 0 END +
        (1.0 / GREATEST(1, EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600)) * 3 +
        (LOG(GREATEST(1, p.view_count)) + LOG(GREATEST(1, p.like_count * 2)))
      ) as relevance_score
    FROM posts p
    JOIN profiles pr ON p.user_id = pr.id
    WHERE p.is_public = true
      AND p.user_id != p_user_id
  )
  SELECT * FROM scored_posts
  ORDER BY relevance_score DESC, created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for posts bucket
CREATE POLICY "Post media publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Users can upload post media" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own post media" ON storage.objects
FOR UPDATE USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own post media" ON storage.objects
FOR DELETE USING (bucket_id = 'posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create index for feed performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag_id ON post_hashtags(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);

-- Enable realtime for posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;