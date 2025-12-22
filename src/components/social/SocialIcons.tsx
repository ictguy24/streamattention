import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  isActive?: boolean;
}

// Conversations - Simple layered panels (no bubbles)
export const ConversationsIcon = ({ className, isActive }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={cn("w-5 h-5", className)}
    strokeWidth="1.5"
  >
    {/* Back panel */}
    <rect
      x="4"
      y="4"
      width="14"
      height="10"
      rx="2"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.2 : 0.4}
    />
    {/* Front panel */}
    <rect
      x="6"
      y="8"
      width="14"
      height="10"
      rx="2"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.4 : 1}
    />
    {/* Lines */}
    <line x1="9" y1="12" x2="17" y2="12" stroke="currentColor" strokeLinecap="round" opacity={isActive ? 1 : 0.6} />
    <line x1="9" y1="15" x2="14" y2="15" stroke="currentColor" strokeLinecap="round" opacity={isActive ? 1 : 0.6} />
  </svg>
);

// Threads - Vertical flow with indent
export const ThreadsIcon = ({ className, isActive }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={cn("w-5 h-5", className)}
    strokeWidth="1.5"
  >
    {/* Main line */}
    <line x1="6" y1="4" x2="6" y2="20" stroke="currentColor" opacity={isActive ? 0.4 : 0.3} />
    {/* Thread items */}
    <circle cx="6" cy="6" r="2" stroke="currentColor" fill={isActive ? "currentColor" : "none"} />
    <line x1="10" y1="6" x2="20" y2="6" stroke="currentColor" strokeLinecap="round" />
    <circle cx="6" cy="12" r="2" stroke="currentColor" fill={isActive ? "currentColor" : "none"} opacity={0.7} />
    <line x1="10" y1="12" x2="18" y2="12" stroke="currentColor" strokeLinecap="round" opacity={0.7} />
    <circle cx="8" cy="18" r="2" stroke="currentColor" fill={isActive ? "currentColor" : "none"} opacity={0.5} />
    <line x1="12" y1="18" x2="18" y2="18" stroke="currentColor" strokeLinecap="round" opacity={0.5} />
  </svg>
);

// Posts - Stacked frames (masonry-like)
export const PostsIcon = ({ className, isActive }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={cn("w-5 h-5", className)}
    strokeWidth="1.5"
  >
    {/* Large tile */}
    <rect
      x="3"
      y="3"
      width="10"
      height="12"
      rx="2"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.3 : 1}
    />
    {/* Small tiles */}
    <rect
      x="15"
      y="3"
      width="6"
      height="6"
      rx="1.5"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.5 : 0.7}
    />
    <rect
      x="15"
      y="11"
      width="6"
      height="10"
      rx="1.5"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.4 : 0.5}
    />
    <rect
      x="3"
      y="17"
      width="10"
      height="4"
      rx="1.5"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.2 : 0.4}
    />
  </svg>
);

// Memories - Simple camera with timeline
export const MemoriesIcon = ({ className, isActive }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={cn("w-5 h-5", className)}
    strokeWidth="1.5"
  >
    {/* Camera body */}
    <rect
      x="2"
      y="6"
      width="20"
      height="14"
      rx="3"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.2 : 1}
    />
    {/* Camera top */}
    <path
      d="M7 6V5c0-.6.4-1 1-1h8c.6 0 1 .4 1 1v1"
      stroke="currentColor"
      strokeLinecap="round"
    />
    {/* Lens */}
    <circle
      cx="12"
      cy="13"
      r="4"
      stroke="currentColor"
      fill={isActive ? "currentColor" : "none"}
      opacity={isActive ? 0.4 : 1}
    />
    <circle
      cx="12"
      cy="13"
      r="2"
      stroke="currentColor"
    />
  </svg>
);

// Legacy exports for backwards compatibility
export const ChatsIcon = ConversationsIcon;
export const MomentsIcon = PostsIcon;
export const PulseIcon = ThreadsIcon;
export const SnapIcon = MemoriesIcon;
