import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Share2, Edit3, LogIn, UserPlus } from "lucide-react";
import AnimatedAvatar from "../profile/AnimatedAvatar";
import WalletPanel from "../profile/WalletPanel";
import ActivitySnapshot from "../profile/ActivitySnapshot";
import WatchHistoryHub from "../profile/WatchHistoryHub";
import PerformanceDashboard from "../profile/PerformanceDashboard";
import MediaGrid from "../profile/MediaGrid";
import ThemeSettings from "../profile/ThemeSettings";
import InterestSurvey from "../auth/InterestSurvey";
import { cn } from "@/lib/utils";

interface ProfileTabProps {
  acBalance: number;
  isGuest?: boolean;
}

type ProfileSection = "overview" | "history" | "analytics" | "content" | "settings";

const ProfileTab = ({ acBalance, isGuest = true }: ProfileTabProps) => {
  const [activeSection, setActiveSection] = useState<ProfileSection>("overview");
  const [isLive, setIsLive] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const sections: { id: ProfileSection; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "history", label: "History" },
    { id: "analytics", label: "Analytics" },
    { id: "content", label: "Content" },
    { id: "settings", label: "Settings" },
  ];

  const monthlyEarned = Math.floor(acBalance * 0.8);
  const dailyEarned = Math.floor(acBalance * 0.05);

  const handleAuthClick = () => {
    setShowAuthPrompt(true);
  };

  const handleSurveyComplete = (interests: string[]) => {
    console.log("Selected interests:", interests);
    // Would save to backend
  };

  return (
    <motion.div
      className="flex flex-col pb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Profile Header */}
      <div className="relative px-4 pt-2 pb-4">
        {/* Actions */}
        <div className="flex items-center justify-between mb-4">
          <motion.button
            className="p-2 rounded-full bg-muted/30"
            whileTap={{ scale: 0.9 }}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          <motion.button
            className="p-2 rounded-full bg-muted/30"
            whileTap={{ scale: 0.9 }}
          >
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Avatar & Info */}
        <div className="flex items-center gap-4">
          <AnimatedAvatar size="lg" isOnline={true} isLive={isLive} />

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">
                {isGuest ? "Guest User" : "Your Name"}
              </h2>
              <motion.button
                className="p-1 rounded-full hover:bg-muted/50"
                whileTap={{ scale: 0.9 }}
              >
                <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
              </motion.button>
            </div>
            <p className="text-sm text-muted-foreground">
              {isGuest ? "@guest_user" : "@your_username"}
            </p>
          </div>
        </div>

        {/* Guest Auth Prompt */}
        {isGuest && (
          <motion.div
            className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-foreground mb-3">
              Sign in to save your AC and unlock all features
            </p>
            <div className="flex gap-2">
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
                whileTap={{ scale: 0.98 }}
                onClick={handleAuthClick}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </motion.button>
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/50 text-foreground font-medium text-sm"
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSurvey(true)}
              >
                <UserPlus className="w-4 h-4" />
                Create Account
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Go Live Button - Only for authenticated users */}
        {!isGuest && (
          <motion.button
            className={cn(
              "mt-4 w-full py-2 rounded-xl font-medium text-sm transition-colors",
              isLive 
                ? "bg-destructive text-destructive-foreground" 
                : "bg-muted/30 text-foreground border border-border/50"
            )}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? "End Live" : "Go Live"}
          </motion.button>
        )}
      </div>

      {/* Wallet Panel - TOP (Most Important) */}
      <WalletPanel 
        balance={acBalance} 
        monthlyEarned={monthlyEarned}
        dailyEarned={dailyEarned}
        multiplier={1.5}
      />

      {/* Section Tabs */}
      <div className="px-4 mt-4 mb-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                activeSection === section.id
                  ? "bg-foreground text-background"
                  : "bg-muted/30 text-muted-foreground"
              )}
              onClick={() => setActiveSection(section.id)}
              whileTap={{ scale: 0.95 }}
            >
              {section.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        {activeSection === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <ActivitySnapshot />
          </motion.div>
        )}

        {activeSection === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <WatchHistoryHub />
          </motion.div>
        )}

        {activeSection === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <PerformanceDashboard />
          </motion.div>
        )}

        {activeSection === "content" && (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <MediaGrid />
          </motion.div>
        )}

        {activeSection === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <ThemeSettings />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interest Survey Modal */}
      <InterestSurvey
        isOpen={showSurvey}
        onClose={() => setShowSurvey(false)}
        onComplete={handleSurveyComplete}
      />
    </motion.div>
  );
};

export default ProfileTab;
