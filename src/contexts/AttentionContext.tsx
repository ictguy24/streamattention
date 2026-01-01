import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from '@/hooks/useSession';
import { useInteraction } from '@/hooks/useInteraction';
import { useVerifiedBalance } from '@/hooks/useVerifiedBalance';

interface AttentionContextValue {
  // Session
  sessionId: string | null;
  isSessionActive: boolean;
  startSession: () => Promise<string | null>;
  endSession: (abnormal?: boolean) => Promise<void>;
  
  // Interactions
  reportInteraction: (params: {
    sessionId: string;
    targetId?: string;
    interactionType: string;
    durationMs?: number;
    contentHash?: string;
    contextHash?: string;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
  reportVideoWatch: (sessionId: string, targetId: string, durationMs: number) => Promise<void>;
  reportLike: (sessionId: string, targetId: string) => Promise<void>;
  reportSave: (sessionId: string, targetId: string) => Promise<void>;
  reportComment: (sessionId: string, targetId: string, text: string) => Promise<void>;
  
  // Balance (server-verified)
  balance: number;
  trustState: string;
  ups: number;
  accountType: string;
  isBalanceLoading: boolean;
  refetchBalance: () => Promise<void>;
}

const AttentionContext = createContext<AttentionContextValue | null>(null);

export const AttentionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const session = useSession();
  const interaction = useInteraction();
  const balance = useVerifiedBalance();

  const value: AttentionContextValue = {
    // Session
    sessionId: session.sessionId,
    isSessionActive: session.isSessionActive,
    startSession: session.startSession,
    endSession: session.endSession,
    
    // Interactions
    reportInteraction: interaction.reportInteraction as AttentionContextValue['reportInteraction'],
    reportVideoWatch: interaction.reportVideoWatch,
    reportLike: interaction.reportLike,
    reportSave: interaction.reportSave,
    reportComment: interaction.reportComment,
    
    // Balance
    balance: balance.balance,
    trustState: balance.trustState,
    ups: balance.ups,
    accountType: balance.accountType,
    isBalanceLoading: balance.isLoading,
    refetchBalance: balance.refetch,
  };

  return (
    <AttentionContext.Provider value={value}>
      {children}
    </AttentionContext.Provider>
  );
};

export const useAttention = (): AttentionContextValue => {
  const context = useContext(AttentionContext);
  if (!context) {
    throw new Error('useAttention must be used within an AttentionProvider');
  }
  return context;
};

export default AttentionContext;
