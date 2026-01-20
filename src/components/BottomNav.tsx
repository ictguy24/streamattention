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
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-xl border-t border-border/30" />
      
      <div className="relative flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = displayTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 rounded-2xl transition-all",
                tab.isCenter ? "px-3" : "px-5"
              )}
            >
              {/* Center Create Button */}
              {tab.isCenter ? (
                <motion.div
                  className={cn(
                    "relative p-3.5 rounded-full transition-all",
                    isActive 
                      ? "bg-primary shadow-lg shadow-primary/30" 
                      : "bg-foreground/10"
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  <tab.Icon 
                    className={cn(
                      "w-5 h-5 transition-colors",
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
                        "w-6 h-6 transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                      filled={isActive}
                    />
                  </motion.div>
                  <span
                    className={cn(
                      "text-[10px] mt-1 transition-colors font-medium",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {tab.label}
                  </span>
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-foreground"
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
