import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SearchUser {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface SearchHashtag {
  id: string;
  name: string;
  use_count: number | null;
}

interface SearchPost {
  id: string;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  content_type: string;
  username: string | null;
}

interface SearchSound {
  id: string;
  title: string;
  artist: string | null;
  use_count: number | null;
}

interface UseDiscoverySearchReturn {
  query: string;
  setQuery: (q: string) => void;
  users: SearchUser[];
  hashtags: SearchHashtag[];
  posts: SearchPost[];
  sounds: SearchSound[];
  isSearching: boolean;
  search: (searchQuery: string) => Promise<void>;
  clearResults: () => void;
}

export const useDiscoverySearch = (): UseDiscoverySearchReturn => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [hashtags, setHashtags] = useState<SearchHashtag[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [sounds, setSounds] = useState<SearchSound[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setUsers([]);
      setHashtags([]);
      setPosts([]);
      setSounds([]);
      return;
    }

    setIsSearching(true);

    try {
      const searchTerm = `%${searchQuery.toLowerCase()}%`;

      // Search users, hashtags, posts, sounds in parallel
      const [usersRes, hashtagsRes, postsRes, soundsRes] = await Promise.all([
        supabase
          .from<{ id: string; username: string; display_name: string; avatar_url: string }>('profiles_public')
          .select('id, username, display_name, avatar_url')
          .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
          .limit(10),
        supabase
          .from('hashtags')
          .select('id, name, use_count')
          .ilike('name', searchTerm)
          .order('use_count', { ascending: false })
          .limit(10),
        supabase
          .from('posts')
          .select('id, title, description, thumbnail_url, content_type, user_id')
          .eq('is_public', true)
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(10),
        supabase
          .from('music_library')
          .select('id, title, artist, use_count')
          .or(`title.ilike.${searchTerm},artist.ilike.${searchTerm}`)
          .limit(10),
      ]);

      // Process posts with usernames
      if (postsRes.data?.length) {
        const userIds = [...new Set(postsRes.data.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from<{ id: string; username: string | null }>('profiles_public')
          .select('id, username')
          .in('id', userIds);

        const typedProfiles = (profiles as unknown as { id: string; username: string | null }[]) || [];
        const profileMap = new Map(typedProfiles.map(p => [p.id, p.username]));

        setPosts(postsRes.data.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          thumbnail_url: p.thumbnail_url,
          content_type: p.content_type,
          username: profileMap.get(p.user_id) || null,
        })));
      } else {
        setPosts([]);
      }

      setUsers((usersRes.data as unknown as SearchUser[]) || []);
      setHashtags(hashtagsRes.data || []);
      setSounds(soundsRes.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setQuery('');
    setUsers([]);
    setHashtags([]);
    setPosts([]);
    setSounds([]);
  }, []);

  return {
    query,
    setQuery,
    users,
    hashtags,
    posts,
    sounds,
    isSearching,
    search,
    clearResults,
  };
};
