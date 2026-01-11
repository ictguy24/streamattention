import { motion } from "framer-motion";
import { Trophy, Star, Zap, Heart, Eye, Video, MessageCircle, Users, Flame, Award, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamificationEngine } from "@/hooks/useGamificationEngine";

const iconMap: Record<string, typeof Trophy> = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  heart: Heart,
  eye: Eye,
  video: Video,
  "message-circle": MessageCircle,
  users: Users,
  flame: Flame,
  award: Award,
};

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
  const { achievements, userAchievements, unlockedCount, totalCount, isLoading } = useGamificationEngine();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Merge achievements with user progress
  const mergedAchievements = achievements.map((achievement) => {
    const userProgress = userAchievements.find(
      (ua) => ua.achievement_id === achievement.id
    );
    return {
      ...achievement,
      progress: userProgress?.progress || 0,
      unlocked: !!userProgress?.unlocked_at,
      unlockedAt: userProgress?.unlocked_at,
    };
  });

  const recentUnlocked = mergedAchievements
    .filter((a) => a.unlocked)
    .sort((a, b) => new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime())
    .slice(0, 1);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-ac-burst" />
          <h3 className="font-semibold text-foreground">Achievements</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {unlockedCount}/{totalCount} Unlocked
        </span>
      </div>

      {/* Empty State */}
      {achievements.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No achievements available</p>
        </div>
      )}

      {/* Achievements Grid */}
      {achievements.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {mergedAchievements.map((achievement, index) => {
            const IconComponent = iconMap[achievement.icon] || Trophy;
            const rarity = achievement.rarity as keyof typeof rarityColors;
            
            return (
              <motion.div
                key={achievement.id}
                className={cn(
                  "relative aspect-square rounded-xl flex flex-col items-center justify-center p-2",
                  achievement.unlocked 
                    ? rarityBgColors[rarity]
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
                      rarityColors[rarity]
                    )}
                    style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor" }}
                  />
                )}

                {/* Icon */}
                <IconComponent 
                  className={cn(
                    "w-6 h-6 mb-1",
                    achievement.unlocked 
                      ? rarity === "legendary" 
                        ? "text-ac-burst" 
                        : rarity === "epic"
                        ? "text-secondary"
                        : rarity === "rare"
                        ? "text-primary"
                        : "text-muted-foreground"
                      : "text-muted-foreground/50"
                  )}
                />

                {/* Progress Ring for Locked */}
                {!achievement.unlocked && achievement.progress !== undefined && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                    <span className="text-[10px] text-muted-foreground">
                      {Math.round((achievement.progress / achievement.requirement_count) * 100)}%
                    </span>
                  </div>
                )}

                {/* Lock Overlay */}
                {!achievement.unlocked && (
                  <div className="absolute inset-0 bg-background/50 rounded-xl" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recent Achievement */}
      {recentUnlocked.map((achievement) => {
        const IconComponent = iconMap[achievement.icon] || Trophy;
        const rarity = achievement.rarity as keyof typeof rarityColors;
        
        return (
          <motion.div
            key={achievement.id}
            className="glass-card rounded-xl p-4 flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-br",
              rarityColors[rarity]
            )}>
              <IconComponent className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{achievement.name}</p>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {achievement.unlockedAt 
                ? new Date(achievement.unlockedAt).toLocaleDateString()
                : "Just now"}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AchievementsSection;
