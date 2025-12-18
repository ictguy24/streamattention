import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  hasActiveSessions?: boolean;
  isUserLive?: boolean;
  onClick?: () => void;
  className?: string;
}

const LiveIndicator = ({ 
  hasActiveSessions = false, 
  isUserLive = false, 
  onClick,
  className 
}: LiveIndicatorProps) => {
  return (
    <motion.button
      className={cn(
        "relative px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
        isUserLive 
          ? "bg-destructive text-destructive-foreground" 
          : hasActiveSessions
            ? "bg-muted/50 text-foreground border border-border"
            : "bg-muted/30 text-muted-foreground border border-border/50",
        className
      )}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Glowing ring for user live */}
      {isUserLive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-destructive"
          animate={{ 
            boxShadow: [
              "0 0 0 0 hsl(var(--destructive) / 0.4)",
              "0 0 0 8px hsl(var(--destructive) / 0)",
            ]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Soft pulse for active sessions */}
      {hasActiveSessions && !isUserLive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <span className="relative z-10 flex items-center gap-1.5">
        {/* Live dot */}
        <motion.span
          className={cn(
            "w-2 h-2 rounded-full",
            isUserLive 
              ? "bg-destructive-foreground" 
              : hasActiveSessions 
                ? "bg-primary" 
                : "bg-muted-foreground"
          )}
          animate={isUserLive || hasActiveSessions ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        LIVE
      </span>
    </motion.button>
  );
};

export default LiveIndicator;
