import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  hasActiveSessions?: boolean;
  isUserLive?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "small" | "normal";
}

const LiveIndicator = ({ 
  hasActiveSessions = false, 
  isUserLive = false, 
  onClick,
  className,
  size = "normal"
}: LiveIndicatorProps) => {
  const isActive = isUserLive || hasActiveSessions;

  // Small TikTok-style button
  if (size === "small") {
    return (
      <motion.button
        className={cn(
          "relative flex items-center gap-1 px-2 py-1 rounded-md transition-all",
          isActive 
            ? "bg-destructive" 
            : "bg-muted/30 border border-border/30",
          className
        )}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
      >
        {/* Pulsing dot */}
        {isActive && (
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-destructive-foreground"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wide",
          isActive ? "text-destructive-foreground" : "text-muted-foreground"
        )}>
          Live
        </span>
      </motion.button>
    );
  }

  // Normal size button
  return (
    <motion.button
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-full transition-all overflow-hidden",
        isActive 
          ? "bg-destructive" 
          : "bg-muted/50 border border-border/50",
        className
      )}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      {/* Pulsing glow ring for active state */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-destructive"
          animate={{ 
            boxShadow: [
              "0 0 0 0 hsl(var(--destructive) / 0.7)",
              "0 0 0 8px hsl(var(--destructive) / 0)",
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      {/* Broadcast waves icon */}
      <svg 
        viewBox="0 0 24 24" 
        className={cn(
          "w-5 h-5 relative z-10",
          isActive ? "text-destructive-foreground" : "text-muted-foreground"
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Outer wave */}
        <motion.path 
          d="M4.5 6.5a10 10 0 0 1 15 0"
          initial={{ opacity: 0.4 }}
          animate={isActive ? { 
            opacity: [0.4, 1, 0.4],
            strokeWidth: [2, 2.5, 2]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
        {/* Middle wave */}
        <motion.path 
          d="M7 9a6 6 0 0 1 10 0"
          initial={{ opacity: 0.6 }}
          animate={isActive ? { 
            opacity: [0.6, 1, 0.6],
            strokeWidth: [2, 2.5, 2]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        {/* Inner wave */}
        <motion.path 
          d="M9.5 11.5a3 3 0 0 1 5 0"
          initial={{ opacity: 0.8 }}
          animate={isActive ? { 
            opacity: [0.8, 1, 0.8],
            strokeWidth: [2, 2.5, 2]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Center dot */}
        <motion.circle 
          cx="12" 
          cy="14" 
          r="2" 
          fill="currentColor"
          stroke="none"
          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        {/* Antenna/Stand */}
        <line x1="12" y1="16" x2="12" y2="20" />
        <line x1="9" y1="20" x2="15" y2="20" />
      </svg>
    </motion.button>
  );
};

export default LiveIndicator;
