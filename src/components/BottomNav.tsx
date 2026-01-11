import { cn } from "@/lib/utils";
import { StreamIcon, SocialIcon, CreateIcon, ProfileIcon } from "./icons/NavIcons";

type TabType = "stream" | "social" | "create" | "live" | "profile";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: "stream" as const, Icon: StreamIcon, label: "Stream" },
  { id: "social" as const, Icon: SocialIcon, label: "Social" },
  { id: "create" as const, Icon: CreateIcon, label: "Create", isCenter: true },
  { id: "profile" as const, Icon: ProfileIcon, label: "Profile" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const displayTab = activeTab === "live" ? "stream" : activeTab;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      
      <div className="relative flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = displayTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all active:scale-95",
                tab.isCenter ? "px-5" : "px-4"
              )}
            >
              {/* Center Button */}
              {tab.isCenter ? (
                <div
                  className={cn(
                    "relative p-3 rounded-full transition-colors",
                    isActive 
                      ? "bg-primary" 
                      : "bg-muted"
                  )}
                >
                  <tab.Icon 
                    className={cn(
                      "transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )} 
                    filled={isActive}
                  />
                </div>
              ) : (
                <>
                  {/* Color-fill icon based on active state */}
                  <tab.Icon 
                    className={cn(
                      "transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                    filled={isActive}
                  />
                  <span
                    className={cn(
                      "text-xs mt-1 transition-colors",
                      isActive ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {tab.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
