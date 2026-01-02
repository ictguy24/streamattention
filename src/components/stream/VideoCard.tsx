import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAttention } from "@/contexts/AttentionContext";
import { useGestures } from "@/hooks/useGestures";
import CommentSheet from "../social/CommentSheet";
import FollowButton from "./FollowButton";
import AudioRow from "./AudioRow";
import { 
  AnimatedEnergyIcon, 
  AnimatedDiscussIcon, 
  AnimatedBroadcastIcon, 
  AnimatedCollectIcon 
} from "../icons/AnimatedIcons";
import { EnergyIcon } from "../social/InteractionIcons";

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
  isFullscreen?: boolean;
  onSwipeRight?: () => void;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5];

const VideoCard = ({ video, isActive, isFullscreen = false, onSwipeRight }: VideoCardProps) => {
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
  const [isDragging, setIsDragging] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchStartRef = useRef<number>(0);
  const lastReportedTimeRef = useRef<number>(0);

  // Use Attention context for server-side reporting
  const { sessionId, reportVideoWatch, reportLike, reportSave } = useAttention();

  // Tap handling
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef(0);

  const handleDoubleTap = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true);
      if (sessionId) {
        reportLike(sessionId, video.id);
      }
    }
    setShowDoubleTapHeart(true);
    setTimeout(() => setShowDoubleTapHeart(false), 600);
  }, [isLiked, sessionId, reportLike, video.id]);

  const handleVideoTap = useCallback(() => {
    tapCountRef.current += 1;
    
    if (tapCountRef.current === 1) {
      tapTimeoutRef.current = setTimeout(() => {
        if (tapCountRef.current === 1) {
          togglePlay();
        }
        tapCountRef.current = 0;
      }, 250);
    } else if (tapCountRef.current === 2) {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      tapCountRef.current = 0;
      handleDoubleTap();
    }
  }, [handleDoubleTap]);

  const { gestureProps } = useGestures({
    onSwipeRight: onSwipeRight,
  });

  const reportWatchProgress = useCallback(() => {
    if (!videoRef.current || !sessionId) return;
    const currentTime = videoRef.current.currentTime * 1000;
    const watchedDuration = currentTime - lastReportedTimeRef.current;
    if (watchedDuration >= 5000) {
      reportVideoWatch(sessionId, video.id, Math.floor(watchedDuration));
      lastReportedTimeRef.current = currentTime;
    }
  }, [sessionId, video.id, reportVideoWatch]);

  const hashtags = video.hashtags || ["fyp", "trending", "viral"];
  const audioName = video.audioName || "Original Sound";
  const artistName = video.artistName || video.username;

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      watchStartRef.current = Date.now();
      lastReportedTimeRef.current = 0;
    } else {
      reportWatchProgress();
      videoRef.current.pause();
      setIsPlaying(false);
    }

    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };
  }, [isActive, video.id, reportWatchProgress]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || isSeeking || isDragging) return;
    const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(currentProgress);
  }, [isSeeking, isDragging]);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * videoRef.current.duration;
    reportWatchProgress();
    videoRef.current.currentTime = newTime;
    setProgress(percent * 100);
    lastReportedTimeRef.current = newTime * 1000;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      reportWatchProgress();
      videoRef.current.pause();
    } else {
      watchStartRef.current = Date.now();
      videoRef.current.play();
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
    lastReportedTimeRef.current = 0;
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
    if (!isLiked && sessionId) {
      reportLike(sessionId, video.id);
    }
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    if (!isSaved && sessionId) {
      reportSave(sessionId, video.id);
    }
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    // Share interaction would be reported here
  };

  return (
    <div className="relative h-full w-full bg-background snap-start" {...gestureProps}>
      <video
        ref={videoRef}
        src={video.url}
        poster={video.poster}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onClick={handleVideoTap}
      />

      <AnimatePresence>
        {showDoubleTapHeart && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <EnergyIcon className="w-24 h-24 text-amber-400" isActive={true} strokeWidth={2} />
          </motion.div>
        )}
      </AnimatePresence>

      {!isFullscreen && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/30 pointer-events-none" />

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

          <div 
            ref={progressRef}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted/20 cursor-pointer z-20"
            onClick={handleProgressBarClick}
          >
            <motion.div className="h-full bg-foreground/60" style={{ width: `${progress}%` }} />
          </div>

          <div className="absolute bottom-12 left-3 right-16 z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-1.5">
                <p className="font-semibold text-sm text-foreground">@{video.username}</p>
                <FollowButton username={video.username} />
              </div>
              <p className="text-xs text-foreground/90 line-clamp-2 mb-1.5">{video.description}</p>
              <div className="flex flex-wrap gap-1 mb-1.5">
                {hashtags.slice(0, 4).map((tag, i) => (
                  <motion.span key={tag} className="text-[10px] text-primary font-medium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
                    #{tag}
                  </motion.span>
                ))}
              </div>
              <AudioRow audioName={audioName} artistName={artistName} />
            </motion.div>
          </div>

          <div className="absolute right-2 bottom-28 flex flex-col items-center gap-4 z-10">
            <div className="flex flex-col items-center gap-0.5">
              <AnimatedEnergyIcon isActive={isLiked} onClick={handleLike} className="drop-shadow-lg" />
              <span className="text-[10px] text-foreground/80 font-medium">{(video.likes + (isLiked ? 1 : 0)).toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <AnimatedDiscussIcon isActive={showComments} onClick={() => setShowComments(true)} className="drop-shadow-lg" />
              <span className="text-[10px] text-foreground/80 font-medium">{video.comments.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <AnimatedBroadcastIcon isActive={false} onClick={handleShare} className="drop-shadow-lg" />
              <span className="text-[10px] text-foreground/80 font-medium">{video.shares.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <AnimatedCollectIcon isActive={isSaved} onClick={handleSave} className="drop-shadow-lg" />
            </div>
            <motion.button className="mt-1" whileTap={{ scale: 0.85 }} onClick={toggleMute}>
              {isMuted ? <VolumeX className="w-5 h-5 text-foreground/70 drop-shadow-lg" /> : <Volume2 className="w-5 h-5 text-foreground drop-shadow-lg" />}
            </motion.button>
            <motion.button className="mt-0.5 px-1.5 py-0.5 rounded-full bg-background/30 backdrop-blur-sm" whileTap={{ scale: 0.9 }} onClick={cycleSpeed}>
              <span className="text-[10px] text-foreground font-medium">{playbackSpeed}x</span>
            </motion.button>
          </div>
        </>
      )}

      <CommentSheet isOpen={showComments} onClose={() => setShowComments(false)} videoId={video.id} />
    </div>
  );
};

export default VideoCard;
