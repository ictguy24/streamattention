import { useState } from "react";
import { Edit3, LogIn, UserPlus, Users, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedAvatar from "../profile/AnimatedAvatar";
import WalletPanel from "../profile/WalletPanel";
import ActivitySnapshot from "../profile/ActivitySnapshot";
import WatchHistoryHub from "../profile/WatchHistoryHub";
import PerformanceDashboard from "../profile/PerformanceDashboard";
import MediaGrid from "../profile/MediaGrid";
import SettingsPanel from "../profile/SettingsPanel";
import SocialControl from "../profile/SocialControl";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProfileTabProps {
  acBalance: number;
}

type ProfileSection = "overview" | "history" | "analytics" | "content" | "social" | "settings";

const ProfileTab = ({ acBalance }: ProfileTabProps) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<ProfileSection>("overview");
  const [isLive, setIsLive] = useState(false);

  const isGuest = !user;

  const sections: { id: ProfileSection; label: string; icon?: typeof Users }[] = [
    { id: "overview", label: "Overview" },
    { id: "history", label: "History" },
    { id: "analytics", label: "Analytics" },
    { id: "content", label: "Content" },
    { id: "social", label: "Social", icon: Users },
    { id: "settings", label: "Settings" },
  ];

  // Use profile AC balance if available, otherwise use prop
  const displayBalance = profile?.ac_balance ?? acBalance;
  const monthlyEarned = Math.floor(displayBalance * 0.8);
  const dailyEarned = Math.floor(displayBalance * 0.05);
  const lifetimeEarned = Math.floor(displayBalance * 2.5);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const displayName = profile?.display_name || profile?.username || user?.email?.split("@")[0] || "Your Name";
  const displayUsername = profile?.username || user?.email?.split("@")[0] || "your_username";

  return (
    <div className="flex flex-col pb-8">
      {/* Profile Header */}
      <div className="relative px-4 pt-2 pb-4">
        {/* Avatar & Info */}
        <div className="flex items-center gap-4">
          <AnimatedAvatar 
            size="lg" 
            isOnline={true} 
            isLive={isLive}
            avatarUrl={profile?.avatar_url}
          />

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                {isGuest ? "Guest User" : displayName}
              </h2>
              {!isGuest && (
                <button className="p-1 rounded-full hover:bg-muted/50 active:scale-95 transition-transform">
                  <Edit3 className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isGuest ? "@guest_user" : `@${displayUsername}`}
            </p>
          </div>

          {/* Sign Out Button */}
          {!isGuest && (
            <button
              onClick={handleSignOut}
              className="p-2 rounded-full hover:bg-muted/50 active:scale-95 transition-transform"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Guest Auth Prompt */}
        {isGuest && (
          <div className="mt-4 p-3 rounded-xl bg-foreground/5 border border-border/20">
            <p className="text-xs text-foreground mb-3">
              Sign in to save your AC and unlock all features
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-foreground text-background font-medium text-xs active:scale-[0.98] transition-transform"
                onClick={() => navigate("/auth")}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-muted/30 text-foreground font-medium text-xs active:scale-[0.98] transition-transform"
                onClick={() => navigate("/auth?mode=register")}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* Go Live Button - Only for authenticated users */}
        {!isGuest && (
          <button
            className={cn(
              "mt-4 w-full py-2 rounded-xl font-medium text-xs transition-colors active:scale-[0.98]",
              isLive 
                ? "bg-destructive text-destructive-foreground" 
                : "bg-muted/30 text-foreground border border-border/50"
            )}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? "End Live" : "Go Live"}
          </button>
        )}
      </div>

      {/* Wallet Panel */}
      <WalletPanel 
        balance={displayBalance} 
        monthlyEarned={monthlyEarned}
        dailyEarned={dailyEarned}
        multiplier={1.5}
        tier={(profile?.tier as "free" | "pro" | "premium") || "free"}
        lifetimeEarned={lifetimeEarned}
      />

      {/* Section Tabs */}
      <div className="px-4 mt-4 mb-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {sections.map((section) => (
            <button
              key={section.id}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap flex items-center gap-1 active:scale-95",
                activeSection === section.id
                  ? "bg-foreground text-background"
                  : "bg-muted/30 text-muted-foreground"
              )}
              onClick={() => setActiveSection(section.id)}
            >
              {section.icon && <section.icon className="w-2.5 h-2.5" />}
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="mt-2">
        {activeSection === "overview" && <ActivitySnapshot />}
        {activeSection === "history" && <WatchHistoryHub />}
        {activeSection === "analytics" && <PerformanceDashboard />}
        {activeSection === "content" && <MediaGrid />}
        {activeSection === "social" && <SocialControl />}
        {activeSection === "settings" && <SettingsPanel />}
      </div>
    </div>
  );
};

export default ProfileTab;
