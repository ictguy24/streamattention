import { createContext, useContext, useMemo, useCallback } from "react";
import { mapAttentionEventToInteraction, type AttentionEventType } from "@/core/attention/eventMapper";
import { useInteraction } from "@/hooks/useInteraction";
import { useSession } from "@/hooks/useSession";
import { useVerifiedBalance } from "@/hooks/useVerifiedBalance";

type TrustState = "cold" | "warm" | "active" | "trusted";

interface AttentionContextType {
  ups: number;
  balance: number;
  acBalance: number;
  sessionId: string;
  trustState: TrustState;
  isBalanceLoading: boolean;
  registerAttention: (type: AttentionEventType, duration?: number, risk?: number) => void;
  reportComment: (sessionId: string, contentId: string, content: string) => void;
  reportVideoWatch: (sessionId: string, videoId: string, durationMs: number) => void;
  reportLike: (sessionId: string, contentId: string) => void;
  reportSave: (sessionId: string, contentId: string) => void;
}

const AttentionContext = createContext<AttentionContextType | null>(null);

export function AttentionProvider({ children }: { children: React.ReactNode }) {
  const { reportInteraction, reportComment: reportCommentInteraction, reportLike: reportLikeInteraction, reportSave: reportSaveInteraction, reportVideoWatch: reportVideoWatchInteraction } = useInteraction();
  const { sessionId, startSession, isSessionActive } = useSession();
  const { balance, trustState, ups, isLoading } = useVerifiedBalance();

  const ensureSessionId = useCallback(async (): Promise<string | null> => {
    if (sessionId && isSessionActive) {
      return sessionId;
    }

    return startSession();
  }, [isSessionActive, sessionId, startSession]);

  const registerAttention = useCallback((type: AttentionEventType, duration = 1, risk = 0) => {
    void (async () => {
      const currentSessionId = await ensureSessionId();
      if (!currentSessionId) return;

      const mapped = mapAttentionEventToInteraction({ type, duration });
      await reportInteraction({
        sessionId: currentSessionId,
        interactionType: mapped.interactionType,
        durationMs: mapped.durationMs,
        metadata: {
          ...mapped.metadata,
          risk,
        },
      });
    })();
  }, [ensureSessionId, reportInteraction]);

  const reportComment = useCallback((incomingSessionId: string, contentId: string, content: string) => {
    void (async () => {
      const resolvedSessionId = incomingSessionId || await ensureSessionId();
      if (!resolvedSessionId) return;
      await reportCommentInteraction(resolvedSessionId, contentId, content);
    })();
  }, [ensureSessionId, reportCommentInteraction]);

  const reportVideoWatch = useCallback((incomingSessionId: string, videoId: string, durationMs: number) => {
    void (async () => {
      const resolvedSessionId = incomingSessionId || await ensureSessionId();
      if (!resolvedSessionId) return;
      await reportVideoWatchInteraction(resolvedSessionId, videoId, durationMs);
    })();
  }, [ensureSessionId, reportVideoWatchInteraction]);

  const reportLike = useCallback((incomingSessionId: string, contentId: string) => {
    void (async () => {
      const resolvedSessionId = incomingSessionId || await ensureSessionId();
      if (!resolvedSessionId) return;
      await reportLikeInteraction(resolvedSessionId, contentId);
    })();
  }, [ensureSessionId, reportLikeInteraction]);

  const reportSave = useCallback((incomingSessionId: string, contentId: string) => {
    void (async () => {
      const resolvedSessionId = incomingSessionId || await ensureSessionId();
      if (!resolvedSessionId) return;
      await reportSaveInteraction(resolvedSessionId, contentId);
    })();
  }, [ensureSessionId, reportSaveInteraction]);

  const value = useMemo(() => ({
    ups,
    balance,
    acBalance: balance,
    sessionId: sessionId ?? "",
    trustState,
    isBalanceLoading: isLoading,
    registerAttention,
    reportComment,
    reportVideoWatch,
    reportLike,
    reportSave,
  }), [
    balance,
    isLoading,
    registerAttention,
    reportComment,
    reportLike,
    reportSave,
    reportVideoWatch,
    sessionId,
    trustState,
    ups,
  ]);

  return <AttentionContext.Provider value={value}>{children}</AttentionContext.Provider>;
}

export const useAttention = () => {
  const context = useContext(AttentionContext);
  if (!context) {
    throw new Error("useAttention must be used within an AttentionProvider");
  }
  return context;
};
