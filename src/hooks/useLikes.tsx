import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useLikes = (postId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isLiked = false, isLoading } = useQuery({
    queryKey: ["like", postId, user?.id],
    queryFn: async () => {
      if (!user || !postId) return false;

      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!postId,
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user || !postId) throw new Error("Not authenticated");

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from("likes")
          .insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["like", postId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return {
    isLiked,
    isLoading,
    toggleLike: toggleLikeMutation.mutate,
    isToggling: toggleLikeMutation.isPending,
  };
};

export const useSaves = (postId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isSaved = false, isLoading } = useQuery({
    queryKey: ["save", postId, user?.id],
    queryFn: async () => {
      if (!user || !postId) return false;

      const { data, error } = await supabase
        .from("saves")
        .select("*")
        .eq("user_id", user.id)
        .eq("post_id", postId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!postId,
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !postId) throw new Error("Not authenticated");

      if (isSaved) {
        const { error } = await supabase
          .from("saves")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saves")
          .insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["save", postId, user?.id] });
    },
  });

  return {
    isSaved,
    isLoading,
    toggleSave: toggleSaveMutation.mutate,
    isToggling: toggleSaveMutation.isPending,
  };
};
