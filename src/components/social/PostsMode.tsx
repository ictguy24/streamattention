import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, ImageIcon, Repeat2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import CommentsPanel from "./CommentsPanel";

interface Post {
  id: string;
  username: string;
  content: string;
  mediaType: "image" | "video" | "carousel";
  mediaCount?: number;
  likes: number;
  comments: number;
  reposts: number;
  timeAgo: string;
  isLiked: boolean;
  isReposted: boolean;
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
    timeAgo: "2h",
    isLiked: false,
    isReposted: false,
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
    timeAgo: "4h",
    isLiked: true,
    isReposted: false,
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
    timeAgo: "6h",
    isLiked: false,
    isReposted: true,
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
    timeAgo: "8h",
    isLiked: false,
    isReposted: false,
    hashtags: ["tech", "review"],
  },
];

interface PostsModeProps {
  onACEarned?: (amount: number) => void;
}

const PostsMode = ({ onACEarned }: PostsModeProps) => {
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);

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

  const handleShare = (id: string) => {
    onACEarned?.(5);
  };

  return (
    <div className="flex flex-col px-4">
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
                <span className="text-[10px] text-muted-foreground">{post.timeAgo}</span>
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

              {/* Actions */}
              <div className="flex items-center gap-3 text-muted-foreground">
                <button
                  className={cn(
                    "flex items-center gap-1 active:scale-95 transition-all",
                    post.isLiked ? "text-red-500" : ""
                  )}
                  onClick={() => toggleLike(post.id)}
                >
                  <Heart className={cn("w-4 h-4", post.isLiked && "fill-current")} strokeWidth={1.5} />
                  <span className="text-[10px]">{post.likes.toLocaleString()}</span>
                </button>

                <button 
                  className="flex items-center gap-1 active:scale-95 transition-all"
                  onClick={() => setOpenCommentId(post.id)}
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-[10px]">{post.comments}</span>
                </button>

                <button
                  className={cn(
                    "flex items-center gap-1 active:scale-95 transition-all",
                    post.isReposted ? "text-green-500" : ""
                  )}
                  onClick={() => toggleRepost(post.id)}
                >
                  <Repeat2 className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-[10px]">{post.reposts}</span>
                </button>

                <button 
                  className="flex items-center gap-1 active:scale-95 transition-all ml-auto"
                  onClick={() => handleShare(post.id)}
                >
                  <Share2 className="w-4 h-4" strokeWidth={1.5} />
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
