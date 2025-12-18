import { useState } from "react";
import { motion } from "framer-motion";
import { Grid3X3, List, Play, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  type: "video" | "image";
  views: number;
  likes: number;
  timestamp: string;
}

const DEMO_MEDIA: MediaItem[] = [
  { id: "1", type: "video", views: 1234, likes: 89, timestamp: "2d ago" },
  { id: "2", type: "image", views: 567, likes: 45, timestamp: "3d ago" },
  { id: "3", type: "video", views: 2345, likes: 156, timestamp: "5d ago" },
  { id: "4", type: "image", views: 890, likes: 67, timestamp: "1w ago" },
  { id: "5", type: "video", views: 3456, likes: 234, timestamp: "1w ago" },
  { id: "6", type: "image", views: 234, likes: 23, timestamp: "2w ago" },
];

const MediaGrid = () => {
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");

  return (
    <motion.div
      className="px-4 py-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Your Content</h3>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30">
          <button
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "grid" ? "bg-background text-foreground" : "text-muted-foreground"
            )}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "timeline" ? "bg-background text-foreground" : "text-muted-foreground"
            )}
            onClick={() => setViewMode("timeline")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-3 gap-1">
          {DEMO_MEDIA.map((item, index) => (
            <motion.div
              key={item.id}
              className="relative aspect-square rounded-lg bg-muted/30 overflow-hidden cursor-pointer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                {item.type === "video" ? (
                  <Play className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              
              {/* Stats Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-background/80 to-transparent">
                <div className="flex items-center gap-2 text-[10px] text-foreground/80">
                  <span>▶ {item.views.toLocaleString()}</span>
                </div>
              </div>

              {/* Video Badge */}
              {item.type === "video" && (
                <div className="absolute top-1.5 right-1.5">
                  <Play className="w-3 h-3 text-foreground fill-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="space-y-3">
          {DEMO_MEDIA.map((item, index) => (
            <motion.div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/40"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                {item.type === "video" ? (
                  <Play className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground capitalize">{item.type}</p>
                <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>▶ {item.views.toLocaleString()}</span>
                  <span>♥ {item.likes}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State if no content */}
      {DEMO_MEDIA.length === 0 && (
        <div className="py-12 text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No content yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start creating to see your posts here</p>
        </div>
      )}
    </motion.div>
  );
};

export default MediaGrid;
