import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { routeAttentionEvent } from "@/core/ups/UPSRouter";
import { getUPS } from "@/core/ups/UPSCore";
import { useSession } from "@/hooks/useSession";
import { useInteraction } from "@/hooks/useInteraction";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type TrustState = "cold" | "warm" | "active" | "trusted";

interface AttentionContextType {
  ups: number;
  balance: number;
  acBalance: number; // Alias for compatibility
  sessionId: string;
  trustState: TrustState;
  isBalanceLoading: boolean;
  registerAttention: (type: "watch" | "like" | "comment" | "gift" | "boost", duration?: number, risk?: number) => void;
  reportComment: (sessionId: string, contentId: string, content: string) => void;
  reportVideoWatch: (sessionId: string, videoId: string, durationMs: number) => void;
  reportLike: (sessionId: string, contentId: string) => void;
  reportSave: (sessionId: string, contentId: string) => void;
}

const AttentionContext = createContext<AttentionContextType | null>(null);

// Calculate trust state from UPS
function calculateTrustState(ups: number): TrustState {
  if (ups >= 80) return "trusted";
  if (ups >= 50) return "active";
  if (ups >= 20) return "warm";
  return "cold";
}

export function AttentionProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, refreshProfile } = useAuth();
  const { sessionId: backendSessionId, isSessionActive } = useSession();
  const { reportVideoWatch: reportVideoBackend, reportLike: reportLikeBackend, reportSave: reportSaveBackend, reportComment: reportCommentBackend } = useInteraction();

  const [ups, setUPS] = useState(getUPS());
  const [localBalanceIncrement, setLocalBalanceIncrement] = useState(0);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  // Source of truth for balance is the profile
  const acBalance = useMemo(() => {
    return (profile?.ac_balance || 0) + localBalanceIncrement;
  }, [profile?.ac_balance, localBalanceIncrement]);

  const trustState = calculateTrustState(ups);

  // Sync profile balance periodically or when local increments get too high
  useEffect(() => {
    if (localBalanceIncrement > 0) {
      const timer = setTimeout(() => {
        refreshProfile?.();
        setLocalBalanceIncrement(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [localBalanceIncrement, refreshProfile]);

  // Listen for real-time wallet changes (if ac_balance moves to wallet)
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('wallet-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        () => refreshProfile?.()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, refreshProfile]);

  const registerAttention = useCallback((
    type: "watch" | "like" | "comment" | "gift" | "boost",
    duration = 1,
    risk = 0
  ) => {
    const newUPS = routeAttentionEvent(type, duration, true, risk);
    setUPS(newUPS);

    // Immediate UI feedback for earning
    const reward = Math.max(1, Math.floor(newUPS * 2));
    setLocalBalanceIncrement(prev => prev + reward);
  }, []);

  const reportComment = useCallback((
    _sessionId: string,
    contentId: string,
    content: string
  ) => {
    registerAttention("comment", 1, 0);
    if (backendSessionId) {
      reportCommentBackend(backendSessionId, contentId, content);
    }
  }, [registerAttention, backendSessionId, reportCommentBackend]);

  const reportVideoWatch = useCallback((
    _sessionId: string,
    videoId: string,
    durationMs: number
  ) => {
    const durationSeconds = Math.floor(durationMs / 1000);
    registerAttention("watch", durationSeconds, 0);
    if (backendSessionId) {
      reportVideoBackend(backendSessionId, videoId, durationMs);
    }
  }, [registerAttention, backendSessionId, reportVideoBackend]);

  const reportLike = useCallback((
    _sessionId: string,
    contentId: string
  ) => {
    registerAttention("like", 1, 0);
    if (backendSessionId) {
      reportLikeBackend(backendSessionId, contentId);
    }
  }, [registerAttention, backendSessionId, reportLikeBackend]);

  const reportSave = useCallback((
    _sessionId: string,
    contentId: string
  ) => {
    registerAttention("like", 1, 0);
    if (backendSessionId) {
      reportSaveBackend(backendSessionId, contentId);
    }
  }, [registerAttention, backendSessionId, reportSaveBackend]);

  return (
    <AttentionContext.Provider
      value={{
        ups,
        balance: acBalance,
        acBalance,
        sessionId: backendSessionId || "no-session",
        trustState,
        isBalanceLoading,
        registerAttention,
        reportComment,
        reportVideoWatch,
        reportLike,
        reportSave,
      }}
    >
      {children}
    </AttentionContext.Provider>
  );
}

export const useAttention = () => {
  const context = useContext(AttentionContext);
  if (!context) {
    throw new Error("useAttention must be used within an AttentionProvider");
  }
  return context;
};
