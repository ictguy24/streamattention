import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import VideoCard from "./VideoCard";

// Demo videos using free sample videos
const DEMO_VIDEOS = [
  {
    id: "1",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "",
    username: "creator_one",
    description: "Amazing content! Watch till the end 🔥 #attention #viral",
    likes: 12400,
    comments: 342,
    shares: 89,
  },
  {
    id: "2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: "",
    username: "viral_clips",
    description: "This is incredible! Earn AC by watching 👀✨",
    likes: 8900,
    comments: 156,
    shares: 234,
  },
  {
    id: "3",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    poster: "",
    username: "daily_vibes",
    description: "Can't stop watching this! 🎬 #fyp #trending",
    likes: 45200,
    comments: 892,
    shares: 1200,
  },
  {
    id: "4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    poster: "",
    username: "content_king",
    description: "POV: You just discovered the best app 📱💎",
    likes: 23100,
    comments: 456,
    shares: 678,
  },
  {
    id: "5",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    poster: "",
    username: "explore_more",
    description: "Worth every second of your attention! 🌟",
    likes: 67800,
    comments: 1234,
    shares: 2100,
  },
];

interface VideoFeedProps {
  isFullscreen?: boolean;
  onSwipeRight?: () => void;
}

const VideoFeed = ({ isFullscreen = false, onSwipeRight }: VideoFeedProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(index);
          }
        });
      },
      {
        root: container,
        threshold: 0.7,
      }
    );

    const videoElements = container.querySelectorAll("[data-index]");
    videoElements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-6rem)] overflow-y-scroll snap-y snap-mandatory no-scrollbar"
    >
      {DEMO_VIDEOS.map((video, index) => (
        <motion.div
          key={video.id}
          data-index={index}
          className="h-[calc(100vh-6rem)] w-full snap-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <VideoCard
            video={video}
            isActive={index === activeIndex}
            isFullscreen={isFullscreen}
            onSwipeRight={onSwipeRight}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default VideoFeed;
