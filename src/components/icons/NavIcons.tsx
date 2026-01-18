import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  filled?: boolean;
}

// Stream/Play icon - filled triangle
export const StreamIcon = ({ className, filled }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    className={cn("w-6 h-6", className)}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {filled ? (
      <path d="M5 4.99c0-1.09 1.18-1.77 2.12-1.22l12.24 7.01c.93.53.93 1.91 0 2.44L7.12 20.23C6.18 20.78 5 20.1 5 19.01V4.99z" />
    ) : (
      <polygon points="6,4 20,12 6,20" />
    )}
  </svg>
);

// Social/People icon - connected nodes
export const SocialIcon = ({ className, filled }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    className={cn("w-6 h-6", className)}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {filled ? (
      <>
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <circle cx="17" cy="10" r="3" />
        <path d="M21 21v-1.5a3 3 0 0 0-3-3h-.5" />
      </>
    ) : (
      <>
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
      </>
    )}
  </svg>
);

// Create/Plus icon - circle with plus
export const CreateIcon = ({ className, filled }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    className={cn("w-6 h-6", className)}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {filled ? (
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
    ) : (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </>
    )}
  </svg>
);

// Profile/User icon - silhouette with proper fill states
export const ProfileIcon = ({ className, filled }: IconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    className={cn("w-6 h-6", className)}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {filled ? (
      <>
        <circle cx="12" cy="8" r="5" fill="currentColor" />
        <path d="M20 21a8 8 0 0 0-16 0" fill="currentColor" />
      </>
    ) : (
      <>
        <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
        <path d="M20 21a8 8 0 0 0-16 0" stroke="currentColor" strokeWidth="2" />
      </>
    )}
  </svg>
);
