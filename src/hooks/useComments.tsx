import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

export const useComments = (postId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading, error } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      if (!postId) return [];
      
      // Step 1: Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;
      if (!commentsData?.length) return [];

      // Step 2: Fetch profiles from public view
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles_public" as any)
        .select("id, username, avatar_url")
        .in("id", userIds);

      const typedProfiles = (profiles as unknown as { id: string; username: string | null; avatar_url: string | null }[]) || [];
      const profileMap = new Map(typedProfiles.map(p => [p.id, p]));

      return commentsData.map((comment) => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        parent_id: comment.parent_id,
        content: comment.content,
        created_at: comment.created_at,
        username: profileMap.get(comment.user_id)?.username || "user",
        avatar_url: profileMap.get(comment.user_id)?.avatar_url || undefined,
      }));
    },
    enabled: !!postId,
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      if (!user || !postId) throw new Error("Not authenticated or no post");

      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Notification fallback for post owner
      const { data: post } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", postId)
        .maybeSingle();

      if (post?.user_id && post.user_id !== user.id) {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          type: "comment",
          actor_id: user.id,
          content_id: postId,
          message: "commented on your post",
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const addComment = useCallback((content: string, parentId?: string) => {
    return addCommentMutation.mutateAsync({ content, parentId });
  }, [addCommentMutation]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    isAddingComment: addCommentMutation.isPending,
  };
};
