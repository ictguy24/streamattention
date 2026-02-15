import { cn } from "@/lib/utils";
import { StreamIcon, SocialIcon, CreateIcon, ProfileIcon } from "./icons/NavIcons";
import { motion } from "framer-motion";

type TabType = "stream" | "social" | "create" | "live" | "profile";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "stream" as const, Icon: StreamIcon, label: "Stream" },
  { id: "social" as const, Icon: SocialIcon, label: "Social" },
  { id: "create" as const, Icon: CreateIcon, label: "", isCenter: true },
  { id: "profile" as const, Icon: ProfileIcon, label: "Profile" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const displayTab = activeTab === "live" ? "stream" : activeTab;

  return (
    <nav className="relative w-[94%] sm:w-[92%] max-w-md mx-auto mb-4 pointer-events-none">
      {/* Floating Glass Container */}
      <div className="relative flex items-center justify-around px-2 sm:px-4 py-1.5 sm:py-2 rounded-[2rem] bg-background/70 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = displayTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 rounded-2xl transition-all",
                tab.isCenter ? "px-2 sm:px-3" : "px-4 sm:px-5"
              )}
            >
              {/* Center Create Button */}
              {tab.isCenter ? (
                <motion.div
                  className={cn(
                    "relative p-4 sm:p-4.5 rounded-[1.5rem] transition-all overflow-hidden",
                    isActive
                      ? "bg-gradient-neon shadow-[0_0_20px_rgba(0,229,255,0.5)]"
                      : "bg-white/10 backdrop-blur-md border border-white/10"
                  )}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9, rotate: -5 }}
                >
                  {/* Internal Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />

                  <tab.Icon
                    className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 relative z-10 transition-colors",
                      isActive ? "text-primary-foreground" : "text-white"
                    )}
                    filled={isActive}
                  />

                  {/* Animated border/shimmer */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </motion.div>
              ) : (
                <>
                  {/* Regular Tab Icon */}
                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <tab.Icon
                      className={cn(
                        "w-5 h-5 sm:w-6 sm:h-6 transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                      filled={isActive}
                    />
                  </motion.div>
                  <span
                    className={cn(
                      "text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 transition-colors font-bold uppercase tracking-tight",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {tab.label}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabDot"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(185,100,50,0.5)]"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
