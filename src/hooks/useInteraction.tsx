import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

type InteractionType = 
  | 'like' 
  | 'emoji_comment' 
  | 'sentence_comment' 
  | 'insightful_comment'
  | 'thread_read' 
  | 'video_watch' 
  | 'save' 
  | 'post' 
  | 'voice_message' 
  | 'video_message';

interface ReportInteractionParams {
  sessionId: string;
  targetId?: string;
  interactionType: InteractionType;
  durationMs?: number;
  contentHash?: string;
  contextHash?: string;
  metadata?: Record<string, unknown>;
}

interface UseInteractionReturn {
  reportInteraction: (params: ReportInteractionParams) => Promise<void>;
  reportVideoWatch: (sessionId: string, targetId: string, durationMs: number) => Promise<void>;
  reportLike: (sessionId: string, targetId: string) => Promise<void>;
  reportSave: (sessionId: string, targetId: string) => Promise<void>;
  reportComment: (sessionId: string, targetId: string, text: string) => Promise<void>;
}

// Simple hash function for content verification
const hashContent = (content: string): string => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

export const useInteraction = (): UseInteractionReturn => {
  // Debounce tracking to prevent rapid-fire duplicate reports
  const lastReportRef = useRef<Record<string, number>>({});

  const reportInteraction = useCallback(async (params: ReportInteractionParams): Promise<void> => {
    const { sessionId, targetId, interactionType, durationMs, contentHash, contextHash, metadata } = params;

    if (!sessionId) {
      console.log('No session - interaction not reported');
      return;
    }

    // Debounce: prevent same interaction type + target within 500ms
    const dedupeKey = `${interactionType}-${targetId || 'none'}`;
    const now = Date.now();
    if (lastReportRef.current[dedupeKey] && now - lastReportRef.current[dedupeKey] < 500) {
      return;
    }
    lastReportRef.current[dedupeKey] = now;

    try {
      // Fire and forget - no await needed per spec (silent operation)
      supabase.functions.invoke('validate-interaction', {
        body: {
          session_id: sessionId,
          target_id: targetId,
          interaction_type: interactionType,
          duration_ms: durationMs,
          content_hash: contentHash,
          context_hash: contextHash,
          metadata,
        },
      }).catch(() => {
        // Silent failure per spec
      });
    } catch {
      // Silent failure per spec
    }
  }, []);

  const reportVideoWatch = useCallback(async (
    sessionId: string, 
    targetId: string, 
    durationMs: number
  ): Promise<void> => {
    await reportInteraction({
      sessionId,
      targetId,
      interactionType: 'video_watch',
      durationMs,
      metadata: {
        completed: durationMs >= 30000, // 30s threshold
      },
    });
  }, [reportInteraction]);

  const reportLike = useCallback(async (sessionId: string, targetId: string): Promise<void> => {
    await reportInteraction({
      sessionId,
      targetId,
      interactionType: 'like',
    });
  }, [reportInteraction]);

  const reportSave = useCallback(async (sessionId: string, targetId: string): Promise<void> => {
    await reportInteraction({
      sessionId,
      targetId,
      interactionType: 'save',
    });
  }, [reportInteraction]);

  const reportComment = useCallback(async (
    sessionId: string, 
    targetId: string, 
    text: string
  ): Promise<void> => {
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    
    // Determine comment type based on word count
    let interactionType: InteractionType = 'emoji_comment';
    if (wordCount >= 15) {
      interactionType = 'insightful_comment';
    } else if (wordCount >= 5) {
      interactionType = 'sentence_comment';
    }

    await reportInteraction({
      sessionId,
      targetId,
      interactionType,
      contentHash: hashContent(text),
      metadata: {
        word_count: wordCount,
      },
    });
  }, [reportInteraction]);

  return {
    reportInteraction,
    reportVideoWatch,
    reportLike,
    reportSave,
    reportComment,
  };
};

export default useInteraction;
