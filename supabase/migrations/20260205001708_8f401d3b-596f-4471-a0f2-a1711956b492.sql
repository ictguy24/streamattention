
-- Enable realtime on additional tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Create notification trigger function for follows
CREATE OR REPLACE FUNCTION public.handle_follow_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, actor_id, message)
  VALUES (
    NEW.following_id,
    'follow',
    NEW.follower_id,
    'started following you'
  );
  RETURN NEW;
END;
$$;

-- Create trigger on follows table
DROP TRIGGER IF EXISTS on_follow_notification ON public.follows;
CREATE TRIGGER on_follow_notification
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_follow_notification();

-- Create notification trigger function for likes
CREATE OR REPLACE FUNCTION public.handle_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id uuid;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Don't notify if user liked their own post
  IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, content_id, message)
    VALUES (
      post_owner_id,
      'like',
      NEW.user_id,
      NEW.post_id,
      'liked your post'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on likes table
DROP TRIGGER IF EXISTS on_like_notification ON public.likes;
CREATE TRIGGER on_like_notification
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_like_notification();

-- Create notification trigger function for comments
CREATE OR REPLACE FUNCTION public.handle_comment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id uuid;
  parent_author_id uuid;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Notify post owner (if not self)
  IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, content_id, message)
    VALUES (
      post_owner_id,
      'comment',
      NEW.user_id,
      NEW.post_id,
      'commented on your post'
    );
  END IF;
  
  -- If this is a reply, also notify parent comment author
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_author_id FROM public.comments WHERE id = NEW.parent_id;
    
    IF parent_author_id IS NOT NULL AND parent_author_id != NEW.user_id AND parent_author_id != post_owner_id THEN
      INSERT INTO public.notifications (user_id, type, actor_id, content_id, message)
      VALUES (
        parent_author_id,
        'comment',
        NEW.user_id,
        NEW.post_id,
        'replied to your comment'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on comments table
DROP TRIGGER IF EXISTS on_comment_notification ON public.comments;
CREATE TRIGGER on_comment_notification
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_comment_notification();
