import { useRef, useCallback, useState } from 'react';

interface GestureHandlers {
  onDoubleTap?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPinchStart?: () => void;
  onPinchEnd?: () => void;
}

interface GestureState {
  isFullscreen: boolean;
}

export const useGestures = (handlers: GestureHandlers) => {
  const lastTapRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      // Pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Check for double tap
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      handlers.onDoubleTap?.();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }

    // Check for swipe
    if (touchStartRef.current && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      const SWIPE_THRESHOLD = 80;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      }
    }

    touchStartRef.current = null;
    initialPinchDistanceRef.current = null;
  }, [handlers]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Handle pinch zoom
    if (e.touches.length === 2 && initialPinchDistanceRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.sqrt(dx * dx + dy * dy);
      const pinchRatio = currentDistance / initialPinchDistanceRef.current;

      if (pinchRatio > 1.3 && !isFullscreen) {
        setIsFullscreen(true);
        handlers.onPinchStart?.();
      } else if (pinchRatio < 0.7 && isFullscreen) {
        setIsFullscreen(false);
        handlers.onPinchEnd?.();
      }
    }
  }, [isFullscreen, handlers]);

  const gestureProps = {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };

  return {
    gestureProps,
    isFullscreen,
    setIsFullscreen,
  };
};

export default useGestures;
