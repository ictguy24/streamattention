-- Fix RPC functions to use profiles_public view instead of profiles table
-- This allows logged-in users to see content from all users while keeping profile data secure

-- 1. Update get_personalized_feed to use profiles_public view
CREATE OR REPLACE FUNCTION public.get_personalized_feed(p_user_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS TABLE(post_id uuid, user_id uuid, username text, display_name text, avatar_url text, content_type text, title text, description text, media_url text, thumbnail_url text, cover_image_url text, music_url text, music_volume double precision, original_volume double precision, music_title text, like_count integer, comment_count integer, view_count integer, created_at timestamp with time zone, relevance_score double precision)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_total_posts INTEGER;
BEGIN
  -- Check total post count for cold start
  SELECT COUNT(*) INTO v_total_posts FROM posts WHERE is_public = true;
  
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
        CASE WHEN p.user_id IN (SELECT following_id FROM followed_users) THEN 5 ELSE 0 END +
        -- Include own posts with slight boost during cold start
        CASE WHEN p.user_id = p_user_id AND v_total_posts < 50 THEN 3 ELSE 0 END +
        (1.0 / GREATEST(1, EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600)) * 3 +
        (LOG(GREATEST(1, p.view_count)) + LOG(GREATEST(1, p.like_count * 2)))
      ) as relevance_score
    FROM posts p
    JOIN profiles_public pp ON p.user_id = pp.id
    WHERE p.is_public = true
      -- Include own posts during cold start, otherwise exclude
      AND (v_total_posts < 50 OR p.user_id != p_user_id)
  )
  SELECT * FROM scored_posts
  ORDER BY relevance_score DESC, created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;

-- 2. Update get_followed_posts to use profiles_public view
CREATE OR REPLACE FUNCTION public.get_followed_posts(p_user_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS TABLE(post_id uuid, user_id uuid, username text, display_name text, avatar_url text, content_type text, title text, description text, media_url text, thumbnail_url text, cover_image_url text, music_url text, music_volume double precision, original_volume double precision, music_title text, like_count integer, comment_count integer, view_count integer, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    AND p.user_id IN (SELECT following_id FROM follows WHERE follower_id = p_user_id)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;