import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Plus, Clock, Eye, ChevronLeft, FlipHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import CameraFilters, { getFilterStyle } from "./CameraFilters";

interface Story {
  id: string;
  username: string;
  hasNew: boolean;
  isOwn?: boolean;
  viewCount?: number;
}

const DEMO_STORIES: Story[] = [
  { id: "own", username: "Your Story", hasNew: false, isOwn: true },
  { id: "1", username: "alex_r", hasNew: true, viewCount: 234 },
  { id: "2", username: "sarah_c", hasNew: true, viewCount: 567 },
  { id: "3", username: "mike_j", hasNew: true, viewCount: 123 },
  { id: "4", username: "emma_w", hasNew: false, viewCount: 89 },
  { id: "5", username: "david_k", hasNew: true, viewCount: 345 },
];

interface RecentSnap {
  id: string;
  username: string;
  preview: string;
  timeAgo: string;
  views: number;
  expiresIn: string;
}

const RECENT_SNAPS: RecentSnap[] = [
  { id: "1", username: "adventure_time", preview: "Beach sunset vibes 🌅", timeAgo: "2h ago", views: 1234, expiresIn: "22h" },
  { id: "2", username: "foodie_life", preview: "Breakfast of champions", timeAgo: "4h ago", views: 890, expiresIn: "20h" },
  { id: "3", username: "city_explorer", preview: "NYC streets at night 🌃", timeAgo: "6h ago", views: 2345, expiresIn: "18h" },
];

interface SnapZoneModeProps {
  onACEarned?: (amount: number) => void;
}

const SnapZoneMode = ({ onACEarned }: SnapZoneModeProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Camera Button */}
      <div className="px-4 mb-4">
        <motion.button
          className="w-full py-4 rounded-xl bg-primary flex items-center justify-center gap-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCamera(true)}
        >
          <Camera className="w-6 h-6 text-primary-foreground" />
          <span className="text-primary-foreground font-semibold">Open Camera</span>
        </motion.button>
      </div>

      {/* Stories Row */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="font-semibold text-foreground">Stories</h3>
          <span className="text-sm text-primary">See All</span>
        </div>

        <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar">
          {DEMO_STORIES.map((story, index) => (
            <motion.div
              key={story.id}
              className="flex flex-col items-center gap-1.5 shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={cn(
                  "relative p-[3px] rounded-full",
                  story.hasNew
                    ? "bg-gradient-to-tr from-primary to-accent"
                    : story.isOwn
                    ? "bg-muted"
                    : "bg-border/50"
                )}
              >
                <div className="p-[2px] rounded-full bg-background">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback
                      className={cn(
                        story.isOwn
                          ? "bg-muted text-muted-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {story.isOwn ? (
                        <Plus className="w-6 h-6" />
                      ) : (
                        story.username[0].toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                </div>
                {story.hasNew && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                    <span className="text-[8px] text-primary-foreground font-bold">!</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate w-16 text-center">
                {story.isOwn ? "Add" : story.username}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Snaps */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Recent Snaps</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>24h expiry</span>
          </div>
        </div>

        <div className="space-y-2">
          {RECENT_SNAPS.map((snap, index) => (
            <motion.div
              key={snap.id}
              className="rounded-xl p-3 flex items-center gap-3 bg-muted/20 hover:bg-muted/30 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-14 h-14 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">@{snap.username}</p>
                <p className="text-sm text-muted-foreground truncate">{snap.preview}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">{snap.timeAgo}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    {snap.views}
                  </div>
                </div>
              </div>

              <div className="px-2 py-1 rounded-full bg-accent/10 shrink-0">
                <span className="text-xs text-accent font-medium">{snap.expiresIn}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Camera Modal with Filters */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            className="fixed inset-0 z-50 bg-background flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Camera View */}
            <div className={cn(
              "flex-1 bg-muted/20 flex items-center justify-center relative",
              getFilterStyle(selectedFilter)
            )}>
              <div className="absolute top-4 left-4 z-10">
                <motion.button
                  className="p-2 rounded-full bg-background/50 backdrop-blur-sm"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCamera(false)}
                >
                  <ChevronLeft className="w-6 h-6 text-foreground" />
                </motion.button>
              </div>

              {/* Flip Camera Button */}
              <div className="absolute top-4 right-4 z-10">
                <motion.button
                  className="p-2 rounded-full bg-background/50 backdrop-blur-sm"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFrontCamera(!isFrontCamera)}
                >
                  <FlipHorizontal className="w-6 h-6 text-foreground" />
                </motion.button>
              </div>

              <div className="text-center">
                <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Camera preview</p>
                <p className="text-sm text-muted-foreground">
                  {isFrontCamera ? "Front camera" : "Back camera"}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card/90 backdrop-blur-xl border-t border-border/50">
              <CameraFilters 
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
              />
            </div>

            {/* Capture Controls */}
            <div className="p-6 bg-card/90 backdrop-blur-xl safe-area-bottom">
              <div className="flex items-center justify-center gap-8">
                {/* Gallery */}
                <button className="p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-lg bg-muted" />
                </button>

                {/* Capture Button */}
                <motion.button
                  className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center"
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-16 h-16 rounded-full border-4 border-background" />
                </motion.button>

                {/* Record Toggle */}
                <button className="p-3 rounded-xl bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-destructive/50" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SnapZoneMode;
