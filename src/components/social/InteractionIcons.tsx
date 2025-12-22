import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  isActive?: boolean;
  strokeWidth?: number;
}

// Custom Energy icon (not heart) - represents giving energy/attention
export const EnergyIcon = ({ className, isActive, strokeWidth = 1.5 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-5 h-5", className)}
    fill={isActive ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// Custom Discuss icon (not default bubble) - represents conversation
export const DiscussIcon = ({ className, isActive, strokeWidth = 1.5 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-5 h-5", className)}
    fill={isActive ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="9" y1="9" x2="15" y2="9" />
    <line x1="9" y1="13" x2="13" y2="13" />
  </svg>
);

// Custom Broadcast icon (not arrow) - represents sharing/amplifying
export const BroadcastIcon = ({ className, isActive, strokeWidth = 1.5 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-5 h-5", className)}
    fill={isActive ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
  </svg>
);

// Custom Collect icon (not bookmark) - represents saving/collecting
export const CollectIcon = ({ className, isActive, strokeWidth = 1.5 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-5 h-5", className)}
    fill={isActive ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="3" x2="12" y2="8" />
    <line x1="12" y1="16" x2="12" y2="21" />
  </svg>
);

// Custom Connect icon (not plus/user) - represents following/connecting
export const ConnectIcon = ({ className, isActive, strokeWidth = 1.5 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-5 h-5", className)}
    fill={isActive ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

// Custom Amplify icon - for reposts
export const AmplifyIcon = ({ className, isActive, strokeWidth = 1.5 }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-5 h-5", className)}
    fill={isActive ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

export default {
  EnergyIcon,
  DiscussIcon,
  BroadcastIcon,
  CollectIcon,
  ConnectIcon,
  AmplifyIcon,
};