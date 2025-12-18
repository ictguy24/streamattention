import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, ImageIcon, Repeat2, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import CommentSheet from "./CommentSheet";

interface Moment {
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
}

const DEMO_MOMENTS: Moment[] = [
  {
    id: "1",
    username: "travel_adventures",
    content: "Sunset views from the mountains 🏔️✨ #travel #adventure",
    mediaType: "carousel",
    mediaCount: 5,
    likes: 2340,
    comments: 89,
    reposts: 45,
    timeAgo: "2h",
    isLiked: false,
    isReposted: false,
  },
  {
    id: "2",
    username: "foodie_delights",
    content: "Made this amazing pasta from scratch! Recipe in bio 🍝",
    mediaType: "image",
    likes: 1205,
    comments: 45,
    reposts: 23,
    timeAgo: "4h",
    isLiked: true,
    isReposted: false,
  },
  {
    id: "3",
    username: "daily_vlogs",
    content: "A day in my life as a creator 🎬 Full video on my profile!",
    mediaType: "video",
    likes: 5670,
    comments: 234,
    reposts: 156,
    timeAgo: "6h",
    isLiked: false,
    isReposted: true,
  },
];

interface MomentsModeProps {
  onACEarned?: (amount: number) => void;
}

const MomentsMode = ({ onACEarned }: MomentsModeProps) => {
  const [moments, setMoments] = useState(DEMO_MOMENTS);
  const [openCommentId, setOpenCommentId] = useState<string | null>(null);
  const [showACFly, setShowACFly] = useState<string | null>(null);

  const toggleLike = (id: string) => {
    const moment = moments.find(m => m.id === id);
    if (moment && !moment.isLiked) {
      onACEarned?.(1);
      setShowACFly(id);
      setTimeout(() => setShowACFly(null), 800);
    }
    setMoments(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, isLiked: !m.isLiked, likes: m.isLiked ? m.likes - 1 : m.likes + 1 }
          : m
      )
    );
  };

  const toggleRepost = (id: string) => {
    const moment = moments.find(m => m.id === id);
    if (moment && !moment.isReposted) {
      onACEarned?.(2);
    }
    setMoments(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, isReposted: !m.isReposted, reposts: m.isReposted ? m.reposts - 1 : m.reposts + 1 }
          : m
      )
    );
  };

  const handleShare = (id: string) => {
    onACEarned?.(5);
  };

  return (
    <motion.div
      className="flex flex-col gap-3 px-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {moments.map((moment, index) => (
        <motion.div
          key={moment.id}
          className="rounded-xl overflow-hidden bg-card/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {moment.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground text-sm">@{moment.username}</p>
                <p className="text-xs text-muted-foreground">{moment.timeAgo}</p>
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-muted/50">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Media Placeholder */}
          <div className="relative aspect-square bg-muted/20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {moment.mediaType === "video" ? (
                <Play className="w-12 h-12" />
              ) : (
                <ImageIcon className="w-12 h-12" />
              )}
              <span className="text-sm">
                {moment.mediaType === "carousel"
                  ? `${moment.mediaCount} photos`
                  : moment.mediaType === "video"
                  ? "Video"
                  : "Photo"}
              </span>
            </div>

            {moment.mediaType === "carousel" && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-background/70 backdrop-blur-sm">
                <span className="text-xs text-foreground">1/{moment.mediaCount}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-3">
            <div className="flex items-center gap-4 mb-2 relative">
              {/* Like */}
              <motion.button
                className="flex items-center gap-1.5 relative"
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleLike(moment.id)}
              >
                <Heart
                  className={cn(
                    "w-6 h-6",
                    moment.isLiked ? "text-destructive fill-destructive" : "text-foreground"
                  )}
                />
                <span className="text-sm text-muted-foreground">{moment.likes.toLocaleString()}</span>
                
                {/* AC fly animation */}
                {showACFly === moment.id && (
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

              {/* Comment */}
              <button 
                className="flex items-center gap-1.5"
                onClick={() => setOpenCommentId(moment.id)}
              >
                <MessageCircle className="w-6 h-6 text-foreground" />
                <span className="text-sm text-muted-foreground">{moment.comments}</span>
              </button>

              {/* Repost */}
              <motion.button 
                className="flex items-center gap-1.5"
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleRepost(moment.id)}
              >
                <Repeat2 className={cn(
                  "w-6 h-6",
                  moment.isReposted ? "text-green-500" : "text-foreground"
                )} />
                <span className="text-sm text-muted-foreground">{moment.reposts}</span>
              </motion.button>

              {/* Share */}
              <button 
                className="flex items-center gap-1.5"
                onClick={() => handleShare(moment.id)}
              >
                <Share2 className="w-6 h-6 text-foreground" />
              </button>
            </div>

            {/* Caption */}
            <p className="text-sm text-foreground">
              <span className="font-medium">@{moment.username}</span>{" "}
              {moment.content}
            </p>
          </div>
        </motion.div>
      ))}

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
