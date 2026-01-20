import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import VideoCard from "../stream/VideoCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Users } from "lucide-react";

interface CompanionsTabProps {
  isFullscreen?: boolean;
  onSwipeLeft?: () => void;
}

const CompanionsTab = ({ isFullscreen = false, onSwipeLeft }: CompanionsTabProps) => {
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fetch posts from followed users only
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["followed_posts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .rpc("get_followed_posts", { 
          p_user_id: user.id,
          p_limit: 20,
          p_offset: 0
        });

      if (error) throw error;

      return (data || []).map((post: any) => ({
        id: post.post_id,
        url: post.media_url || "",
        poster: post.thumbnail_url || post.cover_image_url,
        username: post.username || "user",
        avatarUrl: post.avatar_url,
        description: post.description || "",
        likes: post.like_count || 0,
        comments: post.comment_count || 0,
        shares: 0,
        hashtags: [],
        audioName: post.music_title || "Original audio",
        artistName: post.username || "Creator",
        musicUrl: post.music_url,
        musicVolume: post.music_volume || 1,
        originalVolume: post.original_volume || 1,
        musicTitle: post.music_title,
      }));
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setActiveIndex(index);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5,
      }
    );

    const items = containerRef.current.querySelectorAll("[data-index]");
    items.forEach((item) => observerRef.current?.observe(item));

    return () => observerRef.current?.disconnect();
  }, [posts]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center px-8">
        <div className="text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-muted-foreground text-sm">
            Sign in to see content from creators you follow
          </p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-8">
        <Users className="w-12 h-12 text-muted-foreground mb-3" strokeWidth={1.5} />
        <p className="text-foreground font-medium mb-1">No feed yet</p>
        <p className="text-muted-foreground text-sm text-center mb-4">
          Follow creators to see their content here
        </p>
        <button 
          className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium active:scale-95 transition-transform"
          onClick={() => {/* Could open search sheet or navigate */}}
        >
          Add Friends
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar"
      style={{ overscrollBehavior: 'contain', scrollSnapStop: 'always' }}
    >
      {posts.map((video, index) => (
        <motion.div
          key={video.id}
          data-index={index}
          className="h-full w-full snap-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <VideoCard
            video={video}
            isActive={index === activeIndex}
            isFullscreen={isFullscreen}
            onSwipeRight={onSwipeLeft}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default CompanionsTab;
