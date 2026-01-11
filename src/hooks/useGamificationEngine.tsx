import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  requirement_type: string;
  requirement_count: number;
  ac_reward: number;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  progress: number;
  unlocked_at: string | null;
  achievement: Achievement;
}

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

interface GamificationState {
  // Achievements
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  unlockedCount: number;
  totalCount: number;
  
  // Streaks
  streak: UserStreak | null;
  
  // AC Earning (from useACEarning)
  pendingAC: number;
  isEarning: boolean;
  speedMultiplier: number;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  startEarning: () => void;
  pauseEarning: () => void;
  flushEarnings: () => number;
  updateProgress: (type: string, increment?: number) => Promise<void>;
  checkAndUnlock: (achievementId: string) => Promise<boolean>;
  updateStreak: () => Promise<void>;
}

const BASE_EARN_RATE = 0.1; // AC per second at 1x speed
const SPEED_THRESHOLDS = [0.5, 1.0, 1.5, 2.0];
const SPEED_MULTIPLIERS = [0.25, 1.0, 0.75, 0.5];

export const useGamificationEngine = (): GamificationState => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // AC Earning State
  const [pendingAC, setPendingAC] = useState(0);
  const [isEarning, setIsEarning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const earnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Fetch all achievements
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("requirement_count", { ascending: true });
      
      if (error) throw error;
      return data as Achievement[];
    },
  });

  // Fetch user achievements
  const { data: userAchievements = [], isLoading: userAchievementsLoading } = useQuery({
    queryKey: ["user-achievements", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("user_achievements")
        .select(`
          id,
          achievement_id,
          progress,
          unlocked_at,
          achievement:achievements(*)
        `)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      // Map the data to flatten the achievement
      return (data || []).map((ua: any) => ({
        ...ua,
        achievement: ua.achievement as Achievement,
      })) as UserAchievement[];
    },
    enabled: !!user?.id,
  });

  // Fetch user streak
  const { data: streak } = useQuery({
    queryKey: ["user-streak", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data as UserStreak | null;
    },
    enabled: !!user?.id,
  });

  // Update achievement progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ type, increment = 1 }: { type: string; increment?: number }) => {
      if (!user?.id) return;
      
      // Find all achievements matching this type
      const matchingAchievements = achievements.filter(
        (a) => a.requirement_type === type
      );
      
      for (const achievement of matchingAchievements) {
        // Check if user already has this achievement tracked
        const existing = userAchievements.find(
          (ua) => ua.achievement_id === achievement.id
        );
        
        if (existing?.unlocked_at) continue; // Already unlocked
        
        const newProgress = (existing?.progress || 0) + increment;
        
        // Upsert the progress
        const { error } = await supabase
          .from("user_achievements")
          .upsert({
            user_id: user.id,
            achievement_id: achievement.id,
            progress: newProgress,
            unlocked_at: newProgress >= achievement.requirement_count ? new Date().toISOString() : null,
          }, {
            onConflict: "user_id,achievement_id",
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
    },
  });

  // Update streak
  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      
      let newStreak = 1;
      let longestStreak = streak?.longest_streak || 0;
      
      if (streak?.last_active_date === today) {
        // Already active today
        return;
      } else if (streak?.last_active_date === yesterday) {
        // Continuing streak
        newStreak = (streak.current_streak || 0) + 1;
      }
      
      if (newStreak > longestStreak) {
        longestStreak = newStreak;
      }
      
      const { error } = await supabase
        .from("user_streaks")
        .upsert({
          user_id: user.id,
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_active_date: today,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });
      
      if (error) throw error;
      
      // Update streak achievement progress
      await updateProgressMutation.mutateAsync({ type: "streak", increment: 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-streak"] });
    },
  });

  // AC Earning Logic
  const startEarning = useCallback(() => {
    if (isEarning) return;
    setIsEarning(true);
    lastTickRef.current = Date.now();
    
    earnIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;
      
      const earned = elapsed * BASE_EARN_RATE * speedMultiplier;
      setPendingAC((prev) => prev + earned);
    }, 100);
  }, [isEarning, speedMultiplier]);

  const pauseEarning = useCallback(() => {
    setIsEarning(false);
    if (earnIntervalRef.current) {
      clearInterval(earnIntervalRef.current);
      earnIntervalRef.current = null;
    }
  }, []);

  const flushEarnings = useCallback(() => {
    const earned = Math.floor(pendingAC);
    setPendingAC((prev) => prev - earned);
    
    // Update AC earned achievement progress
    if (earned > 0 && user?.id) {
      updateProgressMutation.mutate({ type: "ac_earned", increment: earned });
    }
    
    return earned;
  }, [pendingAC, user?.id, updateProgressMutation]);

  // Update speed multiplier based on playback rate
  const updateSpeed = useCallback((playbackRate: number) => {
    const index = SPEED_THRESHOLDS.findIndex((t) => playbackRate <= t);
    const multiplier = index >= 0 ? SPEED_MULTIPLIERS[index] : SPEED_MULTIPLIERS[SPEED_MULTIPLIERS.length - 1];
    setSpeedMultiplier(multiplier);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (earnIntervalRef.current) {
        clearInterval(earnIntervalRef.current);
      }
    };
  }, []);

  // Update streak on mount
  useEffect(() => {
    if (user?.id) {
      updateStreakMutation.mutate();
    }
  }, [user?.id]);

  const unlockedCount = userAchievements.filter((ua) => ua.unlocked_at).length;

  return {
    achievements,
    userAchievements,
    unlockedCount,
    totalCount: achievements.length,
    streak,
    pendingAC,
    isEarning,
    speedMultiplier,
    isLoading: achievementsLoading || userAchievementsLoading,
    startEarning,
    pauseEarning,
    flushEarnings,
    updateProgress: async (type: string, increment = 1) => {
      await updateProgressMutation.mutateAsync({ type, increment });
    },
    checkAndUnlock: async (achievementId: string) => {
      const ua = userAchievements.find((u) => u.achievement_id === achievementId);
      const achievement = achievements.find((a) => a.id === achievementId);
      if (ua && achievement && ua.progress >= achievement.requirement_count && !ua.unlocked_at) {
        await supabase
          .from("user_achievements")
          .update({ unlocked_at: new Date().toISOString() })
          .eq("id", ua.id);
        queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
        return true;
      }
      return false;
    },
    updateStreak: async () => {
      await updateStreakMutation.mutateAsync();
    },
  };
};
