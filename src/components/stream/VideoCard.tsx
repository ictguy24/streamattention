import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAttention } from "@/contexts/AttentionContext";
import { useGestures } from "@/hooks/useGestures";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import CommentSheet from "../social/CommentSheet";
import FollowButton from "./FollowButton";
import AudioRow from "./AudioRow";
import { 
  AnimatedHeartIcon, 
  AnimatedDiscussIcon, 
  AnimatedBroadcastIcon, 
  AnimatedBookmarkIcon,
  AnimatedAmplifyIcon 
} from "../icons/AnimatedIcons";

interface VideoCardProps {
  video: {
    id: string;
    userId: string;
    url: string;
    poster?: string;
    username: string;
    avatarUrl?: string | null;
    description: string;
    likes: number;
    comments: number;
    shares: number;
    hashtags?: string[];
    audioName?: string;
    artistName?: string;
    musicUrl?: string | null;
    musicVolume?: number;
    originalVolume?: number;
    musicTitle?: string | null;
  };
  isActive: boolean;
  isFullscreen?: boolean;
  onSwipeRight?: () => void;
}

const VideoCard = ({ video, isActive, isFullscreen = false, onSwipeRight }: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [isMutualFollow, setIsMutualFollow] = useState(false);
  const [glowColor, setGlowColor] = useState("rgba(185, 100, 50, 0.2)"); // Default cyan glow
  const watchStartRef = useRef<number>(0);
  const lastReportedTimeRef = useRef<number>(0);

  const { user } = useAuth();
  const { sessionId, reportVideoWatch, reportLike, reportSave } = useAttention();

  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tapCountRef = useRef(0);

  // Check mutual follow
  useEffect(() => {
    if (!user?.id || !video.userId || user.id === video.userId) return;
    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", video.userId)
      .eq("following_id", user.id)
      .maybeSingle()
      .then(({ data }) => setIsMutualFollow(!!data));
  }, [user?.id, video.userId]);

  const handleDoubleTap = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true);
      if (sessionId) reportLike(sessionId, video.id);
    }
    setShowDoubleTapHeart(true);
    setTimeout(() => setShowDoubleTapHeart(false), 600);
  }, [isLiked, sessionId, reportLike, video.id]);

  const handleVideoTap = useCallback(() => {
    tapCountRef.current += 1;
    if (tapCountRef.current === 1) {
      tapTimeoutRef.current = setTimeout(() => {
        if (tapCountRef.current === 1) togglePlay();
        tapCountRef.current = 0;
      }, 250);
    } else if (tapCountRef.current === 2) {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      tapCountRef.current = 0;
      handleDoubleTap();
    }
  }, [handleDoubleTap]);

  const { gestureProps } = useGestures({ onSwipeRight });

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
  const audioName = video.audioName || video.musicTitle || "Original Sound";
  const artistName = video.artistName || video.username;

  useEffect(() => {
    if (!musicRef.current || !video.musicUrl) return;
    if (isActive && isPlaying) {
      musicRef.current.volume = video.musicVolume || 0.5;
      musicRef.current.currentTime = videoRef.current?.currentTime || 0;
      musicRef.current.play().catch(() => {});
    } else {
      musicRef.current.pause();
    }
  }, [isActive, isPlaying, video.musicUrl, video.musicVolume]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = video.originalVolume || 1;
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
  }, [isActive, video.id, reportWatchProgress, video.originalVolume]);

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

  const handleLike = () => {
    if (!isLiked && sessionId) reportLike(sessionId, video.id);
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    if (!isSaved && sessionId) reportSave(sessionId, video.id);
    setIsSaved(!isSaved);
  };

  const handleShare = () => {};

  const handleRepost = () => {
    setIsReposted(!isReposted);
  };

  return (
    <div className="relative h-full w-full bg-background snap-start overflow-hidden" {...gestureProps}>
      {/* Dynamic Ambient Glow */}
      <motion.div
        className="absolute inset-0 opacity-40 blur-[100px] pointer-events-none"
        animate={{
          background: isActive
            ? `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 70%)`
            : "none"
        }}
        transition={{ duration: 1 }}
      />

      <video
        ref={videoRef}
        src={video.url}
        poster={video.poster}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onClick={handleVideoTap}
      />

      {/* Double-tap heart overlay */}
      <AnimatePresence>
        {showDoubleTapHeart && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <svg viewBox="0 0 24 24" className="w-24 h-24" fill="#ef4444" stroke="#ef4444" strokeWidth={1}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {!isFullscreen && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/30 pointer-events-none" />

          <AnimatePresence>
            {!isPlaying && (
              <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="p-3 rounded-full bg-background/20 backdrop-blur-sm" initial={{ scale: 0.8 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }}>
                  <Play className="w-8 h-8 text-foreground" fill="currentColor" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar */}
          <div ref={progressRef} className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted/20 cursor-pointer z-20" onClick={handleProgressBarClick}>
            <motion.div className="h-full bg-foreground/60" style={{ width: `${progress}%` }} />
          </div>

          {/* Bottom-left: user info */}
          <div className="absolute bottom-12 left-3 right-16 z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-1">
                {video.avatarUrl && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-foreground/20">
                    <img src={video.avatarUrl} alt={video.username} className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm text-foreground">{video.username}</p>
                  {isMutualFollow && (
                    <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Buddy</span>
                  )}
                </div>
              </div>
              {/* Follow button below username */}
              <div className="mb-1.5">
                <FollowButton userId={video.userId} size="sm" />
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

          {/* Right-side actions: Glassmorphism background for icons */}
          <div className="absolute right-2 bottom-28 flex flex-col items-center gap-4 z-10 p-2 rounded-2xl bg-black/20 backdrop-blur-md border border-white/5">
            <div className="flex flex-col items-center gap-0.5">
              <AnimatedHeartIcon isActive={isLiked} onClick={handleLike} className="drop-shadow-lg" />
              <span className="text-[10px] text-foreground/80 font-medium">{(video.likes + (isLiked ? 1 : 0)).toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <AnimatedDiscussIcon isActive={showComments} onClick={() => setShowComments(true)} className="drop-shadow-lg" />
              <span className="text-[10px] text-foreground/80 font-medium">{video.comments.toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <AnimatedBroadcastIcon isActive={false} onClick={handleShare} className="drop-shadow-lg" />
              <span className="text-[10px] text-foreground/80 font-medium">Share</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <AnimatedAmplifyIcon isActive={isReposted} onClick={handleRepost} className="drop-shadow-lg" />
              <span className="text-[10px] text-foreground/80 font-medium">Repost</span>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <AnimatedBookmarkIcon isActive={isSaved} onClick={handleSave} className="drop-shadow-lg" />
            </div>
          </div>
        </>
      )}

      {video.musicUrl && <audio ref={musicRef} src={video.musicUrl} loop preload="auto" />}
      <CommentSheet isOpen={showComments} onClose={() => setShowComments(false)} videoId={video.id} />
    </div>
  );
};

export default VideoCard;
