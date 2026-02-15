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
    <nav className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-[94%] sm:w-[92%] max-w-md pointer-events-none">
      {/* Floating Glass Container */}
      <div className="relative flex items-center justify-around px-2 sm:px-4 py-1.5 sm:py-2 rounded-[2rem] bg-background/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] pointer-events-auto">
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
                    "relative p-3 sm:p-3.5 rounded-full transition-all",
                    isActive
                      ? "bg-primary shadow-lg shadow-primary/30"
                      : "bg-foreground/10"
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  <tab.Icon
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                      isActive ? "text-primary-foreground" : "text-foreground"
                    )}
                    filled={isActive}
                  />
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
                      "text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 transition-colors font-black uppercase tracking-tighter",
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
