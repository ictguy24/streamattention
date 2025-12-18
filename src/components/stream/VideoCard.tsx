import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Play, Pause, Volume2, VolumeX, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useACEarning } from "@/hooks/useACEarning";
import { useWatchProgress } from "@/hooks/useWatchProgress";
import CommentSheet from "../social/CommentSheet";

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

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5];

const VideoCard = ({ video, isActive, onACEarned }: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);
  const [showACFly, setShowACFly] = useState<number | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSegmentStartRef = useRef<number>(0);

  const { saveProgress, getResumePosition, markSegmentWatched, getNewWatchTime } = useWatchProgress();
  
  const {
    startEarning,
    pauseEarning,
    stopEarning,
    isEarning,
    getSpeedIndicator,
  } = useACEarning({
    onACEarned: (amount) => {
      onACEarned(amount);
      triggerACFly(amount);
    },
    playbackSpeed,
  });

  const triggerACFly = (amount: number) => {
    setShowACFly(amount);
    setTimeout(() => setShowACFly(null), 800);
  };

  // Handle video play/pause based on visibility
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      // Resume from last position
      const resumePos = getResumePosition(video.id);
      if (resumePos > 0 && resumePos < videoRef.current.duration - 1) {
        videoRef.current.currentTime = resumePos;
        setShowRestartButton(true);
        restartTimeoutRef.current = setTimeout(() => setShowRestartButton(false), 3000);
      }
      
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      lastSegmentStartRef.current = videoRef.current.currentTime;
      startEarning();
    } else {
      // Save progress on leave
      if (videoRef.current.currentTime > 0) {
        saveProgress(video.id, videoRef.current.currentTime, videoRef.current.duration);
        markSegmentWatched(video.id, lastSegmentStartRef.current, videoRef.current.currentTime);
      }
      videoRef.current.pause();
      setIsPlaying(false);
      stopEarning();
    }

    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };
  }, [isActive, video.id]);

  // Track progress
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || isSeeking) return;
    const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(currentProgress);
  }, [isSeeking]);

  // Handle seeking - pause AC earning
  const handleSeekStart = () => {
    setIsSeeking(true);
    pauseEarning();
    // Save current segment before seeking
    if (videoRef.current) {
      markSegmentWatched(video.id, lastSegmentStartRef.current, videoRef.current.currentTime);
    }
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    if (isPlaying && videoRef.current) {
      lastSegmentStartRef.current = videoRef.current.currentTime;
      startEarning();
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      pauseEarning();
      markSegmentWatched(video.id, lastSegmentStartRef.current, videoRef.current.currentTime);
    } else {
      videoRef.current.play();
      lastSegmentStartRef.current = videoRef.current.currentTime;
      startEarning();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    lastSegmentStartRef.current = 0;
    setShowRestartButton(false);
  };

  const cycleSpeed = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];
    setPlaybackSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  const handleLike = () => {
    if (!isLiked) {
      onACEarned(1);
      triggerACFly(1);
    }
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    if (!isSaved) {
      onACEarned(2);
      triggerACFly(2);
    }
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    onACEarned(5);
    triggerACFly(5);
  };

  const speedIndicator = getSpeedIndicator();

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
        onSeeking={handleSeekStart}
        onSeeked={handleSeekEnd}
      />

      {/* Gradient Overlays - Subtle */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />

      {/* Play/Pause Indicator */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="p-4 rounded-full bg-background/20 backdrop-blur-sm"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Play className="w-10 h-10 text-foreground" fill="currentColor" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AC Fly Animation */}
      <AnimatePresence>
        {showACFly !== null && (
          <motion.div
            className="absolute top-1/2 left-1/2 pointer-events-none z-30 flex items-center gap-1"
            initial={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            animate={{ 
              opacity: 0, 
              scale: 0.5, 
              x: "calc(-50% + 0px)", 
              y: "-200px" 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold text-primary">+{showACFly} AC</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restart Button */}
      <AnimatePresence>
        {showRestartButton && (
          <motion.div
            className="absolute top-20 left-4 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <motion.button
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm border border-border/30"
              whileTap={{ scale: 0.95 }}
              onClick={handleRestart}
            >
              <RotateCcw className="w-4 h-4 text-foreground" />
              <span className="text-xs text-foreground">Restart</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speed Indicator */}
      {speedIndicator.isModified && (
        <motion.div
          className="absolute top-20 right-4 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className={cn(
            "px-2 py-1 rounded-full text-xs font-medium border",
            speedIndicator.modifier > 1 
              ? "bg-green-500/20 text-green-400 border-green-500/30" 
              : "bg-orange-500/20 text-orange-400 border-orange-500/30"
          )}>
            {speedIndicator.speed}x {speedIndicator.modifier > 1 ? "+5%" : speedIndicator.modifier < 1 ? `-${Math.round((1 - speedIndicator.modifier) * 100)}%` : ""}
          </div>
        </motion.div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20">
        <motion.div
          className="h-full bg-foreground/50"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-16 left-4 right-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="font-semibold text-foreground mb-1">@{video.username}</p>
          <p className="text-sm text-foreground/80 line-clamp-2">{video.description}</p>
        </motion.div>
      </div>

      {/* Right Side Actions - Floating icons only */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-6 z-10">
        {/* Like */}
        <motion.button
          className="flex flex-col items-center gap-1"
          whileTap={{ scale: 0.85 }}
          onClick={handleLike}
        >
          <motion.div
            animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
            className="relative"
          >
            <Heart
              className={cn(
                "w-7 h-7 drop-shadow-lg",
                isLiked ? "text-destructive fill-destructive" : "text-foreground"
              )}
            />
            {/* Tap halo */}
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={false}
              whileTap={{ 
                boxShadow: "0 0 20px 10px hsl(var(--destructive) / 0.3)",
                scale: 1.5
              }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
          <span className="text-xs text-foreground/80 font-medium">
            {(video.likes + (isLiked ? 1 : 0)).toLocaleString()}
          </span>
        </motion.button>

        {/* Comment */}
        <motion.button
          className="flex flex-col items-center gap-1"
          whileTap={{ scale: 0.85 }}
          onClick={() => setShowComments(true)}
        >
          <MessageCircle className="w-7 h-7 text-foreground drop-shadow-lg" />
          <span className="text-xs text-foreground/80 font-medium">{video.comments.toLocaleString()}</span>
        </motion.button>

        {/* Share */}
        <motion.button
          className="flex flex-col items-center gap-1"
          whileTap={{ scale: 0.85 }}
          onClick={handleShare}
        >
          <Share2 className="w-7 h-7 text-foreground drop-shadow-lg" />
          <span className="text-xs text-foreground/80 font-medium">{video.shares.toLocaleString()}</span>
        </motion.button>

        {/* Save */}
        <motion.button
          className="flex flex-col items-center gap-1"
          whileTap={{ scale: 0.85 }}
          onClick={handleSave}
        >
          <motion.div animate={isSaved ? { scale: [1, 1.3, 1] } : {}}>
            <Bookmark
              className={cn(
                "w-7 h-7 drop-shadow-lg",
                isSaved ? "text-primary fill-primary" : "text-foreground"
              )}
            />
          </motion.div>
        </motion.button>

        {/* Mute Toggle */}
        <motion.button
          className="mt-2"
          whileTap={{ scale: 0.85 }}
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6 text-foreground/70 drop-shadow-lg" />
          ) : (
            <Volume2 className="w-6 h-6 text-foreground drop-shadow-lg" />
          )}
        </motion.button>

        {/* Speed Control */}
        <motion.button
          className="mt-1 px-2 py-1 rounded-full bg-background/30 backdrop-blur-sm"
          whileTap={{ scale: 0.9 }}
          onClick={cycleSpeed}
        >
          <span className="text-xs text-foreground font-medium">{playbackSpeed}x</span>
        </motion.button>
      </div>

      {/* AC Earning Indicator */}
      {isActive && isEarning && (
        <div className="absolute top-20 left-4 z-10">
          <motion.div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/30 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div 
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs text-foreground/80">Earning AC</span>
          </motion.div>
        </div>
      )}

      {/* Comment Sheet */}
      <CommentSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        videoId={video.id}
        onACEarned={onACEarned}
      />
    </div>
  );
};

export default VideoCard;
