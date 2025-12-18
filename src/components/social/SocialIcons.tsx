import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  isActive?: boolean;
}

// Chats - Layered speech bubbles
export const ChatsIcon = ({ className, isActive }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={cn("w-5 h-5", className)}
    strokeWidth="1.5"
  >
    {/* Back bubble */}
    <motion.path
      d="M20 14c0 1.1-.9 2-2 2h-3l-4 3v-3H6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v8z"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.3 : 0.5}
      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
    />
    {/* Front bubble */}
    <motion.path
      d="M18 10c0 1.1-.9 2-2 2h-2l-3 2.5V12H7c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2v5z"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={isActive ? { y: [0, -1, 0] } : {}}
      transition={{ duration: 0.4, delay: 0.1 }}
    />
  </svg>
);

// Moments - Stacked frames/photos
export const MomentsIcon = ({ className, isActive }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={cn("w-5 h-5", className)}
    strokeWidth="1.5"
  >
    {/* Back frame */}
    <motion.rect
      x="6"
      y="6"
      width="14"
      height="14"
      rx="2"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.2 : 0.4}
      animate={isActive ? { rotate: [0, 3, 0] } : {}}
      transition={{ duration: 0.4 }}
      style={{ transformOrigin: "center" }}
    />
    {/* Middle frame */}
    <motion.rect
      x="4"
      y="4"
      width="14"
      height="14"
      rx="2"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.4 : 0.6}
      animate={isActive ? { rotate: [0, -2, 0] } : {}}
      transition={{ duration: 0.4, delay: 0.05 }}
      style={{ transformOrigin: "center" }}
    />
    {/* Front frame */}
    <motion.rect
      x="2"
      y="2"
      width="14"
      height="14"
      rx="2"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3, delay: 0.1 }}
    />
    {/* Image icon inside */}
    <motion.circle
      cx="7"
      cy="7"
      r="1.5"
      fill="currentColor"
      opacity={isActive ? 1 : 0.7}
    />
    <motion.path
      d="M2 13l3-3 2 2 4-4 3 3"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={isActive ? 1 : 0.7}
    />
  </svg>
);

// Pulse - Waveform/radar
export const PulseIcon = ({ className, isActive }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={cn("w-5 h-5", className)}
    strokeWidth="1.5"
  >
    {/* Outer ring */}
    <motion.circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      opacity={isActive ? 0.3 : 0.2}
      animate={isActive ? { scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] } : {}}
      transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
    />
    {/* Middle ring */}
    <motion.circle
      cx="12"
      cy="12"
      r="6"
      stroke="currentColor"
      opacity={isActive ? 0.5 : 0.4}
      animate={isActive ? { scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] } : {}}
      transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, delay: 0.2 }}
    />
    {/* Center dot */}
    <motion.circle
      cx="12"
      cy="12"
      r="3"
      fill={isActive ? "currentColor" : "none"}
      stroke="currentColor"
      animate={isActive ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.8, repeat: isActive ? Infinity : 0 }}
    />
    {/* Pulse line */}
    <motion.path
      d="M2 12h4l2-4 3 8 2-4 3 0"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={isActive ? 1 : 0.6}
      animate={isActive ? { pathLength: [0, 1] } : { pathLength: 1 }}
      transition={{ duration: 0.8 }}
    />
  </svg>
);

// Snap Zone - Camera with spark
export const SnapIcon = ({ className, isActive }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={cn("w-5 h-5", className)}
    strokeWidth="1.5"
  >
    {/* Camera body */}
    <motion.rect
      x="2"
      y="6"
      width="20"
      height="14"
      rx="3"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.2 : 1}
    />
    {/* Camera top bump */}
    <motion.path
      d="M7 6V5c0-.6.4-1 1-1h8c.6 0 1 .4 1 1v1"
      stroke="currentColor"
      strokeLinecap="round"
    />
    {/* Lens */}
    <motion.circle
      cx="12"
      cy="13"
      r="4"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.4 : 1}
      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    />
    {/* Inner lens */}
    <motion.circle
      cx="12"
      cy="13"
      r="2"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
    />
    {/* Spark/flash */}
    <motion.path
      d="M18 3l1 2h2l-1.5 1.5L21 8l-2-1-1 2-.5-2.5L15 6l2.5-.5L18 3z"
      fill="currentColor"
      opacity={isActive ? 1 : 0.6}
      animate={isActive ? { 
        scale: [1, 1.3, 1], 
        rotate: [0, 15, 0],
        opacity: [1, 0.8, 1]
      } : {}}
      transition={{ duration: 0.5 }}
      style={{ transformOrigin: "18px 5.5px" }}
    />
  </svg>
);
