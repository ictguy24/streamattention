import { useState } from "react";
import { motion } from "framer-motion";
import VideoFeed from "../stream/VideoFeed";
import FeedToggle from "../stream/FeedToggle";

type FeedType = "foryou" | "following";

interface StreamTabProps {
  onACEarned: (amount: number) => void;
}

const StreamTab = ({ onACEarned }: StreamTabProps) => {
  const [activeTab, setActiveTab] = useState<FeedType>("foryou");

  return (
    <motion.div
      className="relative h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Feed Toggle Header */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-2 pb-4 bg-gradient-to-b from-background via-background/80 to-transparent">
        <FeedToggle activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Video Feed */}
      <VideoFeed onACEarned={onACEarned} />
    </motion.div>
  );
};

export default StreamTab;
