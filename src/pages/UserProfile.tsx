import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Loader2, UserPlus, UserCheck, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePresence } from "@/hooks/usePresence";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UserProfileData {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  tier: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isUserOnline } = usePresence();
  const queryClient = useQueryClient();

  // Fetch profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async (): Promise<UserProfileData | null> => {
      if (!userId) return null;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      // Get follower/following counts
      const [{ count: followerCount }, { count: followingCount }, { count: postCount }] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_public", true),
      ]);

      return {
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        tier: profile.tier,
        followerCount: followerCount || 0,
        followingCount: followingCount || 0,
        postCount: postCount || 0,
      };
    },
    enabled: !!userId,
  });

  // Check if following
  const { data: isFollowing } = useQuery({
    queryKey: ["is-following", user?.id, userId],
    queryFn: async () => {
      if (!user?.id || !userId) return false;
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user?.id && !!userId && user.id !== userId,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !userId) throw new Error("Not authenticated");
      
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
      } else {
        await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: userId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["is-following", user?.id, userId] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
    },
  });

  // Start conversation
  const startConversation = async () => {
    if (!user?.id || !userId) return;
    
    const { data } = await supabase.rpc("get_or_create_conversation", {
      p_user_id: user.id,
      p_other_user_id: userId,
    });

    if (data) {
      navigate(`/chat/${data}`);
    }
  };

  const isOnline = userId ? isUserOnline(userId) : false;
  const isOwnProfile = user?.id === userId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground">User not found</p>
        <button
          className="mt-4 text-primary hover:underline"
          onClick={() => navigate(-1)}
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm safe-area-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            className="p-2 rounded-full hover:bg-muted/30 active:scale-95 transition-all"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-semibold text-foreground">
            @{profileData.username || "user"}
          </h1>
        </div>
      </header>

      {/* Profile Content */}
      <main className="pt-20 pb-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          {/* Avatar */}
          <div className="relative mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileData.avatar_url || undefined} />
              <AvatarFallback className="bg-muted/30 text-2xl">
                {profileData.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-3 border-background" />
            )}
          </div>

          {/* Name */}
          <h2 className="text-xl font-bold text-foreground">
            {profileData.display_name || profileData.username || "User"}
          </h2>
          <p className="text-sm text-muted-foreground mb-2">
            @{profileData.username || "user"}
          </p>

          {/* Online Status */}
          {isOnline && (
            <span className="text-xs text-green-500 font-medium mb-3">Active now</span>
          )}

          {/* Bio */}
          {profileData.bio && (
            <p className="text-sm text-foreground/80 text-center max-w-xs mb-4">
              {profileData.bio}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-8 mb-6">
            <div className="text-center">
              <p className="font-semibold text-foreground">{profileData.postCount}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{profileData.followerCount}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{profileData.followingCount}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && user && (
            <div className="flex items-center gap-3">
              <button
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors active:scale-95 ${
                  isFollowing
                    ? "bg-muted/30 text-foreground"
                    : "bg-foreground text-background"
                }`}
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
              >
                {followMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </>
                )}
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/30 text-foreground font-medium transition-colors active:scale-95"
                onClick={startConversation}
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default UserProfile;
