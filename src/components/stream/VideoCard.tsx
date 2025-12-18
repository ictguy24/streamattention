import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: {
    id: string;
    url: string;
    poster?: string;
    username: string;
    description: string;
    likes: number;
    comments: number;
    shares: number;
  };
  isActive: boolean;
  onACEarned: (amount: number) => void;
}

const VideoCard = ({ video, isActive, onACEarned }: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasEarnedAC, setHasEarnedAC] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showACBurst, setShowACBurst] = useState(false);

  // Handle video play/pause based on visibility
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setProgress(0);
      setHasEarnedAC(false);
    }
  }, [isActive]);

  // Track progress and trigger AC earning at 70%
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(currentProgress);

    // Earn AC at 70% watch time
    if (currentProgress >= 70 && !hasEarnedAC) {
      setHasEarnedAC(true);
      setShowACBurst(true);
      onACEarned(10);
      setTimeout(() => setShowACBurst(false), 1500);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      onACEarned(2);
    }
  };

  return (
    <div className="relative h-full w-full bg-background snap-start">
      {/* Video */}
      <video
        ref={videoRef}
        src={video.url}
        poster={video.poster}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30 pointer-events-none" />

      {/* Play/Pause Indicator */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="p-4 rounded-full bg-background/30 backdrop-blur-sm">
              <Play className="w-12 h-12 text-foreground" fill="currentColor" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AC Earned Burst */}
      <AnimatePresence>
        {showACBurst && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
          >
            <div className="px-6 py-3 rounded-full bg-primary/90 backdrop-blur-sm neon-glow">
              <span className="text-2xl font-bold text-primary-foreground">+10 AC</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/30">
        <motion.div
          className={cn(
            "h-full",
            hasEarnedAC ? "bg-primary" : "bg-foreground/50"
          )}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
        {/* 70% Marker */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-primary/50" style={{ left: "70%" }} />
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-16 left-4 right-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="font-bold text-foreground mb-1">@{video.username}</p>
          <p className="text-sm text-foreground/80 line-clamp-2">{video.description}</p>
        </motion.div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
        {/* Like */}
        <motion.button
          className="flex flex-col items-center gap-1"
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
            className={cn(
              "p-3 rounded-full",
              isLiked ? "bg-destructive/20" : "bg-background/30 backdrop-blur-sm"
            )}
          >
            <Heart
              className={cn("w-7 h-7", isLiked ? "text-destructive fill-destructive" : "text-foreground")}
            />
          </motion.div>
          <span className="text-xs text-foreground font-medium">
            {(video.likes + (isLiked ? 1 : 0)).toLocaleString()}
          </span>
        </motion.button>

        {/* Comment */}
        <motion.button
          className="flex flex-col items-center gap-1"
          whileTap={{ scale: 0.9 }}
        >
          <div className="p-3 rounded-full bg-background/30 backdrop-blur-sm">
            <MessageCircle className="w-7 h-7 text-foreground" />
          </div>
          <span className="text-xs text-foreground font-medium">{video.comments.toLocaleString()}</span>
        </motion.button>

        {/* Share */}
        <motion.button
          className="flex flex-col items-center gap-1"
          whileTap={{ scale: 0.9 }}
        >
          <div className="p-3 rounded-full bg-background/30 backdrop-blur-sm">
            <Share2 className="w-7 h-7 text-foreground" />
          </div>
          <span className="text-xs text-foreground font-medium">{video.shares.toLocaleString()}</span>
        </motion.button>

        {/* Save */}
        <motion.button
          className="flex flex-col items-center gap-1"
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSaved(!isSaved)}
        >
          <motion.div
            animate={isSaved ? { scale: [1, 1.3, 1] } : {}}
            className={cn(
              "p-3 rounded-full",
              isSaved ? "bg-primary/20" : "bg-background/30 backdrop-blur-sm"
            )}
          >
            <Bookmark
              className={cn("w-7 h-7", isSaved ? "text-primary fill-primary" : "text-foreground")}
            />
          </motion.div>
        </motion.button>

        {/* Mute Toggle */}
        <motion.button
          className="p-3 rounded-full bg-background/30 backdrop-blur-sm"
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6 text-foreground" />
          ) : (
            <Volume2 className="w-6 h-6 text-foreground" />
          )}
        </motion.button>
      </div>

      {/* AC Progress Indicator */}
      {isActive && !hasEarnedAC && (
        <div className="absolute top-20 left-4 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-foreground">Watch to earn AC</span>
          </div>
        </div>
      )}

      {hasEarnedAC && (
        <div className="absolute top-20 left-4 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm">
            <span className="text-xs text-primary font-medium">✓ AC Earned!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCard;
