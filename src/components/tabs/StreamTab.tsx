import { motion, AnimatePresence } from "framer-motion";
import VideoFeed from "../stream/VideoFeed";
import CompanionsTab from "./CompanionsTab";

type FeedType = "companions" | "stream";

interface StreamTabProps {
  isFullscreen?: boolean;
  activeSubTab: FeedType;
  onSubTabChange: (tab: FeedType) => void;
}

const StreamTab = ({ isFullscreen = false, activeSubTab, onSubTabChange }: StreamTabProps) => {
  return (
    <motion.div
      className="relative h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {activeSubTab === "companions" ? (
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
              onSwipeLeft={() => onSubTabChange("stream")} 
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
              onSwipeRight={() => onSubTabChange("companions")} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StreamTab;
