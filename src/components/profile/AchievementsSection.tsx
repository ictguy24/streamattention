import { motion } from "framer-motion";
import { Trophy, Star, Zap, Heart, Eye, Video, MessageCircle, Users, Flame, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: typeof Trophy;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { 
    id: "1", 
    name: "First Steps", 
    description: "Earn your first AC", 
    icon: Star, 
    unlocked: true, 
    rarity: "common",
    unlockedAt: "2 days ago"
  },
  { 
    id: "2", 
    name: "Content Creator", 
    description: "Post 10 pieces of content", 
    icon: Video, 
    unlocked: true, 
    progress: 10,
    maxProgress: 10,
    rarity: "common",
    unlockedAt: "1 day ago"
  },
  { 
    id: "3", 
    name: "Socialite", 
    description: "Get 100 likes on your posts", 
    icon: Heart, 
    unlocked: true,
    progress: 100,
    maxProgress: 100,
    rarity: "rare",
    unlockedAt: "12 hours ago"
  },
  { 
    id: "4", 
    name: "Trendsetter", 
    description: "Have a post reach 1000 views", 
    icon: Eye, 
    unlocked: false,
    progress: 456,
    maxProgress: 1000,
    rarity: "rare"
  },
  { 
    id: "5", 
    name: "Conversation Starter", 
    description: "Receive 50 comments", 
    icon: MessageCircle, 
    unlocked: false,
    progress: 23,
    maxProgress: 50,
    rarity: "rare"
  },
  { 
    id: "6", 
    name: "Community Builder", 
    description: "Gain 500 followers", 
    icon: Users, 
    unlocked: false,
    progress: 128,
    maxProgress: 500,
    rarity: "epic"
  },
  { 
    id: "7", 
    name: "On Fire", 
    description: "Maintain a 7-day streak", 
    icon: Flame, 
    unlocked: false,
    progress: 3,
    maxProgress: 7,
    rarity: "epic"
  },
  { 
    id: "8", 
    name: "Legend", 
    description: "Earn 10,000 AC total", 
    icon: Award, 
    unlocked: false,
    progress: 1250,
    maxProgress: 10000,
    rarity: "legendary"
  },
];

const rarityColors = {
  common: "from-muted to-muted-foreground",
  rare: "from-primary to-secondary",
  epic: "from-secondary to-accent",
  legendary: "from-ac-burst via-accent to-primary",
};

const rarityBgColors = {
  common: "bg-muted/20",
  rare: "bg-primary/20",
  epic: "bg-secondary/20",
  legendary: "bg-ac-burst/20",
};

const AchievementsSection = () => {
  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-ac-burst" />
          <h3 className="font-semibold text-foreground">Achievements</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {unlockedCount}/{ACHIEVEMENTS.length} Unlocked
        </span>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className={cn(
              "relative aspect-square rounded-xl flex flex-col items-center justify-center p-2",
              achievement.unlocked 
                ? rarityBgColors[achievement.rarity]
                : "bg-muted/30"
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Rarity Border */}
            {achievement.unlocked && (
              <div 
                className={cn(
                  "absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br",
                  rarityColors[achievement.rarity]
                )}
                style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor" }}
              />
            )}

            {/* Icon */}
            <achievement.icon 
              className={cn(
                "w-6 h-6 mb-1",
                achievement.unlocked 
                  ? achievement.rarity === "legendary" 
                    ? "text-ac-burst" 
                    : achievement.rarity === "epic"
                    ? "text-secondary"
                    : achievement.rarity === "rare"
                    ? "text-primary"
                    : "text-muted-foreground"
                  : "text-muted-foreground/50"
              )}
            />

            {/* Progress Ring for Locked */}
            {!achievement.unlocked && achievement.progress !== undefined && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                <span className="text-[10px] text-muted-foreground">
                  {Math.round((achievement.progress / (achievement.maxProgress || 1)) * 100)}%
                </span>
              </div>
            )}

            {/* Lock Overlay */}
            {!achievement.unlocked && (
              <div className="absolute inset-0 bg-background/50 rounded-xl" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Recent Achievement */}
      {ACHIEVEMENTS.filter(a => a.unlocked).slice(-1).map((achievement) => (
        <motion.div
          key={achievement.id}
          className="glass-card rounded-xl p-4 flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br",
            rarityColors[achievement.rarity]
          )}>
            <achievement.icon className="w-6 h-6 text-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">{achievement.name}</p>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
          </div>
          <span className="text-xs text-muted-foreground">{achievement.unlockedAt}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default AchievementsSection;
