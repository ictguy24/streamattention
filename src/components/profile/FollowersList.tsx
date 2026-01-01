import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AnimatedAvatar from "./AnimatedAvatar";

interface FollowersListProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: "followers" | "following";
  userId: string;
}

interface FollowUser {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  isFollowing: boolean;
}

const FollowersList = ({ isOpen, onClose, initialTab, userId }: FollowersListProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      if (user) fetchFollowingIds();
    }
  }, [isOpen, activeTab, userId]);

  const fetchFollowingIds = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", user.id);
    
    if (data) {
      setFollowingIds(new Set(data.map(f => f.following_id)));
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      let followData;
      
      if (activeTab === "followers") {
        const { data } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("following_id", userId);
        followData = data?.map(f => f.follower_id) || [];
      } else {
        const { data } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId);
        followData = data?.map(f => f.following_id) || [];
      }

      if (followData.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", followData);
        
        if (profiles) {
          setUsers(profiles.map(p => ({
            ...p,
            isFollowing: followingIds.has(p.id)
          })));
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user) return;
    
    const isCurrentlyFollowing = followingIds.has(targetUserId);
    
    if (isCurrentlyFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);
      
      setFollowingIds(prev => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: targetUserId });
      
      setFollowingIds(prev => new Set([...prev, targetUserId]));
    }
    
    // Update local state
    setUsers(prev => prev.map(u => 
      u.id === targetUserId 
        ? { ...u, isFollowing: !isCurrentlyFollowing }
        : u
    ));
  };

  const filteredUsers = users.filter(u => 
    (u.username?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Sheet */}
          <motion.div
            className="relative w-full max-w-lg bg-card border-t border-border rounded-t-3xl max-h-[70vh] flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
              <div className="flex gap-4">
                <button
                  className={cn(
                    "pb-2 text-sm font-medium transition-colors relative",
                    activeTab === "followers" 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                  )}
                  onClick={() => setActiveTab("followers")}
                >
                  Followers
                  {activeTab === "followers" && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                      layoutId="tab-indicator"
                    />
                  )}
                </button>
                <button
                  className={cn(
                    "pb-2 text-sm font-medium transition-colors relative",
                    activeTab === "following" 
                      ? "text-foreground" 
                      : "text-muted-foreground"
                  )}
                  onClick={() => setActiveTab("following")}
                >
                  Following
                  {activeTab === "following" && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                      layoutId="tab-indicator"
                    />
                  )}
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-muted/50 active:scale-95 transition-transform"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            {/* Search */}
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/30 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            
            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No users found" : `No ${activeTab} yet`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((u) => (
                    <motion.div
                      key={u.id}
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-3">
                        <AnimatedAvatar 
                          size="sm" 
                          avatarUrl={u.avatar_url}
                          isOnline={false}
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {u.display_name || u.username || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{u.username || "user"}
                          </p>
                        </div>
                      </div>
                      
                      {user && u.id !== user.id && (
                        <button
                          onClick={() => handleFollow(u.id)}
                          className={cn(
                            "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors active:scale-95",
                            followingIds.has(u.id)
                              ? "bg-muted/50 text-muted-foreground"
                              : "bg-primary text-primary-foreground"
                          )}
                        >
                          {followingIds.has(u.id) ? (
                            <>
                              <UserMinus className="w-3 h-3" />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              Follow
                            </>
                          )}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FollowersList;
