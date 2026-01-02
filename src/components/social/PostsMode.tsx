import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Play, ImageIcon, Plus, X, Edit3, Image, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import CommentsPanel from "./CommentsPanel";
import { EnergyIcon, DiscussIcon, BroadcastIcon, CollectIcon, AmplifyIcon } from "./InteractionIcons";
import { usePosts, useCreatePost } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface PostsModeProps {
  onACEarned?: (amount: number) => void;
}

const PostsMode = ({ onACEarned }: PostsModeProps) => {
  const { user } = useAuth();
  const { posts, isLoading } = usePosts();
  const { createPost, isUploading } = useCreatePost();
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostMedia, setNewPostMedia] = useState<File | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleLike = (id: string) => {
    if (!likedPosts.has(id)) {
      onACEarned?.(1);
    }
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSave = (id: string) => {
    if (!savedPosts.has(id)) {
      onACEarned?.(1);
    }
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleShare = (id: string) => {
    if (navigator.share) {
      const post = posts.find(p => p.id === id);
      navigator.share({
        title: 'Check out this post',
        text: post?.description || '',
        url: window.location.href,
      });
    }
    onACEarned?.(5);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !newPostMedia) return;
    
    try {
      await createPost({
        description: newPostContent,
        contentType: newPostMedia?.type.startsWith("video/") ? "video" : "image",
        mediaFile: newPostMedia || undefined,
      });
      
      setNewPostContent("");
      setNewPostMedia(null);
      setShowCreatePost(false);
      onACEarned?.(10);
    } catch (error) {
      console.error("Failed to create post:", error);
    }
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

  return (
    <div className="flex flex-col px-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => setNewPostMedia(e.target.files?.[0] || null)}
      />

      {/* Create Post Button */}
      <button
        className="mb-4 py-3 rounded-lg bg-foreground/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        onClick={() => setShowCreatePost(true)}
      >
        <Plus className="w-5 h-5 text-foreground" strokeWidth={1.5} />
        <span className="text-foreground font-medium">Create Post</span>
      </button>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 bg-background/95 flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
            <button
              className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
              onClick={() => {
                setShowCreatePost(false);
                setNewPostContent("");
                setNewPostMedia(null);
              }}
            >
              <X className="w-6 h-6 text-foreground" strokeWidth={1.5} />
            </button>
            <span className="font-medium text-foreground">Create Post</span>
            <button
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors active:scale-95",
                newPostContent.trim() || newPostMedia
                  ? "bg-foreground text-background"
                  : "bg-muted/20 text-muted-foreground"
              )}
              onClick={handleCreatePost}
              disabled={(!newPostContent.trim() && !newPostMedia) || isCreating}
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </button>
          </div>

          <div className="flex-1 p-4">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback className="bg-muted/30 text-foreground">U</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  placeholder="What's happening?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-lg leading-relaxed min-h-32"
                  autoFocus
                />
                
                {newPostMedia && (
                  <div className="mt-3 relative">
                    <div className="w-full h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">{newPostMedia.name}</span>
                    </div>
                    <button
                      className="absolute top-2 right-2 p-1 rounded-full bg-background/80"
                      onClick={() => setNewPostMedia(null)}
                    >
                      <X className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-border/20 safe-area-bottom">
            <div className="flex items-center gap-3">
              <button
                className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
              </button>
              <span className="text-xs text-muted-foreground">Add media</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-muted-foreground text-sm">No posts yet</p>
          <p className="text-muted-foreground text-xs mt-1">Be the first to share something!</p>
        </div>
      )}

      {/* Masonry Grid */}
      <div className="columns-2 gap-3 space-y-3">
        {posts.map((post) => {
          const isLiked = likedPosts.has(post.id);
          const isSaved = savedPosts.has(post.id);
          const isVideo = post.content_type === "video";

          return (
            <div
              key={post.id}
              className="break-inside-avoid bg-muted/10 rounded-lg overflow-hidden"
            >
              {/* Media */}
              <div className={cn(
                "relative bg-muted/20 flex items-center justify-center",
                isVideo ? "aspect-video" : "aspect-[4/5]"
              )}>
                {post.thumbnail_url || post.cover_image_url ? (
                  <img 
                    src={post.thumbnail_url || post.cover_image_url || ''} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    {isVideo ? (
                      <Play className="w-8 h-8" strokeWidth={1.5} />
                    ) : (
                      <ImageIcon className="w-8 h-8" strokeWidth={1.5} />
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={post.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted/30 text-foreground text-[10px]">
                        {(post.username || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-foreground">@{post.username || 'user'}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {formatTimeAgo(post.created_at || '')}
                  </span>
                </div>

                {post.description && (
                  <p className="text-xs text-foreground leading-relaxed mb-3">{post.description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <button
                    className={cn(
                      "flex items-center gap-1 active:scale-95 transition-all",
                      isLiked ? "text-amber-500" : ""
                    )}
                    onClick={() => toggleLike(post.id)}
                  >
                    <EnergyIcon className="w-4 h-4" isActive={isLiked} strokeWidth={1.5} />
                    <span className="text-[10px]">{(post.like_count || 0) + (isLiked ? 1 : 0)}</span>
                  </button>

                  <button 
                    className="flex items-center gap-1 active:scale-95 transition-all"
                    onClick={() => setOpenCommentId(post.id)}
                  >
                    <DiscussIcon className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-[10px]">{post.comment_count || 0}</span>
                  </button>

                  <button
                    className={cn(
                      "flex items-center gap-1 active:scale-95 transition-all",
                      isSaved ? "text-blue-500" : ""
                    )}
                    onClick={() => toggleSave(post.id)}
                  >
                    <CollectIcon className="w-4 h-4" isActive={isSaved} strokeWidth={1.5} />
                  </button>
                  
                  <button 
                    className="flex items-center gap-1 active:scale-95 transition-all ml-auto"
                    onClick={() => handleShare(post.id)}
                  >
                    <BroadcastIcon className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comments Panel */}
      <CommentsPanel
        isOpen={!!openCommentId}
        onClose={() => setOpenCommentId(null)}
        contentId={openCommentId || ""}
        onACEarned={onACEarned}
      />
    </div>
  );
};

export default PostsMode;
