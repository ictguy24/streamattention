import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, ImageIcon, Repeat2, Sparkles, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import CommentSheet from "./CommentSheet";
import { usePosts } from "@/hooks/usePosts";
import { formatDistanceToNow } from "date-fns";

interface MomentsModeProps {
  onACEarned?: (amount: number) => void;
}

const MomentsMode = ({ onACEarned }: MomentsModeProps) => {
  const { posts, isLoading } = usePosts();
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [showACFly, setShowACFly] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [repostedPosts, setRepostedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (id: string) => {
    if (!likedPosts.has(id)) {
      onACEarned?.(1);
      setShowACFly(id);
      setTimeout(() => setShowACFly(null), 800);
    }
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const toggleRepost = (id: string) => {
    if (!repostedPosts.has(id)) {
      onACEarned?.(2);
    }
    setRepostedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleShare = (id: string) => {
    onACEarned?.(5);
  };

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false });
    } catch {
      return "now";
    }
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
        <ImageIcon className="w-12 h-12 text-muted-foreground mb-3" strokeWidth={1.5} />
        <p className="text-muted-foreground text-sm text-center">No moments yet</p>
        <p className="text-muted-foreground/60 text-xs text-center mt-1">
          Posts will appear here as they're shared
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-3 px-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {posts.map((post, index) => {
        const isLiked = likedPosts.has(post.id);
        const isReposted = repostedPosts.has(post.id);
        const isVideo = post.content_type === "video";

        return (
          <motion.div
            key={post.id}
            className="rounded-xl overflow-hidden bg-card/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.avatar_url || undefined} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {(post.username || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground text-sm">@{post.username || 'user'}</p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at || '')}</p>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-muted/50">
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Media */}
            <div className="relative aspect-square bg-muted/20 flex items-center justify-center">
              {(post.thumbnail_url || post.cover_image_url) ? (
                <img 
                  src={post.thumbnail_url || post.cover_image_url || ''} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  {isVideo ? (
                    <Play className="w-12 h-12" />
                  ) : (
                    <ImageIcon className="w-12 h-12" />
                  )}
                  <span className="text-sm">{isVideo ? "Video" : "Photo"}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-3">
              <div className="flex items-center gap-4 mb-2 relative">
                <motion.button
                  className="flex items-center gap-1.5 relative"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleLike(post.id)}
                >
                  <Heart
                    className={cn(
                      "w-6 h-6",
                      isLiked ? "text-destructive fill-destructive" : "text-foreground"
                    )}
                  />
                  <span className="text-sm text-muted-foreground">
                    {((post.like_count || 0) + (isLiked ? 1 : 0)).toLocaleString()}
                  </span>
                  
                  {showACFly === post.id && (
                    <motion.span
                      className="absolute -top-4 left-0 text-xs text-primary font-medium flex items-center gap-0.5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Sparkles className="w-3 h-3" />
                      +1 AC
                    </motion.span>
                  )}
                </motion.button>

                <button 
                  className="flex items-center gap-1.5"
                  onClick={() => setOpenCommentId(post.id)}
                >
                  <MessageCircle className="w-6 h-6 text-foreground" />
                  <span className="text-sm text-muted-foreground">{post.comment_count || 0}</span>
                </button>

                <motion.button 
                  className="flex items-center gap-1.5"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleRepost(post.id)}
                >
                  <Repeat2 className={cn(
                    "w-6 h-6",
                    isReposted ? "text-green-500" : "text-foreground"
                  )} />
                  <span className="text-sm text-muted-foreground">{isReposted ? 1 : 0}</span>
                </motion.button>

                <button 
                  className="flex items-center gap-1.5"
                  onClick={() => handleShare(post.id)}
                >
                  <Share2 className="w-6 h-6 text-foreground" />
                </button>
              </div>

              {/* Caption */}
              {post.description && (
                <p className="text-sm text-foreground">
                  <span className="font-medium">@{post.username || 'user'}</span>{" "}
                  {post.description}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Comment Sheet */}
      <CommentSheet
        isOpen={!!openCommentId}
        onClose={() => setOpenCommentId(null)}
        videoId={openCommentId || ""}
        onACEarned={onACEarned}
      />
    </motion.div>
  );
};

export default MomentsMode;
