import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import ACCounter from "./ACCounter";
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

  // Handle AC earning with multiplier
  const handleACEarned = useCallback((amount: number) => {
    const earnedAmount = amount * multiplier;
    setAcBalance((prev) => prev + earnedAmount);
  }, [multiplier]);

  // Check for streak multiplier (demo: increase multiplier over time)
  useEffect(() => {
    const checkStreak = setInterval(() => {
      // Demo: Increase multiplier every 30 seconds of active use
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
        return <SocialTab />;
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

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Top Header with AC Counter - Only show when not on stream */}
      {activeTab !== "stream" && (
        <header className="fixed top-0 left-0 right-0 z-40 safe-area-top">
          <div className="flex items-center justify-between px-4 py-3">
            <ACCounter balance={acBalance} multiplier={multiplier > 1 ? Math.round(multiplier * 10) / 10 : undefined} />
            <div className="text-lg font-bold bg-gradient-neon bg-clip-text text-transparent">
              Attention
            </div>
          </div>
        </header>
      )}

      {/* Floating AC Counter for Stream Tab */}
      {activeTab === "stream" && (
        <div className="fixed top-4 right-4 z-40">
          <ACCounter balance={acBalance} multiplier={multiplier > 1 ? Math.round(multiplier * 10) / 10 : undefined} />
        </div>
      )}

      {/* Main Content */}
      <main className={activeTab === "stream" ? "h-screen pb-20" : "pt-20 pb-24 min-h-screen"}>
        <AnimatePresence mode="wait">
          {renderTab()}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default AppLayout;
