import { Play, Users, PlusCircle, User } from "lucide-react";
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
  { id: "profile" as const, icon: User, label: "Profile" },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const displayTab = activeTab === "live" ? "stream" : activeTab;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      
      <div className="relative flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = displayTab === tab.id;
          const Icon = tab.icon;

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
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )} 
                    fill={isActive ? "currentColor" : "none"}
                  />
                </div>
              ) : (
                <>
                  {/* Icon with fill for active state - NO background pills */}
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                    fill={isActive ? "currentColor" : "none"}
                    strokeWidth={isActive ? 1.5 : 2}
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