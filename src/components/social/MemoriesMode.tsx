import { useState } from "react";
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

interface Memory {
  id: string;
  username: string;
  preview: string;
  timeAgo: string;
  views: number;
  expiresIn: string;
}

const MEMORIES: Memory[] = [
  { id: "1", username: "adventure_time", preview: "Beach sunset vibes", timeAgo: "2h ago", views: 1234, expiresIn: "22h" },
  { id: "2", username: "foodie_life", preview: "Breakfast of champions", timeAgo: "4h ago", views: 890, expiresIn: "20h" },
  { id: "3", username: "city_explorer", preview: "NYC streets at night", timeAgo: "6h ago", views: 2345, expiresIn: "18h" },
];

interface MemoriesModeProps {
  onACEarned?: (amount: number) => void;
}

const MemoriesMode = ({ onACEarned }: MemoriesModeProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  return (
    <div className="flex flex-col">
      {/* Camera Button - Flat, grounded */}
      <div className="px-4 mb-4">
        <button
          className="w-full py-4 rounded-lg bg-foreground/10 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          onClick={() => setShowCamera(true)}
        >
          <Camera className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          <span className="text-foreground font-medium">Open Camera</span>
        </button>
      </div>

      {/* Stories Row - Simple borders, no gradients */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="font-medium text-foreground text-sm">Stories</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            See All
          </button>
        </div>

        <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar">
          {DEMO_STORIES.map((story) => (
            <div
              key={story.id}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div
                className={cn(
                  "relative p-[2px] rounded-full",
                  story.hasNew
                    ? "bg-foreground/30"
                    : "bg-border/30"
                )}
              >
                <div className="p-[2px] rounded-full bg-background">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback
                      className={cn(
                        "bg-muted/30 text-foreground",
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
                {story.hasNew && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-foreground/50 border-2 border-background" />
                )}
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
          <h3 className="font-medium text-foreground text-sm">Recent Memories</h3>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" strokeWidth={1.5} />
            <span>24h expiry</span>
          </div>
        </div>

        <div className="space-y-2">
          {MEMORIES.map((memory) => (
            <button
              key={memory.id}
              className="w-full rounded-lg p-3 flex items-center gap-3 bg-muted/10 hover:bg-muted/15 active:scale-[0.99] transition-all text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-muted/20 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">@{memory.username}</p>
                <p className="text-xs text-muted-foreground truncate">{memory.preview}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-muted-foreground">{memory.timeAgo}</span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Eye className="w-3 h-3" strokeWidth={1.5} />
                    {memory.views}
                  </div>
                </div>
              </div>

              <div className="px-2 py-1 rounded bg-muted/20 shrink-0">
                <span className="text-[10px] text-muted-foreground font-medium">{memory.expiresIn}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Upload info */}
        <p className="text-[10px] text-muted-foreground text-center mt-4">
          Status uploads up to 1GB
        </p>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
          {/* Camera View */}
          <div className={cn(
            "flex-1 bg-muted/10 flex items-center justify-center relative",
            getFilterStyle(selectedFilter)
          )}>
            <div className="absolute top-4 left-4 z-10">
              <button
                className="p-2 rounded-lg bg-background/30 backdrop-blur-sm active:scale-95 transition-transform"
                onClick={() => setShowCamera(false)}
              >
                <ChevronLeft className="w-6 h-6 text-foreground" strokeWidth={1.5} />
              </button>
            </div>

            {/* Flip Camera Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                className="p-2 rounded-lg bg-background/30 backdrop-blur-sm active:scale-95 transition-transform"
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
          <div className="bg-card border-t border-border/20">
            <CameraFilters 
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </div>

          {/* Capture Controls */}
          <div className="p-6 bg-card safe-area-bottom">
            <div className="flex items-center justify-center gap-8">
              {/* Gallery */}
              <button className="p-3 rounded-lg bg-muted/20 active:scale-95 transition-transform">
                <div className="w-7 h-7 rounded bg-muted/30" />
              </button>

              {/* Capture Button */}
              <button
                className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full border-2 border-foreground/50" />
              </button>

              {/* Record Toggle */}
              <button className="p-3 rounded-lg bg-muted/20 active:scale-95 transition-transform">
                <div className="w-7 h-7 rounded-full bg-destructive/30" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoriesMode;
