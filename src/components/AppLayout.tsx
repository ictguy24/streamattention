import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ACCounter from "./ACCounter";
import LiveIndicator from "./LiveIndicator";
import StreamTab from "./tabs/StreamTab";
import SocialTab from "./tabs/SocialTab";
import CreateTab from "./tabs/CreateTab";
import LiveTab from "./tabs/LiveTab";
import ProfileTab from "./tabs/ProfileTab";
import BottomNav from "./BottomNav";
import NotificationSheet from "./stream/NotificationSheet";
import DiscoverySearchSheet from "./search/DiscoverySearchSheet";
import FeedToggle from "./stream/FeedToggle";
import { useGestures } from "@/hooks/useGestures";
import { useAttention } from "@/contexts/AttentionContext";
import { useNotifications } from "@/hooks/useNotifications";

type TabType = "stream" | "social" | "create" | "live" | "profile";

const AppLayout = () => {
  const navigate = useNavigate();
  const { balance } = useAttention();
  const { unreadCount } = useNotifications();

  const [activeTab, setActiveTab] = useState<TabType>("stream");
  const [multiplier, setMultiplier] = useState(1);
  const [hasActiveLiveSessions, setHasActiveLiveSessions] = useState(true);
  const [isUserLive, setIsUserLive] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamSubTab, setStreamSubTab] = useState<"companions" | "stream">("stream");

  const containerRef = useRef<HTMLDivElement>(null);

  // Fix for iOS height issues
  useEffect(() => {
    const setHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setHeight();
    window.addEventListener('resize', setHeight);
    return () => window.removeEventListener('resize', setHeight);
  }, []);

  // Gesture handling for pinch fullscreen
  const { gestureProps } = useGestures({
    onPinchStart: () => setIsFullscreen(true),
    onPinchEnd: () => setIsFullscreen(false),
  });

  // Streak multiplier
  useEffect(() => {
    const checkStreak = setInterval(() => {
      if (activeTab === "stream") {
        setMultiplier((prev) => Math.min(prev + 0.1, 3));
      }
    }, 30000);

    return () => clearInterval(checkStreak);
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    if (tab === "live") {
      // Live is an overlay, not a zone switch
      return;
    }
    setActiveTab(tab);
  };

  const handleLiveClick = () => {
    setActiveTab("live");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "stream":
        return (
          <StreamTab 
            isFullscreen={isFullscreen}
            activeSubTab={streamSubTab}
            onSubTabChange={setStreamSubTab}
          />
        );
      case "social":
        return <SocialTab />;
      case "create":
        return <CreateTab />;
      case "live":
        return <LiveTab />;
      case "profile":
        return <ProfileTab />;
      default:
        return <StreamTab isFullscreen={isFullscreen} activeSubTab={streamSubTab} onSubTabChange={setStreamSubTab} />;
    }
  };

  const handleNavigateToProfile = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  const handleNavigateToPost = (postId: string) => {
    // For now, just close the sheet - could navigate to post detail
    console.log("Navigate to post:", postId);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-[100dvh] h-[100dvh] bg-background overflow-hidden relative flex flex-col"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
      {...(activeTab === "stream" ? gestureProps : {})}
    >
      {/* Top Header - Glassmorphism HUD */}
      {!isFullscreen && activeTab !== "create" && activeTab !== "live" && (
        <header className="fixed top-0 left-0 right-0 z-40 safe-area-top pointer-events-none">
          <div className="mx-auto mt-2 px-3 sm:px-4 py-2 w-[94%] max-w-lg rounded-2xl bg-background/40 backdrop-blur-xl border border-white/10 flex items-center justify-between shadow-2xl shadow-black/20 pointer-events-auto transition-all">
            {/* Left: AC Counter with Neon Glow */}
            <div className="flex items-center gap-2 shrink-0">
              <ACCounter
                balance={balance}
                multiplier={multiplier > 1 ? Math.round(multiplier * 10) / 10 : undefined}
              />
            </div>

            {/* Center: Feed Toggle (Stream tab only) */}
            <div className="flex-1 flex justify-center px-2">
              {activeTab === "stream" && (
                <FeedToggle activeTab={streamSubTab} onTabChange={setStreamSubTab} />
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <motion.button
                className="relative p-1.5 sm:p-2 rounded-full hover:bg-white/5 active:scale-90"
                whileTap={{ scale: 0.9 }}
                onClick={handleLiveClick}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/70" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 6.5a10 10 0 0 1 15 0" />
                  <path d="M7 9a6 6 0 0 1 10 0" />
                  <path d="M9.5 11.5a3 3 0 0 1 5 0" />
                  <circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" />
                </svg>
                {hasActiveLiveSessions && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-destructive animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                )}
              </motion.button>
              <motion.button
                className="relative p-1.5 sm:p-2 rounded-full hover:bg-white/5 active:scale-90"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSearch(true)}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/70" />
              </motion.button>
              <motion.button
                className="relative p-1.5 sm:p-2 rounded-full hover:bg-white/5 active:scale-90"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/70" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[8px] font-bold px-0.5 shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        "relative w-full flex-1 overflow-hidden",
        activeTab === "stream"
          ? "pb-20 pt-14"
          : activeTab === "create" || activeTab === "live"
          ? ""
          : "pt-16 pb-24 overflow-y-auto no-scrollbar"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Hidden during create/fullscreen modes */}
      {activeTab !== "create" && !isFullscreen && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      {/* Close button for create mode */}
      {(activeTab === "create") && (
        <button
          onClick={() => setActiveTab("stream")}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <span className="text-foreground text-sm">✕</span>
        </button>
      )}

      {/* Notification Sheet */}
      <NotificationSheet 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        onNavigateToProfile={(username) => {
          // Convert username to user lookup
          setShowNotifications(false);
        }}
      />

      {/* Discovery Search Sheet */}
      <DiscoverySearchSheet
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToPost={handleNavigateToPost}
      />
    </div>
  );
};

export default AppLayout;
