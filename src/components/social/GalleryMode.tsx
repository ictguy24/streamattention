import { useState } from "react";
import { Camera, Plus, Clock, Eye, ChevronLeft, FlipHorizontal, Lock, Flame } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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

interface Memory {
  id: string;
  username: string;
  preview: string;
  timeAgo: string;
  views: number;
  expiresIn: string;
  isOneTime?: boolean;
  streakDays?: number;
}

const MEMORIES: Memory[] = [
  { id: "1", username: "adventure_time", preview: "Beach sunset vibes", timeAgo: "2h ago", views: 1234, expiresIn: "22h", isOneTime: true },
  { id: "2", username: "foodie_life", preview: "Breakfast of champions", timeAgo: "4h ago", views: 890, expiresIn: "20h" },
  { id: "3", username: "city_explorer", preview: "NYC streets at night", timeAgo: "6h ago", views: 2345, expiresIn: "18h", streakDays: 7 },
];

interface VaultItem {
  id: string;
  type: "photo" | "video";
  savedAt: string;
}

const VAULT_ITEMS: VaultItem[] = [
  { id: "v1", type: "photo", savedAt: "2 days ago" },
  { id: "v2", type: "video", savedAt: "1 week ago" },
  { id: "v3", type: "photo", savedAt: "2 weeks ago" },
];

interface GalleryModeProps {
  onACEarned?: (amount: number) => void;
}

const GalleryMode = ({ onACEarned }: GalleryModeProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [activeSection, setActiveSection] = useState<"stories" | "vault">("stories");

  return (
    <div className="flex flex-col">
      {/* Camera Button - Edge-to-edge feel */}
      <div className="px-4 mb-4">
        <button
          className="w-full py-4 rounded-lg bg-foreground/5 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          onClick={() => setShowCamera(true)}
        >
          <Camera className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          <span className="text-foreground font-medium">Capture Moment</span>
        </button>
      </div>

      {/* Section Switcher */}
      <div className="flex items-center gap-2 px-4 mb-4">
        <button
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
            activeSection === "stories" 
              ? "bg-foreground/10 text-foreground" 
              : "text-muted-foreground"
          )}
          onClick={() => setActiveSection("stories")}
        >
          Stories
        </button>
        <button
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5",
            activeSection === "vault" 
              ? "bg-foreground/10 text-foreground" 
              : "text-muted-foreground"
          )}
          onClick={() => setActiveSection("vault")}
        >
          <Lock className="w-3.5 h-3.5" />
          Memory Vault
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSection === "stories" ? (
          <motion.div
            key="stories"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Stories Row - Gesture-driven */}
            <div className="mb-6">
              <div className="flex items-center justify-between px-4 mb-3">
                <h3 className="font-medium text-foreground text-sm">Stories</h3>
                <button className="text-xs text-muted-foreground">See All</button>
              </div>

              <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar">
                {DEMO_STORIES.map((story) => (
                  <div
                    key={story.id}
                    className="flex flex-col items-center gap-1.5 shrink-0 active:scale-95 transition-transform cursor-pointer"
                  >
                    <div
                      className={cn(
                        "relative p-[2px] rounded-full",
                        story.hasNew ? "bg-foreground/30" : "bg-border/20"
                      )}
                    >
                      <div className="p-[2px] rounded-full bg-background">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback
                            className={cn(
                              "bg-muted/20 text-foreground",
                              story.isOwn && "text-muted-foreground"
                            )}
                          >
                            {story.isOwn ? (
                              <Plus className="w-5 h-5" strokeWidth={1.5} />
                            ) : (
                              story.username[0].toUpperCase()
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate w-14 text-center">
                      {story.isOwn ? "Add" : story.username}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Memories Timeline */}
            <div className="px-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-foreground text-sm">Recent</h3>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  <span>24h expiry</span>
                </div>
              </div>

              <div className="space-y-2">
                {MEMORIES.map((memory) => (
                  <button
                    key={memory.id}
                    className="w-full rounded-lg p-3 flex items-center gap-3 bg-muted/5 active:scale-[0.99] transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-lg bg-muted/10 flex items-center justify-center shrink-0 relative">
                      <Camera className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                      {memory.isOneTime && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center">
                          <span className="text-[8px] text-destructive">1x</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm">@{memory.username}</p>
                        {memory.streakDays && (
                          <div className="flex items-center gap-0.5 text-orange-500">
                            <Flame className="w-3 h-3" />
                            <span className="text-[10px] font-medium">{memory.streakDays}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{memory.preview}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground">{memory.timeAgo}</span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Eye className="w-3 h-3" strokeWidth={1.5} />
                          {memory.views}
                        </div>
                      </div>
                    </div>

                    <div className="px-2 py-1 rounded bg-muted/10 shrink-0">
                      <span className="text-[10px] text-muted-foreground font-medium">{memory.expiresIn}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="vault"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="px-4"
          >
            {/* Memory Vault - Private saved content */}
            <div className="text-center py-8">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">Memory Vault</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Your saved moments, private and secure
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {VAULT_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="aspect-square rounded-lg bg-muted/10 flex items-center justify-center relative"
                >
                  <div className="w-6 h-6 rounded-full bg-muted/20 flex items-center justify-center">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="absolute bottom-1 left-1 text-[8px] text-muted-foreground">
                    {item.savedAt}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <p className="text-[10px] text-muted-foreground text-center mt-6 px-4">
        One-time views • AR filters • Private streaks
      </p>

      {/* Camera Modal - Edge-to-edge, gesture-driven */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
          {/* Camera View */}
          <div className={cn(
            "flex-1 bg-muted/5 flex items-center justify-center relative",
            getFilterStyle(selectedFilter)
          )}>
            <div className="absolute top-4 left-4 z-10">
              <button
                className="p-2 rounded-lg bg-background/20 backdrop-blur-sm active:scale-95 transition-transform"
                onClick={() => setShowCamera(false)}
              >
                <ChevronLeft className="w-6 h-6 text-foreground" strokeWidth={1.5} />
              </button>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <button
                className="p-2 rounded-lg bg-background/20 backdrop-blur-sm active:scale-95 transition-transform"
                onClick={() => setIsFrontCamera(!isFrontCamera)}
              >
                <FlipHorizontal className="w-6 h-6 text-foreground" strokeWidth={1.5} />
              </button>
            </div>

            <div className="text-center">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-muted-foreground text-sm">Camera preview</p>
              <p className="text-xs text-muted-foreground mt-1">
                {isFrontCamera ? "Front camera" : "Back camera"}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card border-t border-border/10">
            <CameraFilters 
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </div>

          {/* Capture Controls - Zero clutter */}
          <div className="p-6 bg-card safe-area-bottom">
            <div className="flex items-center justify-center gap-8">
              <button className="p-3 rounded-lg bg-muted/10 active:scale-95 transition-transform">
                <div className="w-7 h-7 rounded bg-muted/20" />
              </button>

              <button
                className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full border-2 border-foreground/30" />
              </button>

              <button className="p-3 rounded-lg bg-muted/10 active:scale-95 transition-transform">
                <div className="w-7 h-7 rounded-full bg-destructive/20" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryMode;
