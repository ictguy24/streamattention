-- Notification triggers for automatic notification creation

-- Function to create follow notification
CREATE OR REPLACE FUNCTION public.create_follow_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, actor_id, message, is_read)
  VALUES (NEW.following_id, 'follow', NEW.follower_id, 'started following you', false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to create like notification
CREATE OR REPLACE FUNCTION public.create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id uuid;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- Don't notify if user likes their own post
  IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, content_id, message, is_read)
    VALUES (post_owner_id, 'like', NEW.user_id, NEW.post_id, 'liked your post', false);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to create comment notification
CREATE OR REPLACE FUNCTION public.create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id uuid;
  parent_comment_owner_id uuid;
BEGIN
  -- Get the post owner
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  -- If this is a reply, also notify the parent comment owner
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_comment_owner_id FROM public.comments WHERE id = NEW.parent_id;
    
    -- Notify parent comment owner (if not themselves)
    IF parent_comment_owner_id IS NOT NULL AND parent_comment_owner_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, actor_id, content_id, message, is_read)
      VALUES (parent_comment_owner_id, 'comment', NEW.user_id, NEW.post_id, 'replied to your comment', false);
    END IF;
  END IF;
  
  -- Notify post owner (if not themselves and not the parent comment owner)
  IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id AND post_owner_id != parent_comment_owner_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, content_id, message, is_read)
    VALUES (post_owner_id, 'comment', NEW.user_id, NEW.post_id, 'commented on your post', false);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_follow_create_notification ON public.follows;
DROP TRIGGER IF EXISTS on_like_create_notification ON public.likes;
DROP TRIGGER IF EXISTS on_comment_create_notification ON public.comments;

-- Create triggers
CREATE TRIGGER on_follow_create_notification
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.create_follow_notification();

CREATE TRIGGER on_like_create_notification
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.create_like_notification();

CREATE TRIGGER on_comment_create_notification
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_comment_notification();