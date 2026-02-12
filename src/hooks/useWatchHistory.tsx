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

      return (data || []).map((item: unknown) => {
        const historyItem = item as { id: string; post_id: string; watch_duration_ms?: number; completed?: boolean; watched_at?: string; posts?: { title?: string; description?: string; thumbnail_url?: string; media_url?: string; profiles?: { username?: string; avatar_url?: string } } };
        return {
          id: historyItem.id,
          post_id: historyItem.post_id,
          watch_duration_ms: historyItem.watch_duration_ms,
          completed: historyItem.completed,
          watched_at: historyItem.watched_at,
          post: historyItem.posts ? {
            title: historyItem.posts.title,
            description: historyItem.posts.description,
            thumbnail_url: historyItem.posts.thumbnail_url,
            media_url: historyItem.posts.media_url,
            username: historyItem.posts.profiles?.username,
            avatar_url: historyItem.posts.profiles?.avatar_url,
          } : undefined,
        };
      });
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
