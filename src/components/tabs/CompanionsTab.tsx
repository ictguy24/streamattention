import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import VideoCard from "../stream/VideoCard";

// Same videos but filtered to "followed" users only
const COMPANION_VIDEOS = [
  {
    id: "c1",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400",
    username: "alex_followed",
    description: "Creating something special ✨",
    likes: 1234,
    comments: 89,
    shares: 45,
    hashtags: ["creator", "following"],
    audioName: "Creative Flow",
    artistName: "alex_followed",
  },
  {
    id: "c2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    poster: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400",
    username: "sarah_followed",
    description: "Behind the scenes 🎬",
    likes: 2456,
    comments: 156,
    shares: 78,
    hashtags: ["bts", "creator"],
    audioName: "Studio Vibes",
    artistName: "sarah_followed",
  },
  {
    id: "c3",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    poster: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
    username: "mike_followed",
    description: "New content dropping soon 🔥",
    likes: 3789,
    comments: 234,
    shares: 123,
    hashtags: ["teaser", "soon"],
    audioName: "Drop It",
    artistName: "mike_followed",
  },
];

interface CompanionsTabProps {
  isFullscreen?: boolean;
  onSwipeLeft?: () => void;
}

const CompanionsTab = ({ isFullscreen = false, onSwipeLeft }: CompanionsTabProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setActiveIndex(index);
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.5,
      }
    );

    const items = containerRef.current.querySelectorAll("[data-index]");
    items.forEach((item) => observerRef.current?.observe(item));

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-auto snap-y snap-mandatory no-scrollbar"
    >
      {COMPANION_VIDEOS.map((video, index) => (
        <motion.div
          key={video.id}
          data-index={index}
          className="h-full w-full snap-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <VideoCard
            video={video}
            isActive={index === activeIndex}
            isFullscreen={isFullscreen}
            onSwipeRight={onSwipeLeft}
          />
        </motion.div>
      ))}
      
      {/* Empty state indicator */}
      {COMPANION_VIDEOS.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center px-8">
            <p className="text-muted-foreground text-sm">
              Follow creators to see their content here
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanionsTab;
