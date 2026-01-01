import { useState } from "react";
import { Edit3, LogIn, UserPlus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AnimatedAvatar from "../profile/AnimatedAvatar";
import WalletPanel from "../profile/WalletPanel";
import ActivitySnapshot from "../profile/ActivitySnapshot";
import WatchHistoryHub from "../profile/WatchHistoryHub";
import PerformanceDashboard from "../profile/PerformanceDashboard";
import MediaGrid from "../profile/MediaGrid";
import SettingsPanel from "../profile/SettingsPanel";
import SocialControl from "../profile/SocialControl";
import ParticipationRings from "../profile/ParticipationRings";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProfileTabProps {
  acBalance: number;
}

type ProfileSection = "overview" | "history" | "analytics" | "content" | "social" | "settings";

// Account type derived from user behavior (would come from backend in production)
type AccountType = "user" | "creator" | "both";

const ProfileTab = ({ acBalance }: ProfileTabProps) => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<ProfileSection>("overview");
  const [isLive, setIsLive] = useState(false);

  const isGuest = !user;

  // Derive account type and participation score (would come from backend)
  // For demo: if live = creator, if has content = both, otherwise user
  const hasContent = (profile?.ac_balance || acBalance) > 500;
  const accountType: AccountType = isLive ? "creator" : hasContent ? "both" : "user";
  const participationScore = Math.min(Math.floor((profile?.ac_balance || acBalance) / 100), 100);

  const sections: { id: ProfileSection; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "history", label: "History" },
    { id: "analytics", label: "Analytics" },
    { id: "content", label: "Content" },
    { id: "social", label: "Social" },
    { id: "settings", label: "Settings" },
  ];

  // Use profile AC balance if available, otherwise use prop
  const displayBalance = profile?.ac_balance ?? acBalance;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  const displayName = profile?.display_name || profile?.username || user?.email?.split("@")[0] || "Your Name";
  const displayUsername = profile?.username || user?.email?.split("@")[0] || "your_username";

  return (
    <div className="flex flex-col pb-8">
      {/* Profile Header with Participation Rings */}
      <div className="relative px-4 pt-2 pb-4">
        {/* Avatar, Rings & Info */}
        <div className="flex items-start gap-4">
          {/* Left: Avatar with Participation Rings overlay */}
          <div className="relative">
            <ParticipationRings 
              score={participationScore} 
              accountType={accountType}
              className="absolute -inset-2 z-0"
            />
            <div className="relative z-10">
              <AnimatedAvatar 
                size="lg" 
                isOnline={true} 
                isLive={isLive}
                avatarUrl={profile?.avatar_url}
              />
            </div>
            {/* Account type badge */}
            <div className={cn(
              "absolute -bottom-1 -right-1 z-20 px-1.5 py-0.5 rounded-full text-[8px] font-medium uppercase tracking-wider",
              accountType === "creator" && "bg-secondary text-secondary-foreground",
              accountType === "both" && "bg-accent text-accent-foreground",
              accountType === "user" && "bg-primary text-primary-foreground"
            )}>
              {accountType === "both" ? "Dual" : accountType}
            </div>
          </div>

          <div className="flex-1 pt-2">
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
            
            {/* Quick stats row */}
            {!isGuest && (
              <div className="flex items-center gap-4 mt-2">
                <button className="text-center">
                  <span className="block text-sm font-semibold text-foreground">128</span>
                  <span className="text-[10px] text-muted-foreground">Following</span>
                </button>
                <button className="text-center">
                  <span className="block text-sm font-semibold text-foreground">1.2K</span>
                  <span className="text-[10px] text-muted-foreground">Followers</span>
                </button>
                <div className="text-center">
                  <span className="block text-sm font-semibold text-foreground">{participationScore}</span>
                  <span className="text-[10px] text-muted-foreground">Score</span>
                </div>
              </div>
            )}
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

      {/* Wallet Panel - now self-contained with hooks */}
      <WalletPanel />

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
