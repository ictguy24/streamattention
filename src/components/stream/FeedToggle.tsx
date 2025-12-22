import { cn } from "@/lib/utils";

type FeedType = "companions" | "stream";

interface FeedToggleProps {
  activeTab: FeedType;
  onTabChange: (tab: FeedType) => void;
}

const FeedToggle = ({ activeTab, onTabChange }: FeedToggleProps) => {
  return (
    <div className="flex items-center justify-center gap-6">
      {/* Companions on LEFT */}
      <button
        onClick={() => onTabChange("companions")}
        className={cn(
          "relative py-2 text-sm font-medium transition-colors",
          activeTab === "companions" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Companions
        {activeTab === "companions" && (
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground transition-all duration-200" />
        )}
      </button>
      
      {/* Stream on RIGHT */}
      <button
        onClick={() => onTabChange("stream")}
        className={cn(
          "relative py-2 text-sm font-medium transition-colors",
          activeTab === "stream" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        Stream
        {activeTab === "stream" && (
          <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-foreground transition-all duration-200" />
        )}
      </button>
    </div>
  );
};

export default FeedToggle;
