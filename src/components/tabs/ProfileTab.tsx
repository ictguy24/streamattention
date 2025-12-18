import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Share2, Edit3, ChevronDown } from "lucide-react";
import AnimatedAvatar from "../profile/AnimatedAvatar";
import ACStats from "../profile/ACStats";
import AchievementsSection from "../profile/AchievementsSection";
import VisitorInsights from "../profile/VisitorInsights";
import CustomizableWidgets from "../profile/CustomizableWidgets";
import { cn } from "@/lib/utils";

interface ProfileTabProps {
  acBalance: number;
}

type ProfileSection = "stats" | "achievements" | "insights" | "widgets";

const ProfileTab = ({ acBalance }: ProfileTabProps) => {
  const [activeSection, setActiveSection] = useState<ProfileSection>("stats");
  const [isLive, setIsLive] = useState(false);

  const sections: { id: ProfileSection; label: string }[] = [
    { id: "stats", label: "Stats" },
    { id: "achievements", label: "Trophies" },
    { id: "insights", label: "Insights" },
    { id: "widgets", label: "Customize" },
  ];

  return (
    <motion.div
      className="flex flex-col pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Profile Header */}
      <div className="relative px-6 pt-4 pb-6">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-secondary/5 to-transparent pointer-events-none" />

        {/* Actions */}
        <div className="relative flex items-center justify-between mb-6">
          <motion.button
            className="p-2 rounded-full glass-card"
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          <motion.button
            className="p-2 rounded-full glass-card"
            whileTap={{ scale: 0.9 }}
          >
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Avatar & Info */}
        <div className="relative flex flex-col items-center">
          <AnimatedAvatar
            size="xl"
            isOnline={true}
            isLive={isLive}
          />

          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Guest User</h2>
              <motion.button
                className="p-1 rounded-full hover:bg-muted"
                whileTap={{ scale: 0.9 }}
              >
                <Edit3 className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">@guest_user</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Create an account to save your progress and customize your profile ✨
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
          </div>

          {/* Go Live Button (Demo) */}
          <motion.button
            className={cn(
              "mt-4 px-6 py-2 rounded-full font-medium text-sm transition-colors",
              isLive 
                ? "bg-destructive text-destructive-foreground" 
                : "bg-primary/10 text-primary border border-primary/30"
            )}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? "End Live" : "Go Live"}
          </motion.button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="px-4 mb-4">
        <div className="flex items-center p-1 rounded-xl bg-muted/30">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              className={cn(
                "flex-1 py-2 rounded-lg text-sm font-medium transition-colors relative",
                activeSection === section.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
              onClick={() => setActiveSection(section.id)}
              whileTap={{ scale: 0.95 }}
            >
              {activeSection === section.id && (
                <motion.div
                  layoutId="profileSectionIndicator"
                  className="absolute inset-0 bg-background rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{section.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeSection === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ACStats
                balance={acBalance}
                todayEarned={Math.floor(acBalance * 0.3)}
                weeklyEarned={Math.floor(acBalance * 0.8)}
                streak={3}
                totalEarned={acBalance}
                rank={1234}
              />
            </motion.div>
          )}

          {activeSection === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AchievementsSection />
            </motion.div>
          )}

          {activeSection === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <VisitorInsights />
            </motion.div>
          )}

          {activeSection === "widgets" && (
            <motion.div
              key="widgets"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CustomizableWidgets />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProfileTab;
