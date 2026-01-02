import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface WatchHistoryItem {
  id: string;
  post_id: string;
  watch_duration_ms: number;
  completed: boolean;
  watched_at: string;
  post?: {
    title?: string;
    description?: string;
    thumbnail_url?: string;
    media_url?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const useWatchHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading, error } = useQuery({
    queryKey: ["watch_history", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("watch_history")
        .select(`
          *,
          posts:post_id (
            title,
            description,
            thumbnail_url,
            media_url,
            profiles:user_id (username, avatar_url)
          )
        `)
        .eq("user_id", user.id)
        .order("watched_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        post_id: item.post_id,
        watch_duration_ms: item.watch_duration_ms,
        completed: item.completed,
        watched_at: item.watched_at,
        post: item.posts ? {
          title: item.posts.title,
          description: item.posts.description,
          thumbnail_url: item.posts.thumbnail_url,
          media_url: item.posts.media_url,
          username: item.posts.profiles?.username,
          avatar_url: item.posts.profiles?.avatar_url,
        } : undefined,
      }));
    },
    enabled: !!user,
  });

  const trackWatchMutation = useMutation({
    mutationFn: async ({ 
      postId, 
      durationMs, 
      completed 
    }: { 
      postId: string; 
      durationMs: number; 
      completed?: boolean;
    }) => {
      if (!user) return;

      const { error } = await supabase
        .from("watch_history")
        .upsert({
          user_id: user.id,
          post_id: postId,
          watch_duration_ms: durationMs,
          completed: completed || false,
          watched_at: new Date().toISOString(),
        }, { onConflict: "user_id,post_id" });

      if (error) throw error;
    },
  });

  return {
    history,
    isLoading,
    error,
    trackWatch: trackWatchMutation.mutate,
  };
};
