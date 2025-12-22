import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useACEarning } from "@/hooks/useACEarning";
import { useWatchProgress } from "@/hooks/useWatchProgress";
import { useGestures } from "@/hooks/useGestures";
import CommentSheet from "../social/CommentSheet";
import FollowButton from "./FollowButton";
import AudioRow from "./AudioRow";

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
    hashtags?: string[];
    audioName?: string;
    artistName?: string;
  };
  isActive: boolean;
  onACEarned: (amount: number) => void;
  isFullscreen?: boolean;
  onSwipeRight?: () => void;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5];

const VideoCard = ({ video, isActive, onACEarned, isFullscreen = false, onSwipeRight }: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showRestartButton, setShowRestartButton] = useState(false);
  const [showACFly, setShowACFly] = useState<{ amount: number; id: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSegmentStartRef = useRef<number>(0);

  const { saveProgress, getResumePosition, markSegmentWatched } = useWatchProgress();
  
  const {
    startEarning,
    pauseEarning,
    stopEarning,
    getSpeedIndicator,
  } = useACEarning({
    onACEarned: (amount) => {
      onACEarned(amount);
      triggerACFly(amount);
    },
    playbackSpeed,
  });

  // Gesture handlers
  const handleDoubleTap = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true);
      onACEarned(1);
      triggerACFly(1);
    }
    setShowDoubleTapHeart(true);
    setTimeout(() => setShowDoubleTapHeart(false), 600);
  }, [isLiked, onACEarned]);

  const { gestureProps } = useGestures({
    onDoubleTap: handleDoubleTap,
    onSwipeRight: onSwipeRight,
  });

  const triggerACFly = (amount: number) => {
    setShowACFly({ amount, id: Date.now() });
    setTimeout(() => setShowACFly(null), 800);
  };

  // Hashtags with defaults
  const hashtags = video.hashtags || ["fyp", "trending", "viral"];
  const audioName = video.audioName || "Original Sound";
  const artistName = video.artistName || video.username;

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
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

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || isSeeking || isDragging) return;
    const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(currentProgress);
  }, [isSeeking, isDragging]);

  const handleSeekStart = () => {
    setIsSeeking(true);
    pauseEarning();
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

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * videoRef.current.duration;
    
    handleSeekStart();
    videoRef.current.currentTime = newTime;
    setProgress(percent * 100);
    handleSeekEnd();
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
    <div 
      className="relative h-full w-full bg-background snap-start"
      {...gestureProps}
    >
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

      {/* Double Tap Heart Animation */}
      <AnimatePresence>
        {showDoubleTapHeart && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <Heart className="w-24 h-24 text-destructive fill-destructive drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hide overlays in fullscreen mode */}
      {!isFullscreen && (
        <>
          {/* Subtle Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/30 pointer-events-none" />

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
                  className="p-3 rounded-full bg-background/20 backdrop-blur-sm"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Play className="w-8 h-8 text-foreground" fill="currentColor" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AC Fly Animation */}
          <AnimatePresence>
            {showACFly && (
              <motion.div
                key={showACFly.id}
                className="absolute top-1/2 left-1/2 pointer-events-none z-30 flex items-center gap-1"
                initial={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                animate={{ opacity: 0, scale: 0.5, y: "-250px" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="text-base font-bold text-primary">+{showACFly.amount} AC</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Restart Button */}
          <AnimatePresence>
            {showRestartButton && (
              <motion.div
                className="absolute top-16 left-3 z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <motion.button
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/50 backdrop-blur-sm border border-border/30"
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRestart}
                >
                  <RotateCcw className="w-3 h-3 text-foreground" />
                  <span className="text-[10px] text-foreground">Restart</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Speed Indicator */}
          {speedIndicator.isModified && (
            <motion.div
              className="absolute top-16 right-3 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium",
                speedIndicator.modifier > 1 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-orange-500/20 text-orange-400"
              )}>
                {speedIndicator.speed}x {speedIndicator.modifier > 1 ? "+5%" : `-${Math.round((1 - speedIndicator.modifier) * 100)}%`}
              </div>
            </motion.div>
          )}

          {/* Seekable Progress Bar */}
          <div 
            ref={progressRef}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted/20 cursor-pointer z-20"
            onClick={handleProgressBarClick}
          >
            <motion.div
              className="h-full bg-foreground/60"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-12 left-3 right-16 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Username + Follow */}
              <div className="flex items-center gap-2 mb-1.5">
                <p className="font-semibold text-sm text-foreground">@{video.username}</p>
                <FollowButton username={video.username} />
              </div>
              
              {/* Description */}
              <p className="text-xs text-foreground/90 line-clamp-2 mb-1.5">{video.description}</p>
              
              {/* Hashtags */}
              <div className="flex flex-wrap gap-1 mb-1.5">
                {hashtags.slice(0, 4).map((tag, i) => (
                  <motion.span
                    key={tag}
                    className="text-[10px] text-primary font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>

              {/* Audio Row */}
              <AudioRow audioName={audioName} artistName={artistName} />
            </motion.div>
          </div>

          {/* Right Side Actions */}
          <div className="absolute right-2 bottom-28 flex flex-col items-center gap-4 z-10">
            {/* Like */}
            <motion.button
              className="flex flex-col items-center gap-0.5"
              whileTap={{ scale: 0.85 }}
              onClick={handleLike}
            >
              <motion.div animate={isLiked ? { scale: [1, 1.3, 1] } : {}}>
                <Heart
                  className={cn(
                    "w-6 h-6 drop-shadow-lg",
                    isLiked ? "text-destructive fill-destructive" : "text-foreground"
                  )}
                />
              </motion.div>
              <span className="text-[10px] text-foreground/80 font-medium">
                {(video.likes + (isLiked ? 1 : 0)).toLocaleString()}
              </span>
            </motion.button>

            {/* Comment */}
            <motion.button
              className="flex flex-col items-center gap-0.5"
              whileTap={{ scale: 0.85 }}
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="w-6 h-6 text-foreground drop-shadow-lg" />
              <span className="text-[10px] text-foreground/80 font-medium">{video.comments.toLocaleString()}</span>
            </motion.button>

            {/* Share */}
            <motion.button
              className="flex flex-col items-center gap-0.5"
              whileTap={{ scale: 0.85 }}
              onClick={handleShare}
            >
              <Share2 className="w-6 h-6 text-foreground drop-shadow-lg" />
              <span className="text-[10px] text-foreground/80 font-medium">{video.shares.toLocaleString()}</span>
            </motion.button>

            {/* Save */}
            <motion.button
              className="flex flex-col items-center gap-0.5"
              whileTap={{ scale: 0.85 }}
              onClick={handleSave}
            >
              <motion.div animate={isSaved ? { scale: [1, 1.3, 1] } : {}}>
                <Bookmark
                  className={cn(
                    "w-6 h-6 drop-shadow-lg",
                    isSaved ? "text-primary fill-primary" : "text-foreground"
                  )}
                />
              </motion.div>
            </motion.button>

            {/* Mute Toggle */}
            <motion.button
              className="mt-1"
              whileTap={{ scale: 0.85 }}
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-foreground/70 drop-shadow-lg" />
              ) : (
                <Volume2 className="w-5 h-5 text-foreground drop-shadow-lg" />
              )}
            </motion.button>

            {/* Speed Control */}
            <motion.button
              className="mt-0.5 px-1.5 py-0.5 rounded-full bg-background/30 backdrop-blur-sm"
              whileTap={{ scale: 0.9 }}
              onClick={cycleSpeed}
            >
              <span className="text-[10px] text-foreground font-medium">{playbackSpeed}x</span>
            </motion.button>
          </div>
        </>
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
