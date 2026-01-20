import { useState, useEffect } from "react";
import { Edit3, LogIn, UserPlus, LogOut, Instagram, Twitter, Youtube, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "@/features/avatar/Avatar";
import WalletPanel from "../profile/WalletPanel";
import ActivitySnapshot from "../profile/ActivitySnapshot";
import WatchHistoryHub from "../profile/WatchHistoryHub";
import PerformanceDashboard from "../profile/PerformanceDashboard";
import MediaGrid from "../profile/MediaGrid";
import SettingsPanel from "../profile/SettingsPanel";
import SocialControl from "../profile/SocialControl";
import ParticipationRings from "../profile/ParticipationRings";
import FollowersList from "../profile/FollowersList";
import ProfileEditModal from "../profile/ProfileEditModal";
import BoosterStore from "@/features/boosters/BoosterStore";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAttention } from "@/contexts/AttentionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ProfileSection = "overview" | "history" | "content" | "social" | "settings";
type AccountType = "user" | "creator" | "both";

interface SocialLinks {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
}

const ProfileTab = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { ups, acBalance } = useAttention();
  const [activeSection, setActiveSection] = useState<ProfileSection>("overview");
  const [isLive, setIsLive] = useState(false);
  const [showFollowersList, setShowFollowersList] = useState(false);
  const [followersListTab, setFollowersListTab] = useState<"followers" | "following">("followers");
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);

  const isGuest = !user;

  // Extract profile data with extended fields
  const bio = profile?.bio || "";
  const websiteUrl = profile?.website_url || "";
  const socialLinks: SocialLinks = (profile?.social_links as SocialLinks) || {};

  const [totalViews, setTotalViews] = useState(0);

  // Fetch follow counts and total views
  useEffect(() => {
    if (!user) return;
    
    const fetchCounts = async () => {
      const [followers, following, viewsData] = await Promise.all([
        supabase.from("follows").select("id", { count: "exact" }).eq("following_id", user.id),
        supabase.from("follows").select("id", { count: "exact" }).eq("follower_id", user.id),
        supabase.from("posts").select("view_count").eq("user_id", user.id)
      ]);
      
      setFollowerCount(followers.count || 0);
      setFollowingCount(following.count || 0);
      
      // Calculate total views across all content
      const views = viewsData.data?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;
      setTotalViews(views);
    };
    
    fetchCounts();
  }, [user]);

  // Derive account type and participation score
  const hasContent = acBalance > 500;
  const accountType: AccountType = isLive ? "creator" : hasContent ? "both" : "user";
  const participationScore = Math.min(Math.floor(acBalance / 100), 100);

  const sections: { id: ProfileSection; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "history", label: "History" },
    { id: "content", label: "Content" },
    { id: "social", label: "Social" },
    { id: "settings", label: "Settings" },
  ];

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
            <button 
              className="relative z-10 active:scale-95 transition-transform"
              onClick={() => !isGuest && setShowEditModal(true)}
            >
              <Avatar size="lg" />
            </button>
            
            {/* UPS Badge */}
            <div className="absolute -top-1 -left-1 z-20 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {ups.toFixed(1)}
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
                <button 
                  className="p-1 rounded-full hover:bg-muted/50 active:scale-95 transition-transform"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit3 className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isGuest ? "@guest_user" : `@${displayUsername}`}
            </p>

            {/* Bio */}
            {!isGuest && bio && (
              <p className="text-xs text-foreground/80 mt-1.5 line-clamp-2">{bio}</p>
            )}

            {/* Social Links */}
            {!isGuest && (socialLinks.instagram || socialLinks.twitter || socialLinks.youtube || websiteUrl) && (
              <div className="flex items-center gap-2 mt-2">
                {socialLinks.instagram && (
                  <a 
                    href={`https://instagram.com/${socialLinks.instagram}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1 rounded-full hover:bg-muted/50 active:scale-95 transition-transform"
                  >
                    <Instagram className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a 
                    href={`https://twitter.com/${socialLinks.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1 rounded-full hover:bg-muted/50 active:scale-95 transition-transform"
                  >
                    <Twitter className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a 
                    href={`https://youtube.com/${socialLinks.youtube}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1 rounded-full hover:bg-muted/50 active:scale-95 transition-transform"
                  >
                    <Youtube className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                )}
                {websiteUrl && (
                  <a 
                    href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1 rounded-full hover:bg-muted/50 active:scale-95 transition-transform"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                )}
              </div>
            )}
            
            {/* Quick stats row */}
            {!isGuest && (
              <div className="flex items-center gap-4 mt-2">
                <button 
                  className="text-center active:scale-95 transition-transform"
                  onClick={() => {
                    setFollowersListTab("following");
                    setShowFollowersList(true);
                  }}
                >
                  <span className="block text-sm font-semibold text-foreground">{followingCount}</span>
                  <span className="text-[10px] text-muted-foreground">Following</span>
                </button>
                <button 
                  className="text-center active:scale-95 transition-transform"
                  onClick={() => {
                    setFollowersListTab("followers");
                    setShowFollowersList(true);
                  }}
                >
                  <span className="block text-sm font-semibold text-foreground">
                    {followerCount >= 1000 ? `${(followerCount / 1000).toFixed(1)}K` : followerCount}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Followers</span>
                </button>
                <div className="text-center">
                  <span className="block text-sm font-semibold text-foreground">
                    {totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews}
                  </span>
                  <span className="text-[10px] text-muted-foreground">Views</span>
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

        {/* UPS + AC Display */}
        {!isGuest && (
          <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">UPS Score</span>
              <span className="text-sm font-bold text-foreground">{ups.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">AC Balance</span>
              <span className="text-sm font-bold text-foreground">{acBalance.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Go Live Button - Only for authenticated users */}
        {!isGuest && (
          <div className="mt-4 flex gap-2">
            <button
              className={cn(
                "flex-1 py-2 rounded-xl font-medium text-xs transition-colors active:scale-[0.98]",
                isLive 
                  ? "bg-destructive text-destructive-foreground" 
                  : "bg-muted/30 text-foreground border border-border/50"
              )}
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? "End Live" : "Go Live"}
            </button>
            <BoosterStore />
          </div>
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
        {activeSection === "content" && <MediaGrid />}
        {activeSection === "social" && <SocialControl />}
        {activeSection === "settings" && <SettingsPanel />}
      </div>

      {/* Followers/Following List Modal */}
      {user && (
        <FollowersList
          isOpen={showFollowersList}
          onClose={() => setShowFollowersList(false)}
          initialTab={followersListTab}
          userId={user.id}
        />
      )}

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
};

export default ProfileTab;
