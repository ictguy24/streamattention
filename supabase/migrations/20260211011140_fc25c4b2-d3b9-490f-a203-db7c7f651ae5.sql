
-- Remove ALL duplicate triggers causing double notifications
DROP TRIGGER IF EXISTS on_follow_create_notification ON public.follows;
DROP TRIGGER IF EXISTS on_like_create_notification ON public.likes;
DROP TRIGGER IF EXISTS on_comment_create_notification ON public.comments;
DROP TRIGGER IF EXISTS ensure_follow_notification ON public.follows;
DROP TRIGGER IF EXISTS notify_on_follow ON public.follows;
DROP TRIGGER IF EXISTS notify_on_like ON public.likes;
DROP TRIGGER IF EXISTS notify_on_comment ON public.comments;

-- Clean up old duplicate functions with CASCADE
DROP FUNCTION IF EXISTS public.create_follow_notification() CASCADE;
DROP FUNCTION IF EXISTS public.create_like_notification() CASCADE;
DROP FUNCTION IF EXISTS public.create_comment_notification() CASCADE;
