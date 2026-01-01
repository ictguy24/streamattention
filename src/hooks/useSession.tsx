import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSessionReturn {
  sessionId: string | null;
  isSessionActive: boolean;
  startSession: () => Promise<string | null>;
  endSession: (abnormal?: boolean) => Promise<void>;
}

// Generate a stable device fingerprint hash
const generateDeviceHash = (): string => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
  ];
  
  // Simple hash function
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

export const useSession = (): UseSessionReturn => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const deviceHashRef = useRef<string>(generateDeviceHash());

  const startSession = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.log('No auth session - cannot start attention session');
        return null;
      }

      const response = await supabase.functions.invoke('manage-session', {
        body: {
          action: 'start',
          device_hash: deviceHashRef.current,
          metadata: {
            user_agent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            started_at: new Date().toISOString(),
          },
        },
      });

      if (response.error) {
        console.error('Failed to start session:', response.error);
        return null;
      }

      const newSessionId = response.data?.session_id;
      if (newSessionId) {
        setSessionId(newSessionId);
        setIsSessionActive(true);
        console.log('Session started:', newSessionId);
      }
      
      return newSessionId;
    } catch (error) {
      console.error('Session start error:', error);
      return null;
    }
  }, []);

  const endSession = useCallback(async (abnormal = false): Promise<void> => {
    if (!sessionId) return;

    try {
      await supabase.functions.invoke('manage-session', {
        body: {
          action: 'end',
          device_hash: deviceHashRef.current,
          session_id: sessionId,
          abnormal,
        },
      });

      console.log('Session ended:', sessionId);
    } catch (error) {
      console.error('Session end error:', error);
    } finally {
      setSessionId(null);
      setIsSessionActive(false);
    }
  }, [sessionId]);

  // Auto-start session on mount if authenticated
  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await startSession();
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await startSession();
      } else if (event === 'SIGNED_OUT') {
        await endSession();
      }
    });

    // End session on page unload
    const handleUnload = () => {
      if (sessionId) {
        // Use sendBeacon for reliable delivery
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-session`;
        navigator.sendBeacon(url, JSON.stringify({
          action: 'end',
          device_hash: deviceHashRef.current,
          session_id: sessionId,
          abnormal: false,
        }));
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [startSession, endSession, sessionId]);

  return {
    sessionId,
    isSessionActive,
    startSession,
    endSession,
  };
};

export default useSession;
