import { useState } from "react";
import { motion } from "framer-motion";
import VideoFeed from "../stream/VideoFeed";
import FeedToggle from "../stream/FeedToggle";

type FeedType = "companions" | "stream";

interface StreamTabProps {
  isFullscreen?: boolean;
  onSwipeRight?: () => void;
}

const StreamTab = ({ isFullscreen = false, onSwipeRight }: StreamTabProps) => {
  const [activeTab, setActiveTab] = useState<FeedType>("stream");

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

      {/* Video Feed */}
      <VideoFeed isFullscreen={isFullscreen} onSwipeRight={onSwipeRight} />
    </motion.div>
  );
};

export default StreamTab;
