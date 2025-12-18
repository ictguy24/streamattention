import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Moment {
  id: string;
  username: string;
  content: string;
  mediaType: "image" | "video" | "carousel";
  mediaCount?: number;
  likes: number;
  comments: number;
  timeAgo: string;
  isLiked: boolean;
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
    timeAgo: "2h",
    isLiked: false,
  },
  {
    id: "2",
    username: "foodie_delights",
    content: "Made this amazing pasta from scratch! Recipe in bio 🍝",
    mediaType: "image",
    likes: 1205,
    comments: 45,
    timeAgo: "4h",
    isLiked: true,
  },
  {
    id: "3",
    username: "daily_vlogs",
    content: "A day in my life as a creator 🎬 Full video on my profile!",
    mediaType: "video",
    likes: 5670,
    comments: 234,
    timeAgo: "6h",
    isLiked: false,
  },
  {
    id: "4",
    username: "art_studio",
    content: "New digital artwork dropping soon 🎨 Stay tuned!",
    mediaType: "image",
    likes: 890,
    comments: 32,
    timeAgo: "8h",
    isLiked: false,
  },
];

const MomentsMode = () => {
  const [moments, setMoments] = useState(DEMO_MOMENTS);

  const toggleLike = (id: string) => {
    setMoments(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, isLiked: !m.isLiked, likes: m.isLiked ? m.likes - 1 : m.likes + 1 }
          : m
      )
    );
  };

  return (
    <motion.div
      className="flex flex-col gap-4 px-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {moments.map((moment, index) => (
        <motion.div
          key={moment.id}
          className="glass-card rounded-xl overflow-hidden"
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
          <div className="relative aspect-square bg-muted/30 flex items-center justify-center">
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

            {/* Carousel Indicator */}
            {moment.mediaType === "carousel" && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-background/70 backdrop-blur-sm">
                <span className="text-xs text-foreground">1/{moment.mediaCount}</span>
              </div>
            )}

            {/* Video Play Button */}
            {moment.mediaType === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-4 rounded-full bg-background/50 backdrop-blur-sm">
                  <Play className="w-8 h-8 text-foreground" fill="currentColor" />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-3">
            <div className="flex items-center gap-4 mb-2">
              <motion.button
                className="flex items-center gap-1.5"
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
              </motion.button>

              <button className="flex items-center gap-1.5">
                <MessageCircle className="w-6 h-6 text-foreground" />
                <span className="text-sm text-muted-foreground">{moment.comments}</span>
              </button>

              <button className="flex items-center gap-1.5">
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
    </motion.div>
  );
};

export default MomentsMode;
