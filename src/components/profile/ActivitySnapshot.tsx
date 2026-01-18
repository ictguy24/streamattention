import { motion } from "framer-motion";
import { Play, Heart, Bookmark, MessageCircle, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ActivitySnapshotProps {
  onSectionClick?: (section: string) => void;
}

const ActivitySnapshot = ({ onSectionClick }: ActivitySnapshotProps) => {
  const { user } = useAuth();

  const { data: counts, isLoading } = useQuery({
    queryKey: ["activity-counts", user?.id],
    queryFn: async () => {
      if (!user) return { watched: 0, liked: 0, saved: 0, commented: 0 };

      const [watchedResult, likedResult, savedResult, commentedResult] = await Promise.all([
        supabase
          .from("watch_history")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("likes")
          .select("post_id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("saves")
          .select("post_id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      return {
        watched: watchedResult.count || 0,
        liked: likedResult.count || 0,
        saved: savedResult.count || 0,
        commented: commentedResult.count || 0,
      };
    },
    enabled: !!user,
  });

  const activities = [
    { id: "watched", icon: Play, label: "Watched", count: counts?.watched || 0, color: "text-blue-400", bgColor: "bg-blue-400/10" },
    { id: "liked", icon: Heart, label: "Liked", count: counts?.liked || 0, color: "text-destructive", bgColor: "bg-destructive/10" },
    { id: "saved", icon: Bookmark, label: "Saved", count: counts?.saved || 0, color: "text-primary", bgColor: "bg-primary/10" },
    { id: "commented", icon: MessageCircle, label: "Commented", count: counts?.commented || 0, color: "text-green-400", bgColor: "bg-green-400/10", priority: true },
  ];

  return (
    <motion.div
      className="px-4 py-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3 className="text-sm font-semibold text-foreground mb-3">Activity</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {activities.map((activity, index) => (
            <motion.button
              key={activity.id}
              className={cn(
                "relative flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/40 text-left",
                activity.priority && "col-span-2"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSectionClick?.(activity.id)}
            >
              <div className={cn("p-2 rounded-lg", activity.bgColor)}>
                <activity.icon className={cn("w-4 h-4", activity.color)} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{activity.label}</p>
                <p className="text-lg font-bold text-foreground">{activity.count}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              
              {activity.priority && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-medium bg-accent/20 text-accent">
                  MOST AC
                </div>
              )}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ActivitySnapshot;