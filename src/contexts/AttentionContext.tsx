import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { routeAttentionEvent } from "@/core/ups/UPSRouter";
import { getUPS } from "@/core/ups/UPSCore";

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
  const [ups, setUPS] = useState(getUPS());
  const [balance, setBalance] = useState(0);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [isBalanceLoading] = useState(false);

  // Calculate trust state from UPS
  const trustState = calculateTrustState(ups);

  // Periodic decay sync
  useEffect(() => {
    const tick = setInterval(() => {
      setUPS(getUPS());
    }, 3000);
    return () => clearInterval(tick);
  }, []);

  const registerAttention = useCallback((
    type: "watch" | "like" | "comment" | "gift" | "boost",
    duration = 1,
    risk = 0
  ) => {
    const newUPS = routeAttentionEvent(type, duration, true, risk);
    setUPS(newUPS);

    // Reward logic (UPS-gated)
    const reward = Math.max(1, Math.floor(newUPS * 10));
    setBalance(b => b + reward);
  }, []);

  const reportComment = useCallback((
    _sessionId: string,
    _contentId: string,
    _content: string
  ) => {
    registerAttention("comment", 1, 0);
  }, [registerAttention]);

  const reportVideoWatch = useCallback((
    _sessionId: string,
    _videoId: string,
    durationMs: number
  ) => {
    const durationSeconds = Math.floor(durationMs / 1000);
    registerAttention("watch", durationSeconds, 0);
  }, [registerAttention]);

  const reportLike = useCallback((
    _sessionId: string,
    _contentId: string
  ) => {
    registerAttention("like", 1, 0);
  }, [registerAttention]);

  const reportSave = useCallback((
    _sessionId: string,
    _contentId: string
  ) => {
    registerAttention("like", 1, 0); // Treat save similar to like for UPS
  }, [registerAttention]);

  return (
    <AttentionContext.Provider
      value={{
        ups,
        balance,
        acBalance: balance, // Alias for compatibility
        sessionId,
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
