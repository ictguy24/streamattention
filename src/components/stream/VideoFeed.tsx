import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import VideoCard from "./VideoCard";
import { usePosts, Post } from "@/hooks/usePosts";

interface VideoFeedProps {
  isFullscreen?: boolean;
  onSwipeRight?: () => void;
}

const VideoFeed = ({ isFullscreen = false, onSwipeRight }: VideoFeedProps) => {
  const { posts, isLoading, error, loadMore, hasMore } = usePosts('personalized');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(index);
            
            // Load more when near the end
            if (index >= posts.length - 3 && hasMore) {
              loadMore();
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.7,
      }
    );

    const videoElements = container.querySelectorAll("[data-index]");
    videoElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, [posts.length, hasMore, loadMore]);

  if (isLoading && posts.length === 0) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading feed...</p>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Unable to load feed</p>
          <p className="text-sm text-muted-foreground/70">{error}</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-[calc(100vh-6rem)] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-2">No posts yet</p>
          <p className="text-muted-foreground">Be the first to share something!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-6rem)] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          data-index={index}
          className="h-[calc(100vh-6rem)] w-full snap-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: Math.min(index * 0.1, 0.5) }}
        >
          <VideoCard
            video={{
              id: post.id,
              url: post.media_url || '',
              poster: post.cover_image_url || post.thumbnail_url || '',
              username: post.username || 'user',
              description: post.description || '',
              likes: post.like_count,
              comments: post.comment_count,
              shares: post.view_count,
              musicUrl: post.music_url,
              musicVolume: post.music_volume,
              originalVolume: post.original_volume,
              musicTitle: post.music_title,
            }}
            isActive={index === activeIndex}
            isFullscreen={isFullscreen}
            onSwipeRight={onSwipeRight}
          />
        </motion.div>
      ))}
      
      {isLoading && posts.length > 0 && (
        <div className="h-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}
    </div>
  );
};

export default VideoFeed;
