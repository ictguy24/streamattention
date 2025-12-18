import { useState, useCallback, useRef, useEffect } from "react";

interface ACEarningConfig {
  baseRatePerSecond: number; // AC per second of watch time
  bufferTime: number; // Seconds before earning starts (anti-swipe)
  speedModifiers: Record<number, number>; // playback speed -> modifier
}

const DEFAULT_CONFIG: ACEarningConfig = {
  baseRatePerSecond: 0.5,
  bufferTime: 0.8,
  speedModifiers: {
    0.75: 1.05, // +5% AC
    1: 1, // baseline
    1.25: 0.9, // -10% AC
    1.5: 0.8, // -20% AC
  },
};

interface UseACEarningProps {
  onACEarned: (amount: number) => void;
  playbackSpeed?: number;
  config?: Partial<ACEarningConfig>;
}

interface UseACEarningReturn {
  startEarning: () => void;
  pauseEarning: () => void;
  stopEarning: () => void;
  isEarning: boolean;
  pendingAC: number;
  flushAC: () => number;
  getSpeedIndicator: () => { speed: number; modifier: number; isModified: boolean };
}

export const useACEarning = ({
  onACEarned,
  playbackSpeed = 1,
  config: userConfig,
}: UseACEarningProps): UseACEarningReturn => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  const [isEarning, setIsEarning] = useState(false);
  const [pendingAC, setPendingAC] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const bufferTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(0);
  const accumulatedACRef = useRef<number>(0);

  // Get speed modifier
  const getSpeedModifier = useCallback(() => {
    const speeds = Object.keys(config.speedModifiers).map(Number).sort((a, b) => a - b);
    const closestSpeed = speeds.reduce((prev, curr) =>
      Math.abs(curr - playbackSpeed) < Math.abs(prev - playbackSpeed) ? curr : prev
    );
    return config.speedModifiers[closestSpeed] || 1;
  }, [playbackSpeed, config.speedModifiers]);

  const getSpeedIndicator = useCallback(() => {
    const modifier = getSpeedModifier();
    return {
      speed: playbackSpeed,
      modifier,
      isModified: playbackSpeed !== 1,
    };
  }, [playbackSpeed, getSpeedModifier]);

  // Start earning with buffer delay
  const startEarning = useCallback(() => {
    if (bufferTimerRef.current || intervalRef.current) return;

    // Buffer delay before earning starts
    bufferTimerRef.current = setTimeout(() => {
      setIsEarning(true);
      lastTickRef.current = Date.now();

      // Earn AC every 100ms for smooth accumulation
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - lastTickRef.current) / 1000;
        lastTickRef.current = now;

        const modifier = getSpeedModifier();
        const earned = config.baseRatePerSecond * elapsed * modifier;
        accumulatedACRef.current += earned;
        setPendingAC(Math.floor(accumulatedACRef.current));

        // Emit AC in whole numbers
        if (accumulatedACRef.current >= 1) {
          const toEmit = Math.floor(accumulatedACRef.current);
          accumulatedACRef.current -= toEmit;
          onACEarned(toEmit);
        }
      }, 100);

      bufferTimerRef.current = null;
    }, config.bufferTime * 1000);
  }, [config.baseRatePerSecond, config.bufferTime, getSpeedModifier, onACEarned]);

  // Pause earning (for seeking)
  const pauseEarning = useCallback(() => {
    if (bufferTimerRef.current) {
      clearTimeout(bufferTimerRef.current);
      bufferTimerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsEarning(false);
  }, []);

  // Stop earning completely
  const stopEarning = useCallback(() => {
    pauseEarning();
    accumulatedACRef.current = 0;
    setPendingAC(0);
  }, [pauseEarning]);

  // Flush remaining AC
  const flushAC = useCallback((): number => {
    const remaining = Math.floor(accumulatedACRef.current);
    if (remaining > 0) {
      onACEarned(remaining);
    }
    accumulatedACRef.current = 0;
    setPendingAC(0);
    return remaining;
  }, [onACEarned]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bufferTimerRef.current) clearTimeout(bufferTimerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    startEarning,
    pauseEarning,
    stopEarning,
    isEarning,
    pendingAC,
    flushAC,
    getSpeedIndicator,
  };
};
