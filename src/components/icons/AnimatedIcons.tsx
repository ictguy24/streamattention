import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

// Heart Icon (Like) - fills red with pulse
export const AnimatedHeartIcon = ({ className, isActive, onClick }: AnimatedIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6 cursor-pointer", className)}
    onClick={onClick}
    whileTap={{ scale: 0.85 }}
    animate={isActive ? {
      scale: [1, 1.3, 1],
      transition: { duration: 0.4, ease: "easeOut" }
    } : {}}
  >
    <motion.path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={isActive ? "#ef4444" : "none"}
      stroke={isActive ? "#ef4444" : "currentColor"}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(!isActive && "text-foreground")}
      animate={isActive ? {
        fillOpacity: [0, 1],
        transition: { duration: 0.3 }
      } : { fillOpacity: 0 }}
    />
  </motion.svg>
);

// Discuss Icon (Comment) - Lines animate in sequentially
export const AnimatedDiscussIcon = ({ className, isActive, onClick }: AnimatedIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6 cursor-pointer", className)}
    onClick={onClick}
    whileTap={{ scale: 0.85 }}
  >
    <motion.path
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      fill={isActive ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(isActive ? "text-primary" : "text-foreground")}
      animate={isActive ? {
        scale: [1, 1.05, 1],
        transition: { duration: 0.4 }
      } : {}}
    />
    <motion.line
      x1="9" y1="9" x2="15" y2="9"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={cn(isActive ? "text-primary-foreground" : "text-foreground")}
      initial={{ pathLength: 1 }}
      animate={isActive ? {
        pathLength: [0, 1],
        transition: { duration: 0.2, delay: 0.1 }
      } : {}}
    />
    <motion.line
      x1="9" y1="13" x2="13" y2="13"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={cn(isActive ? "text-primary-foreground" : "text-foreground")}
      initial={{ pathLength: 1 }}
      animate={isActive ? {
        pathLength: [0, 1],
        transition: { duration: 0.2, delay: 0.2 }
      } : {}}
    />
  </motion.svg>
);

// Broadcast Icon (Share) - Ripple rings expand outward
export const AnimatedBroadcastIcon = ({ className, isActive, onClick }: AnimatedIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6 cursor-pointer", className)}
    onClick={onClick}
    whileTap={{ scale: 0.85 }}
  >
    <motion.circle
      cx="12" cy="12" r="2"
      fill={isActive ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      className={cn(isActive ? "text-secondary" : "text-foreground")}
    />
    <motion.path
      d="M16.24 7.76a6 6 0 0 1 0 8.49"
      fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"
      className={cn(isActive ? "text-secondary" : "text-foreground")}
      animate={isActive ? { opacity: [0, 1, 1], scale: [0.8, 1, 1], transition: { duration: 0.6 } } : {}}
    />
    <motion.path
      d="M7.76 16.24a6 6 0 0 1 0-8.49"
      fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"
      className={cn(isActive ? "text-secondary" : "text-foreground")}
      animate={isActive ? { opacity: [0, 1, 1], scale: [0.8, 1, 1], transition: { duration: 0.6, delay: 0.1 } } : {}}
    />
    <motion.path
      d="M19.07 4.93a10 10 0 0 1 0 14.14"
      fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"
      className={cn(isActive ? "text-secondary" : "text-foreground")}
      animate={isActive ? { opacity: [0, 1, 1], scale: [0.8, 1, 1], transition: { duration: 0.6, delay: 0.2 } } : {}}
    />
    <motion.path
      d="M4.93 19.07a10 10 0 0 1 0-14.14"
      fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"
      className={cn(isActive ? "text-secondary" : "text-foreground")}
      animate={isActive ? { opacity: [0, 1, 1], scale: [0.8, 1, 1], transition: { duration: 0.6, delay: 0.3 } } : {}}
    />
  </motion.svg>
);

// Bookmark Icon (Save) - Fold animation on save
export const AnimatedBookmarkIcon = ({ className, isActive, onClick }: AnimatedIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6 cursor-pointer", className)}
    onClick={onClick}
    whileTap={{ scale: 0.85 }}
    animate={isActive ? {
      rotateY: [0, 180, 0],
      transition: { duration: 0.5, ease: "easeInOut" }
    } : {}}
    style={{ transformStyle: "preserve-3d" }}
  >
    <motion.path
      d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
      fill={isActive ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(isActive ? "text-accent" : "text-foreground")}
    />
  </motion.svg>
);

// Amplify Icon (Repost) - Arrows rotate 360 when reposted
export const AnimatedAmplifyIcon = ({ className, isActive, onClick }: AnimatedIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6 cursor-pointer", className)}
    onClick={onClick}
    whileTap={{ scale: 0.85 }}
    animate={isActive ? {
      rotate: [0, 360],
      transition: { duration: 0.5, ease: "easeOut" }
    } : {}}
    style={{ transformOrigin: "center" }}
  >
    <polyline
      points="17 1 21 5 17 9"
      fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round"
      className={cn(isActive ? "text-green-400" : "text-foreground")}
    />
    <path
      d="M3 11V9a4 4 0 0 1 4-4h14"
      fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round"
      className={cn(isActive ? "text-green-400" : "text-foreground")}
    />
    <polyline
      points="7 23 3 19 7 15"
      fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round"
      className={cn(isActive ? "text-green-400" : "text-foreground")}
    />
    <path
      d="M21 13v2a4 4 0 0 1-4 4H3"
      fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round"
      className={cn(isActive ? "text-green-400" : "text-foreground")}
    />
  </motion.svg>
);

// Keep old name exports for backward compat
export const AnimatedEnergyIcon = AnimatedHeartIcon;
export const AnimatedCollectIcon = AnimatedBookmarkIcon;

export default {
  AnimatedHeartIcon,
  AnimatedDiscussIcon,
  AnimatedBroadcastIcon,
  AnimatedBookmarkIcon,
  AnimatedAmplifyIcon,
};
