import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VideoFeed from "../stream/VideoFeed";
import CompanionsTab from "./CompanionsTab";
import FeedToggle from "../stream/FeedToggle";

type FeedType = "companions" | "stream";

interface StreamTabProps {
  isFullscreen?: boolean;
  onSwipeRight?: () => void;
}

const StreamTab = ({ isFullscreen = false, onSwipeRight }: StreamTabProps) => {
  const [activeTab, setActiveTab] = useState<FeedType>("stream");

  const handleSwipeToCompanions = () => {
    setActiveTab("companions");
  };

  return (
    <motion.div
      className="relative h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Feed Toggle Header - Hidden in fullscreen */}
      {!isFullscreen && (
        <div className="absolute top-0 left-0 right-0 z-20 pt-1 pb-3 bg-gradient-to-b from-background via-background/80 to-transparent">
          <FeedToggle activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}

      {/* Video Feed - Show Companions or Stream based on activeTab */}
      <AnimatePresence mode="wait">
        {activeTab === "companions" ? (
          <motion.div
            key="companions"
            className="h-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <CompanionsTab 
              isFullscreen={isFullscreen} 
              onSwipeLeft={() => setActiveTab("stream")} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="stream"
            className="h-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <VideoFeed 
              isFullscreen={isFullscreen} 
              onSwipeRight={handleSwipeToCompanions} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StreamTab;
