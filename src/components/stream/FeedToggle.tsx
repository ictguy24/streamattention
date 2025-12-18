import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type FeedType = "foryou" | "following";

interface FeedToggleProps {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
}

const FeedToggle = ({ activeTab, onTabChange }: FeedToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={() => onTabChange("foryou")}
        className={cn(
          "relative py-2 text-sm font-medium transition-colors",
          activeTab === "foryou" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        For You
        {activeTab === "foryou" && (
          <motion.div
            layoutId="feedIndicator"
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </button>
      <button
        onClick={() => onTabChange("following")}
        className={cn(
          "relative py-2 text-sm font-medium transition-colors",
          activeTab === "following" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Following
        {activeTab === "following" && (
          <motion.div
            layoutId="feedIndicator"
            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </button>
    </div>
  );
};

export default FeedToggle;
