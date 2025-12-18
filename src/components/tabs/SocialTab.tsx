import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Image, Zap, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatsMode from "../social/ChatsMode";
import MomentsMode from "../social/MomentsMode";
import PulseMode from "../social/PulseMode";
import SnapZoneMode from "../social/SnapZoneMode";

type SocialMode = "chats" | "moments" | "pulse" | "snap";

const modes = [
  { id: "chats" as const, icon: MessageCircle, label: "Chats" },
  { id: "moments" as const, icon: Image, label: "Moments" },
  { id: "pulse" as const, icon: Zap, label: "Pulse" },
  { id: "snap" as const, icon: Camera, label: "Snap" },
];

const SocialTab = () => {
  const [activeMode, setActiveMode] = useState<SocialMode>("chats");

  const renderMode = () => {
    switch (activeMode) {
      case "chats":
        return <ChatsMode />;
      case "moments":
        return <MomentsMode />;
      case "pulse":
        return <PulseMode />;
      case "snap":
        return <SnapZoneMode />;
      default:
        return <ChatsMode />;
    }
  };

  return (
    <motion.div
      className="flex flex-col min-h-[calc(100vh-8rem)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Mode Switcher Header */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between p-1 rounded-xl bg-muted/30">
          {modes.map((mode) => (
            <motion.button
              key={mode.id}
              className={cn(
                "relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors",
                activeMode === mode.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
              onClick={() => setActiveMode(mode.id)}
              whileTap={{ scale: 0.95 }}
            >
              {activeMode === mode.id && (
                <motion.div
                  layoutId="socialModeIndicator"
                  className="absolute inset-0 bg-background rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <mode.icon className="relative z-10 w-4 h-4" />
              <span className="relative z-10 text-sm font-medium hidden sm:inline">
                {mode.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mode Content */}
      <div className="flex-1 overflow-y-auto pb-4">
        <AnimatePresence mode="wait">
          <motion.div key={activeMode}>
            {renderMode()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SocialTab;
