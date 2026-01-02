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
      
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((comment: any) => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        parent_id: comment.parent_id,
        content: comment.content,
        created_at: comment.created_at,
        username: comment.profiles?.username || "user",
        avatar_url: comment.profiles?.avatar_url,
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
