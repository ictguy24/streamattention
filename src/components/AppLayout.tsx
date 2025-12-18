import { useState, useEffect } from "react";
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

  // Demo: Simulate AC earning over time
  useEffect(() => {
    const interval = setInterval(() => {
      setAcBalance((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case "stream":
        return <StreamTab />;
      case "social":
        return <SocialTab />;
      case "create":
        return <CreateTab />;
      case "live":
        return <LiveTab />;
      case "profile":
        return <ProfileTab acBalance={acBalance} />;
      default:
        return <StreamTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header with AC Counter */}
      <header className="fixed top-0 left-0 right-0 z-40 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <ACCounter balance={acBalance} />
          <div className="text-lg font-bold bg-gradient-neon bg-clip-text text-transparent">
            Attention
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24 min-h-screen">
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
