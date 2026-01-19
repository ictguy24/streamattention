import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAttention } from "@/contexts/AttentionContext";
import { usePosts, Post } from "@/hooks/usePosts";
import VideoCard from "./VideoCard";

interface VideoFeedProps {
  isFullscreen?: boolean;
  onSwipeRight?: () => void;
}

export default function VideoFeed({ isFullscreen, onSwipeRight }: VideoFeedProps) {
  const { registerAttention } = useAttention();
  const { posts, isLoading, error, hasMore, loadMore } = usePosts("personalized");
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  // Register watch attention every 3 seconds
  useEffect(() => {
    if (posts.length === 0) return;
    
    const interval = setInterval(() => {
      registerAttention("watch", 3);
    }, 3000);
    return () => clearInterval(interval);
  }, [registerAttention, posts.length]);

  // Handle vertical swipe for video navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const SWIPE_THRESHOLD = 50;

    if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
      if (deltaY < 0 && currentIndex < posts.length - 1) {
        // Swipe up - next video
        setCurrentIndex(prev => prev + 1);
        // Load more if near end
        if (currentIndex >= posts.length - 3 && hasMore) {
          loadMore();
        }
      } else if (deltaY > 0 && currentIndex > 0) {
        // Swipe down - previous video
        setCurrentIndex(prev => prev - 1);
      }
    }

    touchStartY.current = null;
  }, [currentIndex, posts.length, hasMore, loadMore]);

  // Loading state
  if (isLoading && posts.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading feed...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-center px-6">
          <p className="text-sm text-muted-foreground mb-2">Unable to load content</p>
          <p className="text-xs text-muted-foreground/70">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-center px-6">
          <p className="text-lg font-medium text-foreground mb-2">No content yet</p>
          <p className="text-sm text-muted-foreground">Be the first to create something!</p>
        </div>
      </div>
    );
  }

  const currentPost = posts[currentIndex];

  return (
    <div 
      ref={containerRef}
      className="h-full w-full relative overflow-hidden bg-background"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPost.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full"
        >
          <VideoCard
            video={{
              id: currentPost.id,
              url: currentPost.media_url || "",
              poster: currentPost.thumbnail_url || currentPost.cover_image_url || undefined,
              username: currentPost.username || "user",
              description: currentPost.description || currentPost.title || "",
              likes: currentPost.like_count || 0,
              comments: currentPost.comment_count || 0,
              shares: 0,
              musicUrl: currentPost.music_url,
              musicVolume: currentPost.music_volume || 1,
              originalVolume: currentPost.original_volume || 1,
              musicTitle: currentPost.music_title,
            }}
            isActive={true}
            isFullscreen={isFullscreen}
          />
        </motion.div>
      </AnimatePresence>

      {/* Video position indicator */}
      {!isFullscreen && posts.length > 1 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
          {posts.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, i) => {
            const actualIndex = Math.max(0, currentIndex - 2) + i;
            return (
              <div
                key={actualIndex}
                className={`w-1 rounded-full transition-all ${
                  actualIndex === currentIndex
                    ? "h-4 bg-foreground"
                    : "h-1.5 bg-foreground/30"
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Loading more indicator */}
      {isLoading && posts.length > 0 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
          <Loader2 className="w-5 h-5 animate-spin text-foreground/50" />
        </div>
      )}
    </div>
  );
}
