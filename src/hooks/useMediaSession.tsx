import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Progress tracking (ephemeral - localStorage)
interface WatchProgress {
  videoId: string;
  lastPosition: number;
  watchedSegments: [number, number][];
  totalWatched: number;
  acEarned: number;
}

// History logging (persistent - database)
interface WatchHistoryItem {
  id: string;
  post_id: string;
  watch_duration_ms: number;
  completed: boolean;
  watched_at: string;
  post?: {
    title?: string;
    description?: string;
    thumbnail_url?: string;
    media_url?: string;
    username?: string;
    avatar_url?: string;
  };
}

interface UseMediaSessionReturn {
  // Progress tracking (ephemeral)
  getProgress: (postId: string) => WatchProgress | null;
  saveProgress: (postId: string, position: number, duration: number) => void;
  getResumePosition: (postId: string) => number;
  markSegmentWatched: (postId: string, start: number, end: number) => void;
  getNewWatchTime: (postId: string, start: number, end: number) => number;
  updateACEarned: (postId: string, amount: number) => void;
  clearProgress: (postId: string) => void;
  
  // History logging (persistent)
  history: WatchHistoryItem[];
  isLoadingHistory: boolean;
  trackWatch: (postId: string, durationMs: number, completed?: boolean) => void;
  
  // Combined
  markComplete: (postId: string, durationMs: number) => void;
}

const STORAGE_KEY = "attention_watch_progress";

export const useMediaSession = (): UseMediaSessionReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const progressMap = useRef<Map<string, WatchProgress>>(new Map());

  // =================== PROGRESS TRACKING (localStorage) ===================
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([key, value]) => {
          progressMap.current.set(key, value as WatchProgress);
        });
      }
    } catch (e) {
      console.error("Failed to load watch progress", e);
    }
  }, []);

  const persistProgress = useCallback(() => {
    const obj: Record<string, WatchProgress> = {};
    progressMap.current.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }, []);

  const getProgress = useCallback((postId: string): WatchProgress | null => {
    return progressMap.current.get(postId) || null;
  }, []);

  const saveProgress = useCallback((postId: string, position: number, duration: number) => {
    const existing = progressMap.current.get(postId);
    if (existing) {
      existing.lastPosition = position;
    } else {
      progressMap.current.set(postId, {
        videoId: postId,
        lastPosition: position,
        watchedSegments: [],
        totalWatched: 0,
        acEarned: 0,
      });
    }
    persistProgress();
  }, [persistProgress]);

  const getResumePosition = useCallback((postId: string): number => {
    const progress = progressMap.current.get(postId);
    return progress?.lastPosition || 0;
  }, []);

  // Merge overlapping segments
  const mergeSegments = (segments: [number, number][]): [number, number][] => {
    if (segments.length === 0) return [];
    const sorted = [...segments].sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [sorted[0]];
    
    for (let i = 1; i < sorted.length; i++) {
      const last = merged[merged.length - 1];
      const current = sorted[i];
      if (current[0] <= last[1]) {
        last[1] = Math.max(last[1], current[1]);
      } else {
        merged.push(current);
      }
    }
    return merged;
  };

  const markSegmentWatched = useCallback((postId: string, start: number, end: number) => {
    let progress = progressMap.current.get(postId);
    if (!progress) {
      progress = {
        videoId: postId,
        lastPosition: end,
        watchedSegments: [],
        totalWatched: 0,
        acEarned: 0,
      };
      progressMap.current.set(postId, progress);
    }

    progress.watchedSegments.push([start, end]);
    progress.watchedSegments = mergeSegments(progress.watchedSegments);
    progress.totalWatched = progress.watchedSegments.reduce((sum, [s, e]) => sum + (e - s), 0);
    persistProgress();
  }, [persistProgress]);

  const getNewWatchTime = useCallback((postId: string, start: number, end: number): number => {
    const progress = progressMap.current.get(postId);
    if (!progress || progress.watchedSegments.length === 0) {
      return end - start;
    }

    let newTime = 0;
    let currentPos = start;

    for (const [segStart, segEnd] of progress.watchedSegments) {
      if (currentPos >= end) break;
      
      if (currentPos < segStart) {
        const gapEnd = Math.min(segStart, end);
        newTime += gapEnd - currentPos;
        currentPos = gapEnd;
      }
      
      if (currentPos < segEnd) {
        currentPos = segEnd;
      }
    }

    if (currentPos < end) {
      newTime += end - currentPos;
    }

    return Math.max(0, newTime);
  }, []);

  const updateACEarned = useCallback((postId: string, amount: number) => {
    const progress = progressMap.current.get(postId);
    if (progress) {
      progress.acEarned += amount;
      persistProgress();
    }
  }, [persistProgress]);

  const clearProgress = useCallback((postId: string) => {
    progressMap.current.delete(postId);
    persistProgress();
  }, [persistProgress]);

  // =================== HISTORY LOGGING (database) ===================

  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["watch_history", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("watch_history")
        .select(`
          *,
          posts:post_id (
            title,
            description,
            thumbnail_url,
            media_url,
            profiles:user_id (username, avatar_url)
          )
        `)
        .eq("user_id", user.id)
        .order("watched_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        post_id: item.post_id,
        watch_duration_ms: item.watch_duration_ms,
        completed: item.completed,
        watched_at: item.watched_at,
        post: item.posts ? {
          title: item.posts.title,
          description: item.posts.description,
          thumbnail_url: item.posts.thumbnail_url,
          media_url: item.posts.media_url,
          username: item.posts.profiles?.username,
          avatar_url: item.posts.profiles?.avatar_url,
        } : undefined,
      }));
    },
    enabled: !!user,
  });

  const trackWatchMutation = useMutation({
    mutationFn: async ({ 
      postId, 
      durationMs, 
      completed 
    }: { 
      postId: string; 
      durationMs: number; 
      completed?: boolean;
    }) => {
      if (!user) return;

      const { error } = await supabase
        .from("watch_history")
        .upsert({
          user_id: user.id,
          post_id: postId,
          watch_duration_ms: durationMs,
          completed: completed || false,
          watched_at: new Date().toISOString(),
        }, { onConflict: "user_id,post_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watch_history", user?.id] });
    },
  });

  const trackWatch = useCallback((postId: string, durationMs: number, completed?: boolean) => {
    trackWatchMutation.mutate({ postId, durationMs, completed });
  }, [trackWatchMutation]);

  // =================== COMBINED ===================

  const markComplete = useCallback((postId: string, durationMs: number) => {
    // Mark as complete in database
    trackWatch(postId, durationMs, true);
    // Clear local progress since it's completed
    clearProgress(postId);
  }, [trackWatch, clearProgress]);

  return {
    // Progress tracking
    getProgress,
    saveProgress,
    getResumePosition,
    markSegmentWatched,
    getNewWatchTime,
    updateACEarned,
    clearProgress,
    
    // History logging
    history,
    isLoadingHistory,
    trackWatch,
    
    // Combined
    markComplete,
  };
};

export default useMediaSession;
