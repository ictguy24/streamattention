
-- 1. Fix feed algorithm: exclude own posts, filter by stream destination, add randomization
CREATE OR REPLACE FUNCTION public.get_personalized_feed(p_user_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS TABLE(post_id uuid, user_id uuid, username text, display_name text, avatar_url text, content_type text, title text, description text, media_url text, thumbnail_url text, cover_image_url text, music_url text, music_volume double precision, original_volume double precision, music_title text, like_count integer, comment_count integer, view_count integer, created_at timestamp with time zone, relevance_score double precision, destinations text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
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
        (1.0 / GREATEST(1, EXTRACT(EPOCH FROM (now() - p.created_at)) / 3600)) * 3 +
        (LOG(GREATEST(1, p.view_count)) + LOG(GREATEST(1, p.like_count * 2))) +
        (random() * 2)
      ) as relevance_score
    FROM posts p
    JOIN profiles_public pp ON p.user_id = pp.id
    WHERE p.is_public = true
      AND p.user_id != p_user_id
      AND 'stream' = ANY(p.destinations)
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
$function$;

-- 2. Fix companions feed to also filter by stream destination
CREATE OR REPLACE FUNCTION public.get_followed_posts(p_user_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS TABLE(post_id uuid, user_id uuid, username text, display_name text, avatar_url text, content_type text, title text, description text, media_url text, thumbnail_url text, cover_image_url text, music_url text, music_volume double precision, original_volume double precision, music_title text, like_count integer, comment_count integer, view_count integer, created_at timestamp with time zone, destinations text[])
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
    p.created_at,
    p.destinations
  FROM posts p
  JOIN profiles_public pp ON p.user_id = pp.id
  WHERE p.is_public = true
    AND p.user_id IN (SELECT f.following_id FROM follows f WHERE f.follower_id = p_user_id)
    AND 'stream' = ANY(p.destinations)
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$function$;

-- 3. Create milestone notification trigger
CREATE OR REPLACE FUNCTION public.handle_like_milestone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_post RECORD;
  v_new_count INTEGER;
  v_milestone INTEGER;
  v_milestones INTEGER[] := ARRAY[10, 50, 100, 500, 1000, 5000, 10000];
BEGIN
  -- Update the post like count
  UPDATE posts SET like_count = COALESCE(like_count, 0) + 1 WHERE id = NEW.post_id
  RETURNING * INTO v_post;
  
  IF v_post IS NULL THEN RETURN NEW; END IF;
  
  v_new_count := v_post.like_count;
  
  -- Check if we hit a milestone
  FOREACH v_milestone IN ARRAY v_milestones LOOP
    IF v_new_count = v_milestone THEN
      INSERT INTO notifications (user_id, type, content_id, message)
      VALUES (v_post.user_id, 'milestone', v_post.id, 
        'Your post hit ' || v_milestone || ' likes! 🎉');
      EXIT;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Drop old like count trigger if exists and create new one
DROP TRIGGER IF EXISTS on_like_milestone ON public.likes;
CREATE TRIGGER on_like_milestone
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_like_milestone();

-- Also handle unlike (decrement)
CREATE OR REPLACE FUNCTION public.handle_unlike_decrement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE posts SET like_count = GREATEST(0, COALESCE(like_count, 0) - 1) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_unlike_decrement ON public.likes;
CREATE TRIGGER on_unlike_decrement
  AFTER DELETE ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_unlike_decrement();
