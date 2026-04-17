import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChatIcon, ThreadsIcon, FuzzIcon, GalleryIcon } from "../social/SocialIcons";
import ChatMode from "../social/ChatMode";
import ThreadsMode from "../social/ThreadsMode";
import FuzzMode from "../social/FuzzMode";
import GalleryMode from "../social/GalleryMode";

type SocialMode = "chat" | "threads" | "fuzz" | "gallery";

const modes = [
  { id: "chat" as const, Icon: ChatIcon, label: "Chat" },
  { id: "threads" as const, Icon: ThreadsIcon, label: "Threads" },
  { id: "fuzz" as const, Icon: FuzzIcon, label: "Fuzz" },
  { id: "gallery" as const, Icon: GalleryIcon, label: "Gallery" },
];

const SocialTab = () => {
  const [activeMode, setActiveMode] = useState<SocialMode>("chat");

  const renderMode = () => {
    switch (activeMode) {
      case "chat":
        return <ChatMode />;
      case "threads":
        return <ThreadsMode />;
      case "fuzz":
        return <FuzzMode />;
      case "gallery":
        return <GalleryMode />;
      default:
        return <ChatMode />;
    }
  };

  const activeIndex = modes.findIndex(m => m.id === activeMode);

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Mode Switcher */}
      <div className="px-4 mb-4">
        <div className="rounded-2xl border border-border/40 bg-card/50 p-1.5 backdrop-blur-md">
          <div className="relative flex items-center justify-between">
          {modes.map((mode) => (
            <button
              key={mode.id}
              className={cn(
                "relative z-10 flex-1 flex items-center justify-center gap-2 py-3 transition-colors duration-150 rounded-xl",
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
          
          {/* Underline indicator */}
          <div 
            className="absolute inset-y-1.5 h-auto bg-foreground/10 transition-all duration-200 ease-out rounded-xl"
            style={{
              width: `${100 / modes.length}%`,
              left: `${(activeIndex * 100) / modes.length}%`
            }}
          />
        </div>
        </div>
      </div>

      {/* Mode Content */}
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
