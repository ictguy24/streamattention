import { useState } from "react";
import { Play, Eye, Loader2, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { EnergyIcon, DiscussIcon, BroadcastIcon, CollectIcon } from "./InteractionIcons";
import { useAttention } from "@/contexts/AttentionContext";
import { usePosts } from "@/hooks/usePosts";

const FuzzMode = () => {
  const { sessionId, reportLike, reportSave } = useAttention();
  const { posts, isLoading } = usePosts();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [holdingId, setHoldingId] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    if (!likedPosts.has(id) && sessionId) {
      reportLike(sessionId, id);
    }
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleSave = (id: string) => {
    if (!savedPosts.has(id) && sessionId) {
      reportSave(sessionId, id);
    }
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleTap = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleHoldStart = (id: string) => {
    setHoldingId(id);
  };

  const handleHoldEnd = () => {
    setHoldingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8">
        <Compass className="w-12 h-12 text-muted-foreground mb-3" strokeWidth={1.5} />
        <p className="text-muted-foreground text-sm text-center">
          Nothing to explore yet
        </p>
        <p className="text-muted-foreground/60 text-xs text-center mt-1">
          Content will appear here as creators share
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-2">
      {/* Living Grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {posts.map((post, index) => {
          const isExpanded = expandedId === post.id;
          const isHolding = holdingId === post.id;
          const isLiked = likedPosts.has(post.id);
          const isSaved = savedPosts.has(post.id);
          const isVideo = post.content_type === "video";
          
          return (
            <motion.div
              key={post.id}
              className={cn(
                "relative overflow-hidden cursor-pointer",
                isExpanded ? "col-span-3 row-span-2" : "",
                index % 5 === 0 ? "aspect-[3/4]" : 
                index % 3 === 0 ? "aspect-square" : "aspect-[4/5]"
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: isHolding ? 0.98 : 1,
              }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => handleTap(post.id)}
              onMouseDown={() => handleHoldStart(post.id)}
              onMouseUp={handleHoldEnd}
              onMouseLeave={handleHoldEnd}
              onTouchStart={() => handleHoldStart(post.id)}
              onTouchEnd={handleHoldEnd}
            >
              {/* Thumbnail */}
              <div className="absolute inset-0 bg-muted/20">
                {(post.thumbnail_url || post.cover_image_url) && (
                  <img 
                    src={post.thumbnail_url || post.cover_image_url || ''} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>

              {/* Video indicator */}
              {isVideo && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/40 backdrop-blur-sm">
                  <Play className="w-2.5 h-2.5 text-foreground" fill="currentColor" />
                </div>
              )}

              {/* Bottom info */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 p-2"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: isExpanded || isHolding ? 1 : 0.6 }}
              >
                <p className="text-[10px] text-foreground font-medium truncate">@{post.username || 'user'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5 text-foreground/70" />
                    <span className="text-[9px] text-foreground/70">
                      {((post.view_count || 0) / 1000).toFixed(1)}k
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Expanded overlay with actions */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center gap-6">
                      <button
                        className={cn(
                          "flex flex-col items-center gap-1 active:scale-95 transition-all",
                          isLiked ? "text-amber-500" : "text-foreground"
                        )}
                        onClick={(e) => { e.stopPropagation(); toggleLike(post.id); }}
                      >
                        <EnergyIcon className="w-6 h-6" isActive={isLiked} />
                        <span className="text-xs">{(post.like_count || 0) + (isLiked ? 1 : 0)}</span>
                      </button>

                      <button
                        className="flex flex-col items-center gap-1 text-foreground active:scale-95 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DiscussIcon className="w-6 h-6" />
                        <span className="text-xs">Comment</span>
                      </button>

                      <button
                        className="flex flex-col items-center gap-1 text-foreground active:scale-95 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BroadcastIcon className="w-6 h-6" />
                        <span className="text-xs">Share</span>
                      </button>

                      <button
                        className={cn(
                          "flex flex-col items-center gap-1 active:scale-95 transition-all",
                          isSaved ? "text-primary" : "text-foreground"
                        )}
                        onClick={(e) => { e.stopPropagation(); toggleSave(post.id); }}
                      >
                        <CollectIcon className="w-6 h-6" isActive={isSaved} />
                        <span className="text-xs">Save</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground text-center mt-4 px-4">
        Tap to reveal • Hold to pause • Swipe to navigate
      </p>
    </div>
  );
};

export default FuzzMode;
