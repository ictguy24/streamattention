-- Drop and recreate get_personalized_feed with destinations
DROP FUNCTION IF EXISTS public.get_personalized_feed(uuid, integer, integer);

CREATE FUNCTION public.get_personalized_feed(p_user_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
RETURNS TABLE (
  post_id uuid,
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  content_type text,
  title text,
  description text,
  media_url text,
  thumbnail_url text,
  cover_image_url text,
  music_url text,
  music_volume double precision,
  original_volume double precision,
  music_title text,
  like_count integer,
  comment_count integer,
  view_count integer,
  created_at timestamp with time zone,
  relevance_score double precision,
  destinations text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_total_posts INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_posts FROM posts p WHERE p.is_public = true;
  
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
      p.destinations,
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
  SELECT 
    sp.post_id,
    sp.user_id,
    sp.username,
    sp.display_name,
    sp.avatar_url,
    sp.content_type,
    sp.title,
    sp.description,
    sp.media_url,
    sp.thumbnail_url,
    sp.cover_image_url,
    sp.music_url,
    sp.music_volume,
    sp.original_volume,
    sp.music_title,
    sp.like_count,
    sp.comment_count,
    sp.view_count,
    sp.created_at,
    sp.relevance_score,
    sp.destinations
  FROM scored_posts sp
  ORDER BY sp.relevance_score DESC, sp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- Drop and recreate get_followed_posts with destinations
DROP FUNCTION IF EXISTS public.get_followed_posts(uuid, integer, integer);

CREATE FUNCTION public.get_followed_posts(p_user_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
RETURNS TABLE (
  post_id uuid,
  user_id uuid,
  username text,
  display_name text,
  avatar_url text,
  content_type text,
  title text,
  description text,
  media_url text,
  thumbnail_url text,
  cover_image_url text,
  music_url text,
  music_volume double precision,
  original_volume double precision,
  music_title text,
  like_count integer,
  comment_count integer,
  view_count integer,
  created_at timestamp with time zone,
  destinations text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
    p.created_at,
    p.destinations
  FROM posts p
  JOIN profiles_public pp ON p.user_id = pp.id
  WHERE p.is_public = true
    AND p.user_id IN (SELECT f.following_id FROM follows f WHERE f.follower_id = p_user_id)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;