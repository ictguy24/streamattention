import { useState } from "react";
import { Play, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { EnergyIcon, DiscussIcon, BroadcastIcon, CollectIcon } from "./InteractionIcons";

interface FuzzItem {
  id: string;
  username: string;
  type: "photo" | "video";
  views: number;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  duration?: string;
}

const DEMO_FUZZ: FuzzItem[] = [
  { id: "1", username: "travel_moments", type: "video", views: 12400, likes: 890, isLiked: false, isSaved: false, duration: "0:15" },
  { id: "2", username: "art_daily", type: "photo", views: 8900, likes: 567, isLiked: true, isSaved: false },
  { id: "3", username: "nature_vibes", type: "video", views: 23500, likes: 1234, isLiked: false, isSaved: true, duration: "0:30" },
  { id: "4", username: "urban_explorer", type: "photo", views: 5600, likes: 345, isLiked: false, isSaved: false },
  { id: "5", username: "food_stories", type: "video", views: 15800, likes: 789, isLiked: false, isSaved: false, duration: "0:22" },
  { id: "6", username: "fashion_edit", type: "photo", views: 9200, likes: 456, isLiked: true, isSaved: true },
  { id: "7", username: "music_clips", type: "video", views: 34000, likes: 2100, isLiked: false, isSaved: false, duration: "0:45" },
  { id: "8", username: "tech_unbox", type: "photo", views: 7800, likes: 389, isLiked: false, isSaved: false },
];

interface FuzzModeProps {
  onACEarned?: (amount: number) => void;
}

const FuzzMode = ({ onACEarned }: FuzzModeProps) => {
  const [items, setItems] = useState(DEMO_FUZZ);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [holdingId, setHoldingId] = useState<string | null>(null);

  const toggleLike = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item && !item.isLiked) {
      onACEarned?.(1);
    }
    setItems(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, isLiked: !i.isLiked, likes: i.isLiked ? i.likes - 1 : i.likes + 1 }
          : i
      )
    );
  };

  const toggleSave = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item && !item.isSaved) {
      onACEarned?.(1);
    }
    setItems(prev =>
      prev.map(i =>
        i.id === id ? { ...i, isSaved: !i.isSaved } : i
      )
    );
  };

  // Gesture handlers
  const handleTap = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleHoldStart = (id: string) => {
    setHoldingId(id);
  };

  const handleHoldEnd = () => {
    setHoldingId(null);
  };

  return (
    <div className="flex flex-col px-2">
      {/* Living Grid - Cinematic moments */}
      <div className="grid grid-cols-3 gap-0.5">
        {items.map((item, index) => {
          const isExpanded = expandedId === item.id;
          const isHolding = holdingId === item.id;
          
          return (
            <motion.div
              key={item.id}
              className={cn(
                "relative overflow-hidden cursor-pointer",
                isExpanded ? "col-span-3 row-span-2" : "",
                // Varying heights for living grid feel
                index % 5 === 0 ? "aspect-[3/4]" : 
                index % 3 === 0 ? "aspect-square" : "aspect-[4/5]"
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                scale: isHolding ? 0.98 : 1,
              }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => handleTap(item.id)}
              onMouseDown={() => handleHoldStart(item.id)}
              onMouseUp={handleHoldEnd}
              onMouseLeave={handleHoldEnd}
              onTouchStart={() => handleHoldStart(item.id)}
              onTouchEnd={handleHoldEnd}
            >
              {/* Motion thumbnail background */}
              <div className="absolute inset-0 bg-muted/20">
                {/* Gradient overlay for cinematic feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>

              {/* Video indicator */}
              {item.type === "video" && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/40 backdrop-blur-sm">
                  <Play className="w-2.5 h-2.5 text-foreground" fill="currentColor" />
                  <span className="text-[9px] text-foreground font-medium">{item.duration}</span>
                </div>
              )}

              {/* Bottom info - soft reveal on hover/tap */}
              <motion.div 
                className="absolute bottom-0 left-0 right-0 p-2"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: isExpanded || isHolding ? 1 : 0.6 }}
              >
                <p className="text-[10px] text-foreground font-medium truncate">@{item.username}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5 text-foreground/70" />
                    <span className="text-[9px] text-foreground/70">{(item.views / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              </motion.div>

              {/* Expanded overlay with actions */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center gap-6">
                      <button
                        className={cn(
                          "flex flex-col items-center gap-1 active:scale-95 transition-all",
                          item.isLiked ? "text-amber-500" : "text-foreground"
                        )}
                        onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }}
                      >
                        <EnergyIcon className="w-6 h-6" isActive={item.isLiked} />
                        <span className="text-xs">{item.likes.toLocaleString()}</span>
                      </button>

                      <button
                        className="flex flex-col items-center gap-1 text-foreground active:scale-95 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DiscussIcon className="w-6 h-6" />
                        <span className="text-xs">Comment</span>
                      </button>

                      <button
                        className="flex flex-col items-center gap-1 text-foreground active:scale-95 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BroadcastIcon className="w-6 h-6" />
                        <span className="text-xs">Share</span>
                      </button>

                      <button
                        className={cn(
                          "flex flex-col items-center gap-1 active:scale-95 transition-all",
                          item.isSaved ? "text-primary" : "text-foreground"
                        )}
                        onClick={(e) => { e.stopPropagation(); toggleSave(item.id); }}
                      >
                        <CollectIcon className="w-6 h-6" isActive={item.isSaved} />
                        <span className="text-xs">Save</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Gesture hints */}
      <p className="text-[10px] text-muted-foreground text-center mt-4 px-4">
        Tap to reveal • Hold to pause • Swipe to navigate
      </p>
    </div>
  );
};

export default FuzzMode;
