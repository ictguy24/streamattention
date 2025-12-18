import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  username: string;
  initialFollowing?: boolean;
  onFollow?: (following: boolean) => void;
  size?: "sm" | "md";
}

const FollowButton = ({ username, initialFollowing = false, onFollow, size = "sm" }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(true);
    setIsFollowing(!isFollowing);
    onFollow?.(!isFollowing);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <motion.button
      className={cn(
        "font-medium rounded-full transition-all",
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
        isFollowing
          ? "bg-muted/50 text-muted-foreground border border-border/50"
          : "bg-primary text-primary-foreground"
      )}
      whileTap={{ scale: 0.95 }}
      animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
      onClick={handleClick}
    >
      {isFollowing ? "Following" : "Follow"}
    </motion.button>
  );
};

export default FollowButton;
