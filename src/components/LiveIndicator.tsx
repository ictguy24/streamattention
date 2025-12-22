import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  hasActiveSessions?: boolean;
  isUserLive?: boolean;
  onClick?: () => void;
  className?: string;
}

// Elite Broadcast SVG Icon
const BroadcastIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Center tower */}
    <path d="M12 12v8" />
    <path d="M8 20h8" />
    {/* Broadcasting signal waves */}
    <path d="M8.5 8.5a5 5 0 0 1 7 0" />
    <path d="M6 6a8 8 0 0 1 12 0" />
    <path d="M3.5 3.5a12 12 0 0 1 17 0" />
    {/* Center dot */}
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const LiveIndicator = ({ 
  hasActiveSessions = false, 
  isUserLive = false, 
  onClick,
  className 
}: LiveIndicatorProps) => {
  return (
    <motion.button
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-full transition-all",
        isUserLive 
          ? "bg-destructive text-destructive-foreground" 
          : hasActiveSessions
            ? "bg-primary/20 text-primary border border-primary/30"
            : "bg-muted/30 text-muted-foreground border border-border/50",
        className
      )}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      {/* Glowing ring for user live */}
      {isUserLive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-destructive"
          animate={{ 
            boxShadow: [
              "0 0 0 0 hsl(var(--destructive) / 0.6)",
              "0 0 0 10px hsl(var(--destructive) / 0)",
            ]
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      {/* Soft pulse for active sessions */}
      {hasActiveSessions && !isUserLive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.2, 0.4] 
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Elite Broadcast Icon */}
      <motion.div
        className="relative z-10"
        animate={isUserLive || hasActiveSessions ? { 
          scale: [1, 1.05, 1] 
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <BroadcastIcon className="w-5 h-5" />
      </motion.div>
    </motion.button>
  );
};

export default LiveIndicator;
