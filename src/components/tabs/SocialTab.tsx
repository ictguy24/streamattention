import { useState } from "react";
import { cn } from "@/lib/utils";
import { ConversationsIcon, ThreadsIcon, PostsIcon, MemoriesIcon } from "../social/SocialIcons";
import ConversationsMode from "../social/ConversationsMode";
import ThreadsMode from "../social/ThreadsMode";
import PostsMode from "../social/PostsMode";
import MemoriesMode from "../social/MemoriesMode";

type SocialMode = "conversations" | "threads" | "posts" | "memories";

interface SocialTabProps {
  onACEarned?: (amount: number) => void;
}

const modes = [
  { id: "conversations" as const, Icon: ConversationsIcon, label: "Conversations" },
  { id: "threads" as const, Icon: ThreadsIcon, label: "Threads" },
  { id: "posts" as const, Icon: PostsIcon, label: "Posts" },
  { id: "memories" as const, Icon: MemoriesIcon, label: "Memories" },
];

const SocialTab = ({ onACEarned }: SocialTabProps) => {
  const [activeMode, setActiveMode] = useState<SocialMode>("conversations");

  const renderMode = () => {
    switch (activeMode) {
      case "conversations":
        return <ConversationsMode onACEarned={onACEarned} />;
      case "threads":
        return <ThreadsMode onACEarned={onACEarned} />;
      case "posts":
        return <PostsMode onACEarned={onACEarned} />;
      case "memories":
        return <MemoriesMode onACEarned={onACEarned} />;
      default:
        return <ConversationsMode onACEarned={onACEarned} />;
    }
  };

  const activeIndex = modes.findIndex(m => m.id === activeMode);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Mode Switcher - Grounded, no spring animations */}
      <div className="px-4 mb-4">
        <div className="relative flex items-center justify-between">
          {modes.map((mode) => (
            <button
              key={mode.id}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-2 py-3 transition-colors duration-150",
                activeMode === mode.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
              onClick={() => setActiveMode(mode.id)}
            >
              <mode.Icon 
                className="w-5 h-5" 
                isActive={activeMode === mode.id} 
              />
              <span className="text-sm font-medium hidden sm:inline">
                {mode.label}
              </span>
            </button>
          ))}
          
          {/* Underline indicator - simple slide, no spring */}
          <div 
            className="absolute bottom-0 h-0.5 bg-foreground transition-all duration-200 ease-out"
            style={{
              width: `${100 / modes.length}%`,
              left: `${(activeIndex * 100) / modes.length}%`
            }}
          />
        </div>
      </div>

      {/* Mode Content - Simple opacity transition */}
      <div className="flex-1 overflow-y-auto pb-4">
        <div 
          key={activeMode}
          className="animate-fade-in"
          style={{ animationDuration: '150ms' }}
        >
          {renderMode()}
        </div>
      </div>
    </div>
  );
};

export default SocialTab;
