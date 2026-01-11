-- Fix overly permissive notification insert policy
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Allow notification creation" ON public.notifications;

-- Create a more restrictive policy: only allow authenticated users to create notifications where they are the actor
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (actor_id IS NULL OR auth.uid() = actor_id));