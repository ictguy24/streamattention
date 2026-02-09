import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface FollowButtonProps {
  userId: string;
  username?: string;
  initialFollowing?: boolean;
  size?: "sm" | "md";
}

const FollowButton = ({ userId, initialFollowing = false, size = "sm" }: FollowButtonProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already following on mount
  useEffect(() => {
    if (!user?.id || !userId || user.id === userId) return;

    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .maybeSingle()
      .then(({ data }) => setIsFollowing(!!data));
  }, [user?.id, userId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id || !userId || user.id === userId || isLoading) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
      } else {
        await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: userId,
        });
      }
      setIsFollowing(!isFollowing);
      queryClient.invalidateQueries({ queryKey: ["follows"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } catch (err) {
      console.error("Follow action failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show for own profile or unauthenticated
  if (!user || user.id === userId) return null;

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
      onClick={handleClick}
      disabled={isLoading}
    >
      {isFollowing ? "Following" : "Follow"}
    </motion.button>
  );
};

export default FollowButton;
