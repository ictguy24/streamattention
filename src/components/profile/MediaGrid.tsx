import { useState } from "react";
import { motion } from "framer-motion";
import { Grid3X3, List, Play, Image as ImageIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";

const MediaGrid = () => {
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const { user } = useAuth();
  const { posts, isLoading } = usePosts();

  // Filter to only show current user's content
  const userContent = posts.filter(post => post.user_id === user?.id);

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  return (
    <motion.div
      className="px-4 py-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Your Content</h3>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30">
          <button
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "grid" ? "bg-background text-foreground" : "text-muted-foreground"
            )}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "timeline" ? "bg-background text-foreground" : "text-muted-foreground"
            )}
            onClick={() => setViewMode("timeline")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && userContent.length === 0 && (
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No content yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start creating to see your posts here</p>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && userContent.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-3 gap-1">
          {userContent.map((item, index) => (
            <motion.div
              key={item.id}
              className="relative aspect-square rounded-lg bg-muted/30 overflow-hidden cursor-pointer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Thumbnail */}
              {item.thumbnail_url || item.cover_image_url ? (
                <img 
                  src={item.thumbnail_url || item.cover_image_url || ""} 
                  alt={item.title || "Content"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {item.content_type === "video" ? (
                    <Play className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              )}
              
              {/* Stats Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-background/80 to-transparent">
                <div className="flex items-center gap-2 text-[10px] text-foreground/80">
                  <span>▶ {(item.view_count || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Video Badge */}
              {item.content_type === "video" && (
                <div className="absolute top-1.5 right-1.5">
                  <Play className="w-3 h-3 text-foreground fill-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {!isLoading && userContent.length > 0 && viewMode === "timeline" && (
        <div className="space-y-3">
          {userContent.map((item, index) => (
            <motion.div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/40"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                {item.thumbnail_url || item.cover_image_url ? (
                  <img 
                    src={item.thumbnail_url || item.cover_image_url || ""} 
                    alt={item.title || "Content"}
                    className="w-full h-full object-cover"
                  />
                ) : item.content_type === "video" ? (
                  <Play className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.title || item.description?.slice(0, 30) || "Untitled"}
                </p>
                <p className="text-xs text-muted-foreground">{formatTimeAgo(item.created_at || "")}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>▶ {(item.view_count || 0).toLocaleString()}</span>
                  <span>♥ {item.like_count || 0}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MediaGrid;
