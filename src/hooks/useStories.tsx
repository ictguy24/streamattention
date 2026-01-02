import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  view_count: number;
  created_at: string;
  expires_at: string;
  username?: string;
  avatar_url?: string;
  hasViewed?: boolean;
}

interface StoryGroup {
  user_id: string;
  username: string;
  avatar_url?: string;
  stories: Story[];
  hasNew: boolean;
}

export const useStories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: storyGroups = [], isLoading, error } = useQuery({
    queryKey: ["stories", user?.id],
    queryFn: async () => {
      // Get all non-expired stories
      const { data, error } = await supabase
        .from("stories")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data?.length) return [];

      // Get viewed stories if user is logged in
      let viewedStoryIds: string[] = [];
      if (user) {
        const { data: views } = await supabase
          .from("story_views")
          .select("story_id")
          .eq("viewer_id", user.id);
        viewedStoryIds = (views || []).map(v => v.story_id);
      }

      // Group stories by user
      const groupedByUser = data.reduce((acc: Record<string, Story[]>, story: any) => {
        const userId = story.user_id;
        if (!acc[userId]) acc[userId] = [];
        acc[userId].push({
          id: story.id,
          user_id: story.user_id,
          media_url: story.media_url,
          media_type: story.media_type,
          view_count: story.view_count,
          created_at: story.created_at,
          expires_at: story.expires_at,
          username: story.profiles?.username,
          avatar_url: story.profiles?.avatar_url,
          hasViewed: viewedStoryIds.includes(story.id),
        });
        return acc;
      }, {});

      // Convert to array of groups
      const groups: StoryGroup[] = Object.entries(groupedByUser).map(([userId, stories]) => ({
        user_id: userId,
        username: stories[0].username || "user",
        avatar_url: stories[0].avatar_url,
        stories,
        hasNew: stories.some(s => !s.hasViewed),
      }));

      // Sort: own stories first, then by hasNew
      return groups.sort((a, b) => {
        if (a.user_id === user?.id) return -1;
        if (b.user_id === user?.id) return 1;
        if (a.hasNew && !b.hasNew) return -1;
        if (!a.hasNew && b.hasNew) return 1;
        return 0;
      });
    },
    enabled: true,
  });

  const createStoryMutation = useMutation({
    mutationFn: async ({ mediaUrl, mediaType }: { mediaUrl: string; mediaType: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("stories")
        .insert({
          user_id: user.id,
          media_url: mediaUrl,
          media_type: mediaType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  const viewStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      if (!user) return;

      // Upsert view
      await supabase
        .from("story_views")
        .upsert({
          story_id: storyId,
          viewer_id: user.id,
        }, { onConflict: "story_id,viewer_id" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  return {
    storyGroups,
    isLoading,
    error,
    createStory: createStoryMutation.mutateAsync,
    viewStory: viewStoryMutation.mutate,
    isCreating: createStoryMutation.isPending,
  };
};
