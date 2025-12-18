import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ACCounter from "./ACCounter";
import LiveIndicator from "./LiveIndicator";
import BottomNav from "./BottomNav";
import StreamTab from "./tabs/StreamTab";
import SocialTab from "./tabs/SocialTab";
import CreateTab from "./tabs/CreateTab";
import LiveTab from "./tabs/LiveTab";
import ProfileTab from "./tabs/ProfileTab";

type TabType = "stream" | "social" | "create" | "live" | "profile";

const AppLayout = () => {
  const [activeTab, setActiveTab] = useState<TabType>("stream");
  const [acBalance, setAcBalance] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [hasActiveLiveSessions, setHasActiveLiveSessions] = useState(true); // Demo
  const [isUserLive, setIsUserLive] = useState(false);

  // Handle AC earning with multiplier
  const handleACEarned = useCallback((amount: number) => {
    const earnedAmount = Math.round(amount * multiplier);
    setAcBalance((prev) => prev + earnedAmount);
  }, [multiplier]);

  // Check for streak multiplier (demo: increase multiplier over time)
  useEffect(() => {
    const checkStreak = setInterval(() => {
      if (activeTab === "stream") {
        setMultiplier((prev) => Math.min(prev + 0.1, 3));
      }
    }, 30000);

    return () => clearInterval(checkStreak);
  }, [activeTab]);

  const renderTab = () => {
    switch (activeTab) {
      case "stream":
        return <StreamTab onACEarned={handleACEarned} />;
      case "social":
        return <SocialTab onACEarned={handleACEarned} />;
      case "create":
        return <CreateTab />;
      case "live":
        return <LiveTab />;
      case "profile":
        return <ProfileTab acBalance={acBalance} />;
      default:
        return <StreamTab onACEarned={handleACEarned} />;
    }
  };

  const handleLiveClick = () => {
    setActiveTab("live");
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Top-Left Header - AC Counter + Live Button (SIGNATURE ELEMENT) */}
      <header className="fixed top-0 left-0 right-0 z-40 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: AC Counter + Live */}
          <div className="flex items-center gap-2">
            <ACCounter 
              balance={acBalance} 
              multiplier={multiplier > 1 ? Math.round(multiplier * 10) / 10 : undefined} 
            />
            <LiveIndicator
              hasActiveSessions={hasActiveLiveSessions}
              isUserLive={isUserLive}
              onClick={handleLiveClick}
            />
          </div>

          {/* Right: App Name (subtle) */}
          <motion.div 
            className="text-sm font-semibold text-foreground/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Attention
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className={activeTab === "stream" ? "h-screen pb-20 pt-16" : "pt-20 pb-24 min-h-screen"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default AppLayout;
