import { useState, useEffect } from "react";
import { UserMinus, Volume2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar_url?: string;
  isFollowing: boolean;
  isMuted?: boolean;
  isBlocked?: boolean;
}

type ListType = "followers" | "following" | "blocked" | "muted";

interface SocialControlProps {
  initialList?: ListType;
  onNavigateToProfile?: (username: string) => void;
}

const SocialControl = ({ initialList = "followers", onNavigateToProfile }: SocialControlProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeList, setActiveList] = useState<ListType>(initialList);

  // Fetch followers
  const { data: followers = [], isLoading: loadingFollowers } = useQuery({
    queryKey: ["followers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("follows")
        .select("follower_id, created_at")
        .eq("following_id", user.id);
      
      if (error) throw error;
      
      // Get profiles for followers
      const followerIds = data.map(f => f.follower_id);
      if (followerIds.length === 0) return [];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", followerIds);
      
      // Check if we're following them back
      const { data: followingData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id)
        .in("following_id", followerIds);
      
      const followingSet = new Set(followingData?.map(f => f.following_id) || []);
      
      return (profiles || []).map(p => ({
        id: p.id,
        username: p.username || "user",
        displayName: p.display_name || p.username || "User",
        avatar_url: p.avatar_url,
        isFollowing: followingSet.has(p.id),
      }));
    },
    enabled: !!user,
  });

  // Fetch following
  const { data: following = [], isLoading: loadingFollowing } = useQuery({
    queryKey: ["following", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("follows")
        .select("following_id, created_at")
        .eq("follower_id", user.id);
      
      if (error) throw error;
      
      const followingIds = data.map(f => f.following_id);
      if (followingIds.length === 0) return [];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", followingIds);
      
      return (profiles || []).map(p => ({
        id: p.id,
        username: p.username || "user",
        displayName: p.display_name || p.username || "User",
        avatar_url: p.avatar_url,
        isFollowing: true,
      }));
    },
    enabled: !!user,
  });

  // Fetch blocked users
  const { data: blocked = [], isLoading: loadingBlocked } = useQuery({
    queryKey: ["blocked", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_blocks")
        .select("blocked_id, created_at")
        .eq("blocker_id", user.id)
        .eq("block_type", "block");
      
      if (error) throw error;
      
      const blockedIds = data.map(b => b.blocked_id);
      if (blockedIds.length === 0) return [];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", blockedIds);
      
      return (profiles || []).map(p => ({
        id: p.id,
        username: p.username || "user",
        displayName: p.display_name || p.username || "User",
        avatar_url: p.avatar_url,
        isFollowing: false,
        isBlocked: true,
      }));
    },
    enabled: !!user,
  });

  // Fetch muted users
  const { data: muted = [], isLoading: loadingMuted } = useQuery({
    queryKey: ["muted", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_blocks")
        .select("blocked_id, created_at")
        .eq("blocker_id", user.id)
        .eq("block_type", "mute");
      
      if (error) throw error;
      
      const mutedIds = data.map(m => m.blocked_id);
      if (mutedIds.length === 0) return [];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", mutedIds);
      
      return (profiles || []).map(p => ({
        id: p.id,
        username: p.username || "user",
        displayName: p.display_name || p.username || "User",
        avatar_url: p.avatar_url,
        isFollowing: false,
        isMuted: true,
      }));
    },
    enabled: !!user,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });

  // Unblock mutation
  const unblockMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      await supabase
        .from("user_blocks")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked"] });
      queryClient.invalidateQueries({ queryKey: ["muted"] });
    },
  });

  const handleFollow = (userId: string) => {
    followMutation.mutate(userId);
  };

  const handleUnfollow = (userId: string) => {
    unfollowMutation.mutate(userId);
  };

  const handleUnblock = (userId: string) => {
    unblockMutation.mutate(userId);
  };

  const handleUnmute = (userId: string) => {
    unblockMutation.mutate(userId);
  };

  const lists: { id: ListType; label: string; count: number }[] = [
    { id: "followers", label: "Followers", count: followers.length },
    { id: "following", label: "Following", count: following.length },
    { id: "blocked", label: "Blocked", count: blocked.length },
    { id: "muted", label: "Muted", count: muted.length },
  ];

  const isLoading = activeList === "followers" ? loadingFollowers 
    : activeList === "following" ? loadingFollowing
    : activeList === "blocked" ? loadingBlocked
    : loadingMuted;

  const renderUserList = (users: User[], listType: ListType) => (
    <div className="space-y-1">
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="w-24 h-4 mb-1" />
                <Skeleton className="w-16 h-3" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          No users in this list
        </p>
      ) : (
        users.map(user => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/10 transition-colors"
          >
            <button
              className="shrink-0 active:scale-95 transition-transform"
              onClick={() => onNavigateToProfile?.(user.username)}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-muted/30 text-foreground">
                  {user.displayName[0]}
                </AvatarFallback>
              </Avatar>
            </button>

            <div className="flex-1 min-w-0">
              <button
                className="font-medium text-foreground text-sm hover:underline text-left"
                onClick={() => onNavigateToProfile?.(user.username)}
              >
                {user.displayName}
              </button>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>

            {/* Actions based on list type */}
            {listType === "followers" && (
              <button
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium active:scale-95 transition-all",
                  user.isFollowing
                    ? "bg-muted/20 text-muted-foreground"
                    : "bg-foreground text-background"
                )}
                onClick={() => user.isFollowing 
                  ? handleUnfollow(user.id) 
                  : handleFollow(user.id)
                }
              >
                {user.isFollowing ? "Following" : "Follow Back"}
              </button>
            )}

            {listType === "following" && (
              <button
                className="p-2 rounded-lg bg-muted/20 text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
                onClick={() => handleUnfollow(user.id)}
              >
                <UserMinus className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}

            {listType === "blocked" && (
              <button
                className="px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground text-xs font-medium active:scale-95 transition-all"
                onClick={() => handleUnblock(user.id)}
              >
                Unblock
              </button>
            )}

            {listType === "muted" && (
              <button
                className="p-2 rounded-lg bg-muted/20 text-muted-foreground active:scale-95 transition-all"
                onClick={() => handleUnmute(user.id)}
              >
                <Volume2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="px-4">
      {/* List Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-4">
        {lists.map(list => (
          <button
            key={list.id}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1",
              activeList === list.id
                ? "bg-foreground text-background"
                : "bg-muted/30 text-muted-foreground"
            )}
            onClick={() => setActiveList(list.id)}
          >
            {list.label}
            <span className="opacity-70">({list.count})</span>
          </button>
        ))}
      </div>

      {/* User Lists */}
      {activeList === "followers" && renderUserList(followers, "followers")}
      {activeList === "following" && renderUserList(following, "following")}
      {activeList === "blocked" && renderUserList(blocked, "blocked")}
      {activeList === "muted" && renderUserList(muted, "muted")}
    </div>
  );
};

export default SocialControl;