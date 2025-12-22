import { useState, useRef } from "react";
import { MoreHorizontal, Play, ImageIcon, Plus, X, Edit3, Image, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import CommentsPanel from "./CommentsPanel";
import { EnergyIcon, DiscussIcon, BroadcastIcon, CollectIcon, AmplifyIcon } from "./InteractionIcons";

interface Post {
  id: string;
  username: string;
  content: string;
  mediaType: "image" | "video" | "carousel";
  mediaCount?: number;
  likes: number;
  comments: number;
  reposts: number;
  saves: number;
  timeAgo: string;
  isLiked: boolean;
  isReposted: boolean;
  isSaved: boolean;
  hashtags?: string[];
}

const DEMO_POSTS: Post[] = [
  {
    id: "1",
    username: "travel_adventures",
    content: "Sunset views from the mountains. The hike was worth every step.",
    mediaType: "carousel",
    mediaCount: 5,
    likes: 2340,
    comments: 89,
    reposts: 45,
    saves: 234,
    timeAgo: "2h",
    isLiked: false,
    isReposted: false,
    isSaved: false,
    hashtags: ["travel", "adventure", "mountains"],
  },
  {
    id: "2",
    username: "foodie_delights",
    content: "Made this amazing pasta from scratch. Recipe in bio.",
    mediaType: "image",
    likes: 1205,
    comments: 45,
    reposts: 23,
    saves: 156,
    timeAgo: "4h",
    isLiked: true,
    isReposted: false,
    isSaved: true,
    hashtags: ["food", "homemade", "pasta"],
  },
  {
    id: "3",
    username: "daily_vlogs",
    content: "A day in my life as a creator. Full video on my profile.",
    mediaType: "video",
    likes: 5670,
    comments: 234,
    reposts: 156,
    saves: 445,
    timeAgo: "6h",
    isLiked: false,
    isReposted: true,
    isSaved: false,
    hashtags: ["vlog", "creator", "dayinmylife"],
  },
  {
    id: "4",
    username: "tech_reviews",
    content: "First impressions of the new device. Surprisingly good.",
    mediaType: "video",
    likes: 3420,
    comments: 178,
    reposts: 89,
    saves: 267,
    timeAgo: "8h",
    isLiked: false,
    isReposted: false,
    isSaved: false,
    hashtags: ["tech", "review"],
  },
];

interface PostsModeProps {
  onACEarned?: (amount: number) => void;
}

const PostsMode = ({ onACEarned }: PostsModeProps) => {
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostMedia, setNewPostMedia] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleLike = (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post && !post.isLiked) {
      onACEarned?.(1);
    }
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const toggleRepost = (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post && !post.isReposted) {
      onACEarned?.(2);
    }
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, isReposted: !p.isReposted, reposts: p.isReposted ? p.reposts - 1 : p.reposts + 1 }
          : p
      )
    );
  };

  const toggleSave = (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post && !post.isSaved) {
      onACEarned?.(1);
    }
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, isSaved: !p.isSaved, saves: p.isSaved ? p.saves - 1 : p.saves + 1 }
          : p
      )
    );
  };

  const handleShare = (id: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        text: posts.find(p => p.id === id)?.content,
        url: window.location.href,
      });
    }
    onACEarned?.(5);
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !newPostMedia) return;
    
    const newPost: Post = {
      id: Date.now().toString(),
      username: "you",
      content: newPostContent,
      mediaType: newPostMedia?.type.startsWith("video/") ? "video" : "image",
      likes: 0,
      comments: 0,
      reposts: 0,
      saves: 0,
      timeAgo: "now",
      isLiked: false,
      isReposted: false,
      isSaved: false,
    };
    
    setPosts(prev => [newPost, ...prev]);
    setNewPostContent("");
    setNewPostMedia(null);
    setShowCreatePost(false);
    onACEarned?.(10);
  };

  const handleEditPost = (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      setNewPostContent(post.content);
      setEditingPostId(id);
      setShowCreatePost(true);
    }
  };

  const handleSaveEdit = () => {
    if (!editingPostId) return;
    
    setPosts(prev =>
      prev.map(p =>
        p.id === editingPostId
          ? { ...p, content: newPostContent }
          : p
      )
    );
    setEditingPostId(null);
    setNewPostContent("");
    setShowCreatePost(false);
  };

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

      {/* Create/Edit Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 z-50 bg-background/95 flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
            <button
              className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
              onClick={() => {
                setShowCreatePost(false);
                setEditingPostId(null);
                setNewPostContent("");
                setNewPostMedia(null);
              }}
            >
              <X className="w-6 h-6 text-foreground" strokeWidth={1.5} />
            </button>
            <span className="font-medium text-foreground">
              {editingPostId ? "Edit Post" : "Create Post"}
            </span>
            <button
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors active:scale-95",
                newPostContent.trim() || newPostMedia
                  ? "bg-foreground text-background"
                  : "bg-muted/20 text-muted-foreground"
              )}
              onClick={editingPostId ? handleSaveEdit : handleCreatePost}
              disabled={!newPostContent.trim() && !newPostMedia}
            >
              {editingPostId ? "Save" : "Post"}
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
                
                {/* Media preview */}
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

      {/* Masonry Grid */}
      <div className="columns-2 gap-3 space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="break-inside-avoid bg-muted/10 rounded-lg overflow-hidden"
          >
            {/* Media Placeholder */}
            <div className={cn(
              "relative bg-muted/20 flex items-center justify-center",
              post.mediaType === "carousel" ? "aspect-square" : 
              post.mediaType === "video" ? "aspect-video" : "aspect-[4/5]"
            )}>
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                {post.mediaType === "video" ? (
                  <Play className="w-8 h-8" strokeWidth={1.5} />
                ) : (
                  <ImageIcon className="w-8 h-8" strokeWidth={1.5} />
                )}
              </div>

              {post.mediaType === "carousel" && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-background/60 backdrop-blur-sm">
                  <span className="text-[10px] text-foreground">1/{post.mediaCount}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-muted/30 text-foreground text-[10px]">
                      {post.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium text-foreground">@{post.username}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{post.timeAgo}</span>
                  {post.username === "you" && (
                    <button
                      className="p-1 rounded hover:bg-muted/20 active:scale-95 transition-all"
                      onClick={() => handleEditPost(post.id)}
                    >
                      <Edit3 className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>

              {/* Text */}
              <p className="text-xs text-foreground leading-relaxed mb-2">{post.content}</p>

              {/* Hashtags */}
              {post.hashtags && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.hashtags.map(tag => (
                    <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Actions - Custom icons */}
              <div className="flex items-center gap-3 text-muted-foreground">
                <button
                  className={cn(
                    "flex items-center gap-1 active:scale-95 transition-all",
                    post.isLiked ? "text-amber-500" : ""
                  )}
                  onClick={() => toggleLike(post.id)}
                >
                  <EnergyIcon className="w-4 h-4" isActive={post.isLiked} strokeWidth={1.5} />
                  <span className="text-[10px]">{post.likes.toLocaleString()}</span>
                </button>

                <button 
                  className="flex items-center gap-1 active:scale-95 transition-all"
                  onClick={() => setOpenCommentId(post.id)}
                >
                  <DiscussIcon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-[10px]">{post.comments}</span>
                </button>

                <button
                  className={cn(
                    "flex items-center gap-1 active:scale-95 transition-all",
                    post.isReposted ? "text-green-500" : ""
                  )}
                  onClick={() => toggleRepost(post.id)}
                >
                  <AmplifyIcon className="w-4 h-4" isActive={post.isReposted} strokeWidth={1.5} />
                  <span className="text-[10px]">{post.reposts}</span>
                </button>

                <button
                  className={cn(
                    "flex items-center gap-1 active:scale-95 transition-all",
                    post.isSaved ? "text-blue-500" : ""
                  )}
                  onClick={() => toggleSave(post.id)}
                >
                  <CollectIcon className="w-4 h-4" isActive={post.isSaved} strokeWidth={1.5} />
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
        ))}
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