import { motion } from "framer-motion";
import { Play, Users, PlusCircle, Radio, User } from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "stream" | "social" | "create" | "live" | "profile";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "stream" as const, icon: Play, label: "Stream" },
  { id: "social" as const, icon: Users, label: "Social" },
  { id: "create" as const, icon: PlusCircle, label: "Create", isCenter: true },
  { id: "live" as const, icon: Radio, label: "Live" },
  { id: "profile" as const, icon: User, label: "Profile" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Background with blur */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border" />
      
      <div className="relative flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-colors",
                tab.isCenter ? "px-5" : "px-4"
              )}
              whileTap={{ scale: 0.9 }}
            >
              {/* Active Background Glow */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/20 rounded-2xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Center Button Special Style */}
              {tab.isCenter ? (
                <motion.div
                  className={cn(
                    "relative p-3 rounded-full",
                    isActive 
                      ? "bg-gradient-neon neon-glow" 
                      : "bg-muted"
                  )}
                  whileHover={{ scale: 1.1 }}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                >
                  <Icon 
                    className={cn(
                      "w-6 h-6",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )} 
                  />
                </motion.div>
              ) : (
                <>
                  <motion.div
                    animate={isActive ? { y: -2 } : { y: 0 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Icon 
                      className={cn(
                        "w-6 h-6 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} 
                    />
                  </motion.div>
                  <motion.span
                    className={cn(
                      "text-xs mt-1 transition-colors",
                      isActive ? "text-primary font-medium" : "text-muted-foreground"
                    )}
                    animate={isActive ? { opacity: 1 } : { opacity: 0.7 }}
                  >
                    {tab.label}
                  </motion.span>
                </>
              )}

              {/* Active Indicator Dot */}
              {isActive && !tab.isCenter && (
                <motion.div
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
