import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

// Energy Icon (Like) - 800ms pulse animation
export const AnimatedEnergyIcon = ({ className, isActive, onClick }: AnimatedIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6 cursor-pointer", className)}
    onClick={onClick}
    whileTap={{ scale: 0.85 }}
    animate={isActive ? {
      scale: [1, 1.3, 1],
      transition: { duration: 0.8, ease: "easeOut" }
    } : {}}
  >
    <motion.polygon
      points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
      fill={isActive ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        isActive ? "text-amber-400" : "text-foreground"
      )}
      animate={isActive ? {
        fillOpacity: [0, 1],
        transition: { duration: 0.4 }
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
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={cn(isActive ? "text-secondary" : "text-foreground")}
      animate={isActive ? {
        opacity: [0, 1, 1],
        scale: [0.8, 1, 1],
        transition: { duration: 0.6, delay: 0 }
      } : {}}
    />
    <motion.path
      d="M7.76 16.24a6 6 0 0 1 0-8.49"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={cn(isActive ? "text-secondary" : "text-foreground")}
      animate={isActive ? {
        opacity: [0, 1, 1],
        scale: [0.8, 1, 1],
        transition: { duration: 0.6, delay: 0.1 }
      } : {}}
    />
    <motion.path
      d="M19.07 4.93a10 10 0 0 1 0 14.14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={cn(isActive ? "text-secondary" : "text-foreground")}
      animate={isActive ? {
        opacity: [0, 1, 1],
        scale: [0.8, 1, 1],
        transition: { duration: 0.6, delay: 0.2 }
      } : {}}
    />
    <motion.path
      d="M4.93 19.07a10 10 0 0 1 0-14.14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={cn(isActive ? "text-secondary" : "text-foreground")}
      animate={isActive ? {
        opacity: [0, 1, 1],
        scale: [0.8, 1, 1],
        transition: { duration: 0.6, delay: 0.3 }
      } : {}}
    />
  </motion.svg>
);

// Collect Icon (Save) - Fold animation
export const AnimatedCollectIcon = ({ className, isActive, onClick }: AnimatedIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6 cursor-pointer", className)}
    onClick={onClick}
    whileTap={{ scale: 0.85 }}
    animate={isActive ? {
      rotateY: [0, 90, 0],
      transition: { duration: 0.5, ease: "easeInOut" }
    } : {}}
    style={{ transformStyle: "preserve-3d" }}
  >
    <motion.rect
      x="3" y="3" width="18" height="18" rx="2" ry="2"
      fill={isActive ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(isActive ? "text-accent" : "text-foreground")}
    />
    <motion.circle
      cx="12" cy="12" r="4"
      fill="none"
      stroke={isActive ? "hsl(var(--accent-foreground))" : "currentColor"}
      strokeWidth={1.5}
      className={cn(isActive ? "text-accent-foreground" : "text-foreground")}
    />
    <motion.line
      x1="12" y1="3" x2="12" y2="8"
      stroke={isActive ? "hsl(var(--accent-foreground))" : "currentColor"}
      strokeWidth={1.5}
      className={cn(isActive ? "text-accent-foreground" : "text-foreground")}
    />
    <motion.line
      x1="12" y1="16" x2="12" y2="21"
      stroke={isActive ? "hsl(var(--accent-foreground))" : "currentColor"}
      strokeWidth={1.5}
      className={cn(isActive ? "text-accent-foreground" : "text-foreground")}
    />
  </motion.svg>
);

// Amplify Icon (Repost) - Arrows rotate in opposite directions
export const AnimatedAmplifyIcon = ({ className, isActive, onClick }: AnimatedIconProps) => (
  <motion.svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6 cursor-pointer", className)}
    onClick={onClick}
    whileTap={{ scale: 0.85 }}
  >
    <motion.g
      animate={isActive ? {
        rotate: [0, 360],
        transition: { duration: 0.4, ease: "easeOut" }
      } : {}}
      style={{ transformOrigin: "center" }}
    >
      <polyline
        points="17 1 21 5 17 9"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(isActive ? "text-green-400" : "text-foreground")}
      />
      <path
        d="M3 11V9a4 4 0 0 1 4-4h14"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(isActive ? "text-green-400" : "text-foreground")}
      />
    </motion.g>
    <motion.g
      animate={isActive ? {
        rotate: [0, -360],
        transition: { duration: 0.4, ease: "easeOut" }
      } : {}}
      style={{ transformOrigin: "center" }}
    >
      <polyline
        points="7 23 3 19 7 15"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(isActive ? "text-green-400" : "text-foreground")}
      />
      <path
        d="M21 13v2a4 4 0 0 1-4 4H3"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(isActive ? "text-green-400" : "text-foreground")}
      />
    </motion.g>
  </motion.svg>
);

export default {
  AnimatedEnergyIcon,
  AnimatedDiscussIcon,
  AnimatedBroadcastIcon,
  AnimatedCollectIcon,
  AnimatedAmplifyIcon,
};
