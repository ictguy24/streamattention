-- Add destinations column to posts for routing content
ALTER TABLE posts ADD COLUMN IF NOT EXISTS destinations TEXT[] DEFAULT ARRAY['stream'];

-- Create user_blocks table for mute/block functionality
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL DEFAULT 'block' CHECK (block_type IN ('block', 'mute')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS on user_blocks
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_blocks
CREATE POLICY "Users can view their own blocks"
  ON user_blocks FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks"
  ON user_blocks FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks"
  ON user_blocks FOR DELETE
  USING (auth.uid() = blocker_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);

-- Create function to start or get existing conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_user_id UUID, p_other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Check if conversation exists between these two users
  SELECT cp1.conversation_id INTO v_conversation_id
  FROM conversation_participants cp1
  JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
  WHERE cp1.user_id = p_user_id AND cp2.user_id = p_other_user_id
  LIMIT 1;
  
  -- If no conversation exists, create one
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations DEFAULT VALUES
    RETURNING id INTO v_conversation_id;
    
    -- Add both participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
      (v_conversation_id, p_user_id),
      (v_conversation_id, p_other_user_id);
  END IF;
  
  RETURN v_conversation_id;
END;
$$;