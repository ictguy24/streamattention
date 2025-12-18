import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, Bookmark, MessageCircle, Clock, ChevronDown, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  title: string;
  thumbnail?: string;
  progress?: number;
  timeAgo: string;
}

const DEMO_HISTORY: Record<string, HistoryItem[]> = {
  watched: [
    { id: "1", title: "Amazing sunset timelapse", progress: 75, timeAgo: "2h ago" },
    { id: "2", title: "Cooking tutorial - Pasta", progress: 100, timeAgo: "5h ago" },
    { id: "3", title: "Travel vlog - Tokyo", progress: 45, timeAgo: "1d ago" },
  ],
  liked: [
    { id: "4", title: "Incredible dance moves", timeAgo: "1h ago" },
    { id: "5", title: "Funny cat compilation", timeAgo: "3h ago" },
  ],
  saved: [
    { id: "6", title: "DIY home decor ideas", timeAgo: "2d ago" },
    { id: "7", title: "Workout routine", timeAgo: "3d ago" },
  ],
  commented: [
    { id: "8", title: "Hot take on tech", timeAgo: "1h ago" },
  ],
};

const WatchHistoryHub = () => {
  const [expandedFolder, setExpandedFolder] = useState<string | null>("resume");

  const folders = [
    { id: "resume", icon: Clock, label: "Resume Watching", color: "text-yellow-400", items: DEMO_HISTORY.watched.filter(i => i.progress && i.progress < 100) },
    { id: "watched", icon: Play, label: "Watched", color: "text-blue-400", items: DEMO_HISTORY.watched },
    { id: "liked", icon: Heart, label: "Liked", color: "text-destructive", items: DEMO_HISTORY.liked },
    { id: "saved", icon: Bookmark, label: "Saved", color: "text-primary", items: DEMO_HISTORY.saved },
    { id: "commented", icon: MessageCircle, label: "Commented", color: "text-green-400", items: DEMO_HISTORY.commented },
  ];

  return (
    <motion.div
      className="px-4 py-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <h3 className="text-sm font-semibold text-foreground mb-3">Watch History</h3>

      <div className="space-y-2">
        {folders.map((folder, index) => (
          <motion.div
            key={folder.id}
            className="rounded-xl border border-border/50 bg-card/40 overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.05 }}
          >
            {/* Folder Header */}
            <motion.button
              className="w-full flex items-center gap-3 p-3"
              onClick={() => setExpandedFolder(expandedFolder === folder.id ? null : folder.id)}
              whileTap={{ scale: 0.98 }}
            >
              <div className={cn("p-2 rounded-lg bg-muted/50")}>
                <folder.icon className={cn("w-4 h-4", folder.color)} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{folder.label}</p>
                <p className="text-xs text-muted-foreground">{folder.items.length} items</p>
              </div>
              <motion.div
                animate={{ rotate: expandedFolder === folder.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </motion.button>

            {/* Folder Content */}
            <AnimatePresence>
              {expandedFolder === folder.id && folder.items.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border/30"
                >
                  {folder.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: itemIndex * 0.05 }}
                    >
                      {/* Thumbnail Placeholder */}
                      <div className="w-16 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                        <Play className="w-4 h-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.timeAgo}</p>
                        {item.progress !== undefined && item.progress < 100 && (
                          <div className="mt-1 h-1 rounded-full bg-muted/50 overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${item.progress}%` }} 
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WatchHistoryHub;
