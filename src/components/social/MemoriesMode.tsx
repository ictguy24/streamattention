import { useState } from "react";
import { Camera, Plus, Clock, Eye, ChevronLeft, FlipHorizontal, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import CameraFilters, { getFilterStyle } from "./CameraFilters";
import { useStories } from "@/hooks/useStories";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface MemoriesModeProps {
  onACEarned?: (amount: number) => void;
}

const MemoriesMode = ({ onACEarned }: MemoriesModeProps) => {
  const { user } = useAuth();
  const { storyGroups, isLoading, viewStory } = useStories();
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false }) + " ago";
    } catch {
      return "recently";
    }
  };

  const formatExpiry = (date: string) => {
    try {
      const expires = new Date(date);
      const now = new Date();
      const hoursLeft = Math.max(0, Math.round((expires.getTime() - now.getTime()) / (1000 * 60 * 60)));
      return `${hoursLeft}h`;
    } catch {
      return "24h";
    }
  };

  return (
    <div className="flex flex-col">
      {/* Camera Button */}
      <div className="px-4 mb-4">
        <button
          className="w-full py-4 rounded-lg bg-foreground/10 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          onClick={() => setShowCamera(true)}
        >
          <Camera className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          <span className="text-foreground font-medium">Open Camera</span>
        </button>
      </div>

      {/* Stories Row */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="font-medium text-foreground text-sm">Stories</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            See All
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : storyGroups.length === 0 ? (
          <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar">
            {/* Your Story - always show */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="relative p-[2px] rounded-full bg-border/30">
                <div className="p-[2px] rounded-full bg-background">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-muted/30 text-muted-foreground">
                      <Plus className="w-5 h-5" strokeWidth={1.5} />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-14 text-center">
                Add
              </span>
            </div>
            <div className="flex items-center px-4">
              <p className="text-xs text-muted-foreground">No stories yet</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar">
            {/* Your Story */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="relative p-[2px] rounded-full bg-border/30">
                <div className="p-[2px] rounded-full bg-background">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-muted/30 text-muted-foreground">
                      <Plus className="w-5 h-5" strokeWidth={1.5} />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-14 text-center">
                Add
              </span>
            </div>

            {storyGroups
              .filter(g => g.user_id !== user?.id)
              .map((group) => (
                <div
                  key={group.user_id}
                  className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer"
                  onClick={() => {
                    group.stories.forEach(s => viewStory(s.id));
                  }}
                >
                  <div
                    className={cn(
                      "relative p-[2px] rounded-full",
                      group.hasNew ? "bg-foreground/30" : "bg-border/30"
                    )}
                  >
                    <div className="p-[2px] rounded-full bg-background">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={group.avatar_url} />
                        <AvatarFallback className="bg-muted/30 text-foreground">
                          {group.username[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {group.hasNew && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-foreground/50 border-2 border-background" />
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-14 text-center">
                    {group.username}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Recent Memories */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-foreground text-sm">Recent Memories</h3>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" strokeWidth={1.5} />
            <span>24h expiry</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : storyGroups.length === 0 ? (
          <div className="text-center py-8">
            <Camera className="w-10 h-10 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">No memories yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Share your first story!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {storyGroups.flatMap(g => g.stories).slice(0, 10).map((story) => (
              <button
                key={story.id}
                className="w-full rounded-lg p-3 flex items-center gap-3 bg-muted/10 hover:bg-muted/15 active:scale-[0.99] transition-all text-left"
                onClick={() => viewStory(story.id)}
              >
                <div className="w-12 h-12 rounded-lg bg-muted/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {story.media_url ? (
                    <img src={story.media_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">@{story.username || 'user'}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground">{formatTimeAgo(story.created_at)}</span>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Eye className="w-3 h-3" strokeWidth={1.5} />
                      {story.view_count}
                    </div>
                  </div>
                </div>

                <div className="px-2 py-1 rounded bg-muted/20 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {formatExpiry(story.expires_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center mt-4">
          Status uploads up to 1GB
        </p>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
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

          <div className="bg-card border-t border-border/20">
            <CameraFilters 
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </div>

          <div className="p-6 bg-card safe-area-bottom">
            <div className="flex items-center justify-center gap-8">
              <button className="p-3 rounded-lg bg-muted/20 active:scale-95 transition-transform">
                <div className="w-7 h-7 rounded bg-muted/30" />
              </button>

              <button
                className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full border-2 border-foreground/50" />
              </button>

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
