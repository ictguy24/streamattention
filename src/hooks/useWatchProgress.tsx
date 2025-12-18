import { useState, useCallback, useRef, useEffect } from "react";

interface WatchProgress {
  videoId: string;
  lastPosition: number;
  watchedSegments: [number, number][]; // Array of [start, end] segments
  totalWatched: number;
  acEarned: number;
}

interface UseWatchProgressReturn {
  getProgress: (videoId: string) => WatchProgress | null;
  saveProgress: (videoId: string, position: number, duration: number) => void;
  getResumePosition: (videoId: string) => number;
  markSegmentWatched: (videoId: string, start: number, end: number) => void;
  getNewWatchTime: (videoId: string, start: number, end: number) => number;
  updateACEarned: (videoId: string, amount: number) => void;
  clearProgress: (videoId: string) => void;
}

const STORAGE_KEY = "attention_watch_progress";

export const useWatchProgress = (): UseWatchProgressReturn => {
  const progressMap = useRef<Map<string, WatchProgress>>(new Map());

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

  // Save to localStorage
  const persistProgress = useCallback(() => {
    const obj: Record<string, WatchProgress> = {};
    progressMap.current.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }, []);

  const getProgress = useCallback((videoId: string): WatchProgress | null => {
    return progressMap.current.get(videoId) || null;
  }, []);

  const saveProgress = useCallback((videoId: string, position: number, duration: number) => {
    const existing = progressMap.current.get(videoId);
    if (existing) {
      existing.lastPosition = position;
    } else {
      progressMap.current.set(videoId, {
        videoId,
        lastPosition: position,
        watchedSegments: [],
        totalWatched: 0,
        acEarned: 0,
      });
    }
    persistProgress();
  }, [persistProgress]);

  const getResumePosition = useCallback((videoId: string): number => {
    const progress = progressMap.current.get(videoId);
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

  const markSegmentWatched = useCallback((videoId: string, start: number, end: number) => {
    let progress = progressMap.current.get(videoId);
    if (!progress) {
      progress = {
        videoId,
        lastPosition: end,
        watchedSegments: [],
        totalWatched: 0,
        acEarned: 0,
      };
      progressMap.current.set(videoId, progress);
    }

    progress.watchedSegments.push([start, end]);
    progress.watchedSegments = mergeSegments(progress.watchedSegments);
    progress.totalWatched = progress.watchedSegments.reduce((sum, [s, e]) => sum + (e - s), 0);
    persistProgress();
  }, [persistProgress]);

  // Calculate only NEW watch time (not previously watched)
  const getNewWatchTime = useCallback((videoId: string, start: number, end: number): number => {
    const progress = progressMap.current.get(videoId);
    if (!progress || progress.watchedSegments.length === 0) {
      return end - start;
    }

    let newTime = 0;
    let currentPos = start;

    for (const [segStart, segEnd] of progress.watchedSegments) {
      if (currentPos >= end) break;
      
      if (currentPos < segStart) {
        // Gap before this segment
        const gapEnd = Math.min(segStart, end);
        newTime += gapEnd - currentPos;
        currentPos = gapEnd;
      }
      
      if (currentPos < segEnd) {
        // Skip over watched segment
        currentPos = segEnd;
      }
    }

    // Any remaining time after all segments
    if (currentPos < end) {
      newTime += end - currentPos;
    }

    return Math.max(0, newTime);
  }, []);

  const updateACEarned = useCallback((videoId: string, amount: number) => {
    const progress = progressMap.current.get(videoId);
    if (progress) {
      progress.acEarned += amount;
      persistProgress();
    }
  }, [persistProgress]);

  const clearProgress = useCallback((videoId: string) => {
    progressMap.current.delete(videoId);
    persistProgress();
  }, [persistProgress]);

  return {
    getProgress,
    saveProgress,
    getResumePosition,
    markSegmentWatched,
    getNewWatchTime,
    updateACEarned,
    clearProgress,
  };
};
