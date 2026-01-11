import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, Bookmark, MessageCircle, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaSession } from "@/hooks/useMediaSession";
import { useLikes } from "@/hooks/useLikes";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const WatchHistoryHub = () => {
  const [expandedFolder, setExpandedFolder] = useState<string | null>("resume");
  const { user } = useAuth();
  const { history, isLoading: historyLoading } = useMediaSession();
  const { userLikes } = useLikes();

  // Fetch saved posts
  const { data: savedPosts = [] } = useQuery({
    queryKey: ["user-saves", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("saves")
        .select("post_id, created_at, posts(id, title, description, thumbnail_url, content_type)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch commented posts
  const { data: commentedPosts = [] } = useQuery({
    queryKey: ["user-comments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("comments")
        .select("post_id, created_at, posts(id, title, description, thumbnail_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      // Deduplicate by post_id
      const unique = new Map();
      data?.forEach(c => {
        if (!unique.has(c.post_id)) unique.set(c.post_id, c);
      });
      return Array.from(unique.values());
    },
    enabled: !!user?.id,
  });

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Transform data for folders
  const resumeItems = history
    .filter(h => !h.completed && (h.watch_duration_ms || 0) > 0)
    .slice(0, 10)
    .map(h => ({
      id: h.id,
      title: (h as any).posts?.title || (h as any).posts?.description?.slice(0, 30) || "Video",
      progress: Math.min(((h.watch_duration_ms || 0) / 60000) * 100, 99),
      timeAgo: formatTimeAgo(h.watched_at),
      thumbnail: (h as any).posts?.thumbnail_url,
    }));

  const watchedItems = history
    .filter(h => h.completed)
    .slice(0, 10)
    .map(h => ({
      id: h.id,
      title: (h as any).posts?.title || "Video",
      timeAgo: formatTimeAgo(h.watched_at),
      thumbnail: (h as any).posts?.thumbnail_url,
    }));

  const likedItems = userLikes.slice(0, 10).map((postId, idx) => ({
    id: postId,
    title: `Liked content`,
    timeAgo: "",
  }));

  const savedItems = savedPosts.slice(0, 10).map((s: any) => ({
    id: s.post_id,
    title: s.posts?.title || s.posts?.description?.slice(0, 30) || "Saved",
    timeAgo: formatTimeAgo(s.created_at),
    thumbnail: s.posts?.thumbnail_url,
  }));

  const commentedItems = commentedPosts.slice(0, 10).map((c: any) => ({
    id: c.post_id,
    title: c.posts?.title || c.posts?.description?.slice(0, 30) || "Post",
    timeAgo: formatTimeAgo(c.created_at),
    thumbnail: c.posts?.thumbnail_url,
  }));

  const folders = [
    { id: "resume", icon: Clock, label: "Resume Watching", color: "text-yellow-400", items: resumeItems },
    { id: "watched", icon: Play, label: "Watched", color: "text-blue-400", items: watchedItems },
    { id: "liked", icon: Heart, label: "Liked", color: "text-destructive", items: likedItems },
    { id: "saved", icon: Bookmark, label: "Saved", color: "text-primary", items: savedItems },
    { id: "commented", icon: MessageCircle, label: "Commented", color: "text-green-400", items: commentedItems },
  ];

  return (
    <motion.div
      className="px-4 py-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <h3 className="text-sm font-semibold text-foreground mb-3">Watch History</h3>

      <div className="space-y-2">
        {folders.map((folder, index) => (
          <motion.div
            key={folder.id}
            className="rounded-xl border border-border/50 bg-card/40 overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
          >
            {/* Folder Header */}
            <motion.button
              className="w-full flex items-center gap-3 p-3"
              onClick={() => setExpandedFolder(expandedFolder === folder.id ? null : folder.id)}
              whileTap={{ scale: 0.98 }}
            >
              <div className={cn("p-2 rounded-lg bg-muted/50")}>
                <folder.icon className={cn("w-4 h-4", folder.color)} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{folder.label}</p>
                <p className="text-xs text-muted-foreground">{folder.items.length} items</p>
              </div>
              <motion.div
                animate={{ rotate: expandedFolder === folder.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </motion.button>

            {/* Folder Content */}
            <AnimatePresence>
              {expandedFolder === folder.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border/30"
                >
                  {folder.items.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No items yet
                    </div>
                  ) : (
                    folder.items.map((item, itemIndex) => (
                      <motion.div
                        key={item.id}
                        className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: itemIndex * 0.05 }}
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden">
                          {(item as any).thumbnail ? (
                            <img src={(item as any).thumbnail} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Play className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{item.title}</p>
                          {item.timeAgo && <p className="text-xs text-muted-foreground">{item.timeAgo}</p>}
                          {(item as any).progress !== undefined && (item as any).progress < 100 && (
                            <div className="mt-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${(item as any).progress}%` }} 
                              />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WatchHistoryHub;
