import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, ImageIcon, Compass, Plus, X, Image, Send, Mic, Quote, Square,
  MoreHorizontal, Play
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePosts, useCreatePost } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { useAttention } from "@/contexts/AttentionContext";
import { formatDistanceToNow } from "date-fns";
import { EnergyIcon, DiscussIcon, BroadcastIcon, CollectIcon, AmplifyIcon } from "../InteractionIcons";
import CommentsPanel from "../CommentsPanel";

export type ContentType = 'thread' | 'pulse' | 'post' | 'moment' | 'fuzz';
export type LayoutType = 'vertical' | 'grid' | 'masonry';

interface FeedContainerProps {
  contentType: ContentType;
  layout?: LayoutType;
  columns?: number;
  features?: {
    compose?: boolean;
    quotes?: boolean;
    audio?: boolean;
    media?: boolean;
  };
  emptyMessage?: string;
  emptySubMessage?: string;
  onACEarned?: (amount: number) => void;
}

const FeedContainer = ({
  contentType,
  layout = 'vertical',
  columns = 3,
  features = { compose: true, media: true },
  emptyMessage = "Nothing to show yet",
  emptySubMessage = "Content will appear here as it's shared",
  onACEarned,
}: FeedContainerProps) => {
  const { user } = useAuth();
  const { sessionId, reportLike, reportSave } = useAttention();
  const { posts, isLoading } = usePosts();
  const { createPost, isUploading } = useCreatePost();
  
  // State
  const [showCompose, setShowCompose] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newMedia, setNewMedia] = useState<File | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Refs
  const parentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Virtualizer for performance
  const rowVirtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => layout === 'grid' ? 150 : 300,
    overscan: 5,
  });

  // Handlers
  const toggleLike = useCallback((id: string) => {
    if (!likedPosts.has(id)) {
      onACEarned?.(1);
      if (sessionId) reportLike(sessionId, id);
    }
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, [likedPosts, onACEarned, sessionId, reportLike]);

  const toggleSave = useCallback((id: string) => {
    if (!savedPosts.has(id)) {
      onACEarned?.(1);
      if (sessionId) reportSave(sessionId, id);
    }
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, [savedPosts, onACEarned, sessionId, reportSave]);

  const handlePost = async () => {
    if (!newContent.trim() && !newMedia) return;
    
    try {
      await createPost({
        description: newContent,
        contentType: newMedia?.type.startsWith("video/") ? "video" : "image",
        mediaFile: newMedia || undefined,
      });
      
      setNewContent("");
      setNewMedia(null);
      setShowCompose(false);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="flex flex-col">
        {features.compose && (
          <ComposeButton onClick={() => setShowCompose(true)} contentType={contentType} />
        )}
        <div className="flex flex-col items-center justify-center py-20 px-8">
          <Compass className="w-12 h-12 text-muted-foreground mb-3" strokeWidth={1.5} />
          <p className="text-muted-foreground text-sm text-center">{emptyMessage}</p>
          <p className="text-muted-foreground/60 text-xs text-center mt-1">{emptySubMessage}</p>
        </div>
        
        {showCompose && (
          <ComposeModal
            contentType={contentType}
            features={features}
            value={newContent}
            onChange={setNewContent}
            media={newMedia}
            onMediaChange={setNewMedia}
            onPost={handlePost}
            onClose={() => { setShowCompose(false); setNewContent(""); setNewMedia(null); }}
            isLoading={isUploading}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => setNewMedia(e.target.files?.[0] || null)}
      />

      {features.compose && (
        <ComposeButton onClick={() => setShowCompose(true)} contentType={contentType} />
      )}

      {/* Feed Content */}
      <div 
        ref={parentRef} 
        className={cn(
          "flex-1",
          layout === 'grid' ? `grid grid-cols-${columns} gap-0.5 px-2` : "flex flex-col",
          layout === 'masonry' && "columns-2 gap-3 space-y-3 px-4"
        )}
        style={layout === 'grid' ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
      >
        {layout === 'grid' ? (
          // Grid layout
          posts.map((post, index) => (
            <GridItem
              key={post.id}
              post={post}
              index={index}
              isLiked={likedPosts.has(post.id)}
              isSaved={savedPosts.has(post.id)}
              isExpanded={expandedId === post.id}
              onToggleLike={() => toggleLike(post.id)}
              onToggleSave={() => toggleSave(post.id)}
              onExpand={() => setExpandedId(expandedId === post.id ? null : post.id)}
            />
          ))
        ) : layout === 'masonry' ? (
          // Masonry layout
          posts.map((post) => (
            <MasonryItem
              key={post.id}
              post={post}
              isLiked={likedPosts.has(post.id)}
              isSaved={savedPosts.has(post.id)}
              onToggleLike={() => toggleLike(post.id)}
              onToggleSave={() => toggleSave(post.id)}
              onComment={() => setOpenCommentId(post.id)}
              formatTimeAgo={formatTimeAgo}
            />
          ))
        ) : (
          // Vertical layout
          posts.map((post, index) => (
            <VerticalItem
              key={post.id}
              post={post}
              index={index}
              isLiked={likedPosts.has(post.id)}
              isSaved={savedPosts.has(post.id)}
              onToggleLike={() => toggleLike(post.id)}
              onToggleSave={() => toggleSave(post.id)}
              onComment={() => setOpenCommentId(post.id)}
              formatTimeAgo={formatTimeAgo}
              onACEarned={onACEarned}
            />
          ))
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal
          contentType={contentType}
          features={features}
          value={newContent}
          onChange={setNewContent}
          media={newMedia}
          onMediaChange={setNewMedia}
          onPost={handlePost}
          onClose={() => { setShowCompose(false); setNewContent(""); setNewMedia(null); }}
          isLoading={isUploading}
        />
      )}

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

// =================== SUB-COMPONENTS ===================

const ComposeButton = ({ onClick, contentType }: { onClick: () => void; contentType: ContentType }) => {
  const labels: Record<ContentType, string> = {
    thread: "Start Thread",
    pulse: "New Pulse",
    post: "Create Post",
    moment: "Share Moment",
    fuzz: "Add to Feed",
  };
  
  return (
    <button
      className="mx-4 mb-4 py-3 rounded-lg bg-foreground/10 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      onClick={onClick}
    >
      <Plus className="w-5 h-5 text-foreground" strokeWidth={1.5} />
      <span className="text-foreground font-medium">{labels[contentType]}</span>
    </button>
  );
};

interface ComposeModalProps {
  contentType: ContentType;
  features: FeedContainerProps['features'];
  value: string;
  onChange: (value: string) => void;
  media: File | null;
  onMediaChange: (file: File | null) => void;
  onPost: () => void;
  onClose: () => void;
  isLoading: boolean;
}

const ComposeModal = ({
  contentType,
  features,
  value,
  onChange,
  media,
  onMediaChange,
  onPost,
  onClose,
  isLoading,
}: ComposeModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const placeholders: Record<ContentType, string> = {
    thread: "What's on your mind?",
    pulse: "Share a thought...",
    post: "What's happening?",
    moment: "Capture this moment...",
    fuzz: "Add to your feed...",
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex flex-col animate-fade-in">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => onMediaChange(e.target.files?.[0] || null)}
      />
      
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
        <button
          className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
          onClick={onClose}
        >
          <X className="w-6 h-6 text-foreground" strokeWidth={1.5} />
        </button>
        <span className="font-medium text-foreground capitalize">New {contentType}</span>
        <button
          className={cn(
            "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors active:scale-95",
            value.trim() || media
              ? "bg-foreground text-background"
              : "bg-muted/20 text-muted-foreground"
          )}
          onClick={onPost}
          disabled={(!value.trim() && !media) || isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
        </button>
      </div>

      <div className="flex-1 p-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback className="bg-muted/30 text-foreground">U</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <textarea
              placeholder={placeholders[contentType]}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-lg leading-relaxed min-h-32"
              autoFocus
            />
            
            {media && (
              <div className="mt-3 relative">
                <div className="w-full h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">{media.name}</span>
                </div>
                <button
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80"
                  onClick={() => onMediaChange(null)}
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
          {features?.media && (
            <button
              className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
            </button>
          )}
          {features?.audio && (
            <button className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform">
              <Mic className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
            </button>
          )}
          {features?.quotes && (
            <button className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform">
              <Quote className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Grid item for Fuzz layout
interface GridItemProps {
  post: any;
  index: number;
  isLiked: boolean;
  isSaved: boolean;
  isExpanded: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onExpand: () => void;
}

const GridItem = ({ post, index, isLiked, isSaved, isExpanded, onToggleLike, onToggleSave, onExpand }: GridItemProps) => {
  const isVideo = post.content_type === "video";
  
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden cursor-pointer",
        isExpanded ? "col-span-3 row-span-2" : "",
        index % 5 === 0 ? "aspect-[3/4]" : index % 3 === 0 ? "aspect-square" : "aspect-[4/5]"
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={onExpand}
    >
      <div className="absolute inset-0 bg-muted/20">
        {(post.thumbnail_url || post.cover_image_url) && (
          <img src={post.thumbnail_url || post.cover_image_url} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
      </div>

      {isVideo && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/40 backdrop-blur-sm">
          <Play className="w-2.5 h-2.5 text-foreground" fill="currentColor" />
        </div>
      )}

      <motion.div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="text-[10px] text-foreground font-medium truncate">@{post.username || 'user'}</p>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-6">
              <button
                className={cn("flex flex-col items-center gap-1", isLiked ? "text-amber-500" : "text-foreground")}
                onClick={(e) => { e.stopPropagation(); onToggleLike(); }}
              >
                <EnergyIcon className="w-6 h-6" isActive={isLiked} />
                <span className="text-xs">{(post.like_count || 0) + (isLiked ? 1 : 0)}</span>
              </button>
              <button
                className={cn("flex flex-col items-center gap-1", isSaved ? "text-primary" : "text-foreground")}
                onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
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
};

// Masonry item for Posts layout
interface MasonryItemProps {
  post: any;
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onComment: () => void;
  formatTimeAgo: (date: string) => string;
}

const MasonryItem = ({ post, isLiked, isSaved, onToggleLike, onToggleSave, onComment, formatTimeAgo }: MasonryItemProps) => {
  const isVideo = post.content_type === "video";
  
  return (
    <div className="break-inside-avoid bg-muted/10 rounded-lg overflow-hidden">
      <div className={cn("relative bg-muted/20 flex items-center justify-center", isVideo ? "aspect-video" : "aspect-[4/5]")}>
        {post.thumbnail_url || post.cover_image_url ? (
          <img src={post.thumbnail_url || post.cover_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
        )}
      </div>

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
          <span className="text-[10px] text-muted-foreground">{formatTimeAgo(post.created_at || '')}</span>
        </div>

        {post.description && (
          <p className="text-xs text-foreground leading-relaxed mb-3">{post.description}</p>
        )}

        <div className="flex items-center gap-3 text-muted-foreground">
          <button className={cn("flex items-center gap-1", isLiked && "text-amber-500")} onClick={onToggleLike}>
            <EnergyIcon className="w-4 h-4" isActive={isLiked} strokeWidth={1.5} />
            <span className="text-[10px]">{(post.like_count || 0) + (isLiked ? 1 : 0)}</span>
          </button>
          <button className="flex items-center gap-1" onClick={onComment}>
            <DiscussIcon className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px]">{post.comment_count || 0}</span>
          </button>
          <button className={cn("flex items-center gap-1", isSaved && "text-blue-500")} onClick={onToggleSave}>
            <CollectIcon className="w-4 h-4" isActive={isSaved} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Vertical item for Threads/Pulse layout
interface VerticalItemProps {
  post: any;
  index: number;
  isLiked: boolean;
  isSaved: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onComment: () => void;
  formatTimeAgo: (date: string) => string;
  onACEarned?: (amount: number) => void;
}

const VerticalItem = ({ post, index, isLiked, isSaved, onToggleLike, onToggleSave, onComment, formatTimeAgo, onACEarned }: VerticalItemProps) => {
  const [isReposted, setIsReposted] = useState(false);
  
  const toggleRepost = () => {
    if (!isReposted) onACEarned?.(2);
    setIsReposted(!isReposted);
  };
  
  return (
    <motion.div
      className="px-4 py-4 border-b border-border/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={post.avatar_url || undefined} />
          <AvatarFallback className="bg-muted/30 text-foreground">
            {(post.username || 'U')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">{post.display_name || post.username || 'User'}</span>
              <span className="text-muted-foreground text-sm">@{post.username || 'user'}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">{formatTimeAgo(post.created_at || '')}</span>
            </div>
            <button className="p-1 rounded-full hover:bg-muted/50">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <p className="text-foreground text-sm whitespace-pre-line mb-3">{post.description}</p>

          {(post.thumbnail_url || post.cover_image_url) && (
            <div className="rounded-lg overflow-hidden mb-3 aspect-video bg-muted/20">
              <img src={post.thumbnail_url || post.cover_image_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center gap-6 text-muted-foreground">
            <button className="flex items-center gap-1.5" onClick={onComment}>
              <DiscussIcon className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-xs">{post.comment_count || 0}</span>
            </button>

            <button
              className={cn("flex items-center gap-1.5", isReposted && "text-green-500")}
              onClick={toggleRepost}
            >
              <AmplifyIcon className="w-4 h-4" isActive={isReposted} strokeWidth={1.5} />
              <span className="text-xs">{isReposted ? 1 : 0}</span>
            </button>

            <button
              className={cn("flex items-center gap-1.5", isLiked && "text-amber-500")}
              onClick={onToggleLike}
            >
              <EnergyIcon className="w-4 h-4" isActive={isLiked} strokeWidth={1.5} />
              <span className="text-xs">{(post.like_count || 0) + (isLiked ? 1 : 0)}</span>
            </button>

            <button
              className={cn("flex items-center gap-1.5", isSaved && "text-blue-500")}
              onClick={onToggleSave}
            >
              <CollectIcon className="w-4 h-4" isActive={isSaved} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedContainer;
