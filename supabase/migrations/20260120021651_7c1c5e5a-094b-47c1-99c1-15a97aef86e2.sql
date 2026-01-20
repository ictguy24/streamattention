-- Create a public view with only safe-to-share fields
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  username,
  display_name,
  avatar_url,
  bio,
  created_at
FROM public.profiles;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Users can only see their OWN full profile (keep existing policy name)
-- The "Users can view their own profile" policy already exists

-- Fix follows table - restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view follows" ON public.follows;
CREATE POLICY "Authenticated users can view follows"
ON public.follows FOR SELECT
TO authenticated
USING (true);

-- Fix likes table - restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can see likes" ON public.likes;
CREATE POLICY "Authenticated users can view likes"
ON public.likes FOR SELECT
TO authenticated
USING (true);