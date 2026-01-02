import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import ACCounter from "./ACCounter";
import LiveIndicator from "./LiveIndicator";
import StreamTab from "./tabs/StreamTab";
import SocialTab from "./tabs/SocialTab";
import CreateTab from "./tabs/CreateTab";
import LiveTab from "./tabs/LiveTab";
import ProfileTab from "./tabs/ProfileTab";
import CompanionsTab from "./tabs/CompanionsTab";
import NotificationSheet from "./stream/NotificationSheet";
import { useGestures } from "@/hooks/useGestures";
import { useAttention } from "@/contexts/AttentionContext";

// Horizontal zone order: Companions ↔ Stream (Center) ↔ Social Space ↔ Profile
type ZoneType = "companions" | "stream" | "social" | "profile";
const ZONE_ORDER: ZoneType[] = ["companions", "stream", "social", "profile"];

// Keep create/live as overlay modes, not zones
type OverlayMode = "create" | "live" | null;

const AppLayout = () => {
  // Server-verified balance from AttentionContext
  const { balance } = useAttention();
  
  const [activeZone, setActiveZone] = useState<ZoneType>("stream");
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [hasActiveLiveSessions, setHasActiveLiveSessions] = useState(true);
  const [isUserLive, setIsUserLive] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Touch tracking for horizontal navigation
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Zone navigation via swipe
  const handleSwipeLeft = useCallback(() => {
    if (overlayMode) return; // Don't navigate zones in overlay mode
    const currentIndex = ZONE_ORDER.indexOf(activeZone);
    if (currentIndex < ZONE_ORDER.length - 1) {
      setActiveZone(ZONE_ORDER[currentIndex + 1]);
    }
  }, [activeZone, overlayMode]);

  const handleSwipeRight = useCallback(() => {
    if (overlayMode) return;
    const currentIndex = ZONE_ORDER.indexOf(activeZone);
    if (currentIndex > 0) {
      setActiveZone(ZONE_ORDER[currentIndex - 1]);
    }
  }, [activeZone, overlayMode]);

  // Custom touch handlers for horizontal zone navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const SWIPE_THRESHOLD = 80;

    // Only trigger horizontal swipe if it's more horizontal than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }, [handleSwipeLeft, handleSwipeRight]);

  // Gesture handling for pinch fullscreen
  const { gestureProps } = useGestures({
    onPinchStart: () => setIsFullscreen(true),
    onPinchEnd: () => setIsFullscreen(false),
  });

  // Streak multiplier
  useEffect(() => {
    const checkStreak = setInterval(() => {
      if (activeZone === "stream" || activeZone === "companions") {
        setMultiplier((prev) => Math.min(prev + 0.1, 3));
      }
    }, 30000);

    return () => clearInterval(checkStreak);
  }, [activeZone]);

  const renderZone = () => {
    // If overlay mode is active, show that instead
    if (overlayMode === "create") {
      return <CreateTab />;
    }
    if (overlayMode === "live") {
      return <LiveTab />;
    }

    switch (activeZone) {
      case "companions":
        return (
          <CompanionsTab 
            isFullscreen={isFullscreen} 
            onSwipeLeft={handleSwipeLeft} 
          />
        );
      case "stream":
        return (
          <StreamTab 
            isFullscreen={isFullscreen} 
            onSwipeRight={handleSwipeRight} 
          />
        );
      case "social":
        return <SocialTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return (
          <StreamTab 
            isFullscreen={isFullscreen} 
            onSwipeRight={handleSwipeRight} 
          />
        );
    }
  };

  const handleLiveClick = () => {
    setOverlayMode("live");
  };

  // Close overlay and return to zones
  const closeOverlay = () => {
    setOverlayMode(null);
  };

  // Get current zone index for indicator
  const currentZoneIndex = ZONE_ORDER.indexOf(activeZone);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-background overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...gestureProps}
    >
      {/* Top Header - Hidden in fullscreen */}
      {!isFullscreen && !overlayMode && (
        <header className="fixed top-0 left-0 right-0 z-40 safe-area-top">
          <div className="flex items-center justify-between px-3 py-2">
            {/* Left: AC Counter + Live */}
            <div className="flex items-center gap-2">
              <ACCounter 
                balance={balance} 
                multiplier={multiplier > 1 ? Math.round(multiplier * 10) / 10 : undefined} 
              />
              <LiveIndicator
                hasActiveSessions={hasActiveLiveSessions}
                isUserLive={isUserLive}
                onClick={handleLiveClick}
              />
            </div>

            {/* Right: Notification Icon */}
            <div className="flex items-center gap-2">
              <motion.button
                className="relative p-1.5"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-4 h-4 text-foreground/70" />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-primary" />
              </motion.button>
            </div>
          </div>
        </header>
      )}

      {/* Zone Indicator - Subtle dots showing position */}
      {!isFullscreen && !overlayMode && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {ZONE_ORDER.map((zone, index) => (
            <button
              key={zone}
              onClick={() => setActiveZone(zone)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentZoneIndex 
                  ? "bg-foreground w-4" 
                  : "bg-foreground/30"
              }`}
              aria-label={`Go to ${zone}`}
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <main className={
        activeZone === "stream" || activeZone === "companions" 
          ? "h-screen pb-0 pt-12" 
          : "pt-16 pb-4 min-h-screen"
      }>
        <AnimatePresence mode="wait">
          <motion.div
            key={overlayMode || activeZone}
            initial={{ opacity: 0, x: overlayMode ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: overlayMode ? 0 : -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {renderZone()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Overlay Close Button */}
      {overlayMode && (
        <button
          onClick={closeOverlay}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <span className="text-foreground text-sm">✕</span>
        </button>
      )}

      {/* Create FAB - Only show when not in overlay */}
      {!isFullscreen && !overlayMode && (
        <button
          onClick={() => setOverlayMode("create")}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <span className="text-primary-foreground text-2xl font-light">+</span>
        </button>
      )}

      {/* Notification Sheet */}
      <NotificationSheet 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
};

export default AppLayout;
