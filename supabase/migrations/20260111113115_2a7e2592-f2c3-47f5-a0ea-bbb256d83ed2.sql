-- Achievement definitions
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'trophy',
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  requirement_type TEXT NOT NULL, -- 'posts', 'likes', 'followers', 'ac_earned', 'streak', 'views', 'comments'
  requirement_count INTEGER NOT NULL DEFAULT 1,
  ac_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Anyone can view achievements
CREATE POLICY "Anyone can view achievements"
ON achievements FOR SELECT
USING (true);

-- User achievement progress
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can view own achievements
CREATE POLICY "Users can view own achievements"
ON user_achievements FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert own achievements
CREATE POLICY "Users can insert own achievements"
ON user_achievements FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own achievements
CREATE POLICY "Users can update own achievements"
ON user_achievements FOR UPDATE
USING (auth.uid() = user_id);

-- User streaks table
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Users can view own streaks
CREATE POLICY "Users can view own streaks"
ON user_streaks FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert own streaks
CREATE POLICY "Users can insert own streaks"
ON user_streaks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own streaks
CREATE POLICY "Users can update own streaks"
ON user_streaks FOR UPDATE
USING (auth.uid() = user_id);

-- Seed default achievements
INSERT INTO achievements (name, description, icon, rarity, requirement_type, requirement_count, ac_reward) VALUES
('First Steps', 'Earn your first AC', 'star', 'common', 'ac_earned', 1, 5),
('Content Creator', 'Post 10 pieces of content', 'video', 'common', 'posts', 10, 25),
('Socialite', 'Get 100 likes on your posts', 'heart', 'rare', 'likes', 100, 50),
('Trendsetter', 'Have a post reach 1000 views', 'eye', 'rare', 'views', 1000, 75),
('Conversation Starter', 'Receive 50 comments', 'message-circle', 'rare', 'comments', 50, 50),
('Community Builder', 'Gain 500 followers', 'users', 'epic', 'followers', 500, 150),
('On Fire', 'Maintain a 7-day streak', 'flame', 'epic', 'streak', 7, 100),
('Legend', 'Earn 10,000 AC total', 'award', 'legendary', 'ac_earned', 10000, 500);