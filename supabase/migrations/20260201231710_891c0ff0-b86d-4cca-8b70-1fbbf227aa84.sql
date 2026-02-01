-- Fix get_personalized_feed with explicit table aliases to avoid ambiguous column references
CREATE OR REPLACE FUNCTION public.get_personalized_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
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
  music_volume DOUBLE PRECISION,
  original_volume DOUBLE PRECISION,
  music_title TEXT,
  like_count INTEGER,
  comment_count INTEGER,
  view_count INTEGER,
  created_at TIMESTAMPTZ,
  relevance_score DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_posts INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_posts FROM posts WHERE posts.is_public = true;
  
  RETURN QUERY
  WITH user_hashtag_interests AS (
    SELECT ui.hashtag_id, ui.interest_score 
    FROM user_interests ui 
    WHERE ui.user_id = p_user_id
  ),
  followed_users AS (
    SELECT f.following_id FROM follows f WHERE f.follower_id = p_user_id
  ),
  scored_posts AS (
    SELECT 
      p.id as post_id,
      p.user_id,
      pp.username,
      pp.display_name,
      pp.avatar_url,
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
      (
        COALESCE((
          SELECT SUM(uhi.interest_score) 
          FROM post_hashtags ph 
          JOIN user_hashtag_interests uhi ON ph.hashtag_id = uhi.hashtag_id 
          WHERE ph.post_id = p.id
        ), 0) * 2 +
        CASE WHEN p.user_id IN (SELECT fu.following_id FROM followed_users fu) THEN 5 ELSE 0 END +
        CASE WHEN p.user_id = p_user_id AND v_total_posts < 50 THEN 3 ELSE 0 END +
        (1.0 / GREATEST(1, EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600)) * 3 +
        (LOG(GREATEST(1, p.view_count)) + LOG(GREATEST(1, p.like_count * 2)))
      ) as relevance_score
    FROM posts p
    JOIN profiles_public pp ON p.user_id = pp.id
    WHERE p.is_public = true
      AND (v_total_posts < 50 OR p.user_id != p_user_id)
  )
  SELECT sp.post_id, sp.user_id, sp.username, sp.display_name, sp.avatar_url, 
         sp.content_type, sp.title, sp.description, sp.media_url, sp.thumbnail_url,
         sp.cover_image_url, sp.music_url, sp.music_volume, sp.original_volume,
         sp.music_title, sp.like_count, sp.comment_count, sp.view_count,
         sp.created_at, sp.relevance_score
  FROM scored_posts sp
  ORDER BY sp.relevance_score DESC, sp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Fix get_followed_posts with explicit table aliases
CREATE OR REPLACE FUNCTION public.get_followed_posts(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
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
  music_volume DOUBLE PRECISION,
  original_volume DOUBLE PRECISION,
  music_title TEXT,
  like_count INTEGER,
  comment_count INTEGER,
  view_count INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as post_id,
    p.user_id,
    pp.username,
    pp.display_name,
    pp.avatar_url,
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
    p.created_at
  FROM posts p
  JOIN profiles_public pp ON p.user_id = pp.id
  WHERE p.is_public = true
    AND p.user_id IN (SELECT f.following_id FROM follows f WHERE f.follower_id = p_user_id)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Ensure follow notification trigger exists
CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, actor_id, message, is_read)
  VALUES (NEW.following_id, 'follow', NEW.follower_id, 'started following you', false);
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger to ensure it's active
DROP TRIGGER IF EXISTS notify_on_follow ON follows;
CREATE TRIGGER notify_on_follow
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION create_follow_notification();