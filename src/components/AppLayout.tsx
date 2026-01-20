import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ACCounter from "./ACCounter";
import LiveIndicator from "./LiveIndicator";
import StreamTab from "./tabs/StreamTab";
import SocialTab from "./tabs/SocialTab";
import CreateTab from "./tabs/CreateTab";
import LiveTab from "./tabs/LiveTab";
import ProfileTab from "./tabs/ProfileTab";
import CompanionsTab from "./tabs/CompanionsTab";
import BottomNav from "./BottomNav";
import NotificationSheet from "./stream/NotificationSheet";
import DiscoverySearchSheet from "./search/DiscoverySearchSheet";
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
  
  const containerRef = useRef<HTMLDivElement>(null);

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
            onSwipeRight={() => {}}
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
        return <StreamTab isFullscreen={isFullscreen} />;
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
      className="min-h-screen bg-background overflow-hidden"
      {...gestureProps}
    >
      {/* Top Header - Hidden in fullscreen */}
      {!isFullscreen && activeTab !== "create" && activeTab !== "live" && (
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
                size="small"
              />
            </div>

            {/* Right: Search + Notification Icon */}
            <div className="flex items-center gap-1">
              <motion.button
                className="relative p-2"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSearch(true)}
              >
                <Search className="w-4 h-4 text-foreground/70" />
              </motion.button>
              <motion.button
                className="relative p-2"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowNotifications(true)}
              >
                <Bell className="w-4 h-4 text-foreground/70" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold px-0.5">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={
        activeTab === "stream" 
          ? "h-screen pb-20 pt-12" 
          : activeTab === "create" || activeTab === "live"
          ? "h-screen"
          : "pt-16 pb-24 min-h-screen"
      }>
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

      {/* Bottom Navigation - Hidden during create/live modes */}
      {activeTab !== "create" && activeTab !== "live" && !isFullscreen && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      {/* Close button for create/live modes */}
      {(activeTab === "create" || activeTab === "live") && (
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
