import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ActionBarProps {
  likes: number;
  comments: number;
  shares?: number;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Custom Energy/Like Icon
const EnergyIcon = ({ isActive, className }: { isActive: boolean; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    fill={isActive ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// Custom Comment/Discuss Icon
const DiscussIcon = ({ isActive, className }: { isActive: boolean; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    fill={isActive ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Custom Share/Broadcast Icon
const BroadcastIcon = ({ isActive, className }: { isActive: boolean; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    fill={isActive ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

// Custom Save/Collect Icon
const CollectIcon = ({ isActive, className }: { isActive: boolean; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={cn("w-6 h-6", className)}
    fill={isActive ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const ActionBar = ({
  likes,
  comments,
  shares = 0,
  isLiked,
  isSaved,
  onLike,
  onComment,
  onShare,
  onSave,
  orientation = "vertical",
  size = "md",
  className,
}: ActionBarProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const iconSize = sizeClasses[size];
  const gap = orientation === "vertical" ? "gap-4" : "gap-6";

  const actions = [
    {
      icon: EnergyIcon,
      isActive: isLiked,
      onClick: onLike,
      count: likes,
      activeColor: "text-amber-400",
      label: "Like",
    },
    {
      icon: DiscussIcon,
      isActive: false,
      onClick: onComment,
      count: comments,
      activeColor: "text-blue-400",
      label: "Comment",
    },
    {
      icon: BroadcastIcon,
      isActive: false,
      onClick: onShare,
      count: shares,
      activeColor: "text-green-400",
      label: "Share",
    },
    {
      icon: CollectIcon,
      isActive: isSaved,
      onClick: onSave,
      count: null,
      activeColor: "text-purple-400",
      label: "Save",
    },
  ];

  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col items-center" : "flex-row items-center justify-around",
        gap,
        className
      )}
    >
      {actions.map((action) => (
        <motion.button
          key={action.label}
          className={cn(
            "flex flex-col items-center gap-0.5 transition-colors",
            action.isActive ? action.activeColor : "text-foreground/70 hover:text-foreground"
          )}
          onClick={action.onClick}
          whileTap={{ scale: 0.85 }}
        >
          <motion.div
            animate={action.isActive ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <action.icon isActive={action.isActive} className={iconSize} />
          </motion.div>
          {action.count !== null && (
            <span className="text-[10px] font-medium">
              {action.count > 999 ? `${(action.count / 1000).toFixed(1)}K` : action.count}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default ActionBar;
