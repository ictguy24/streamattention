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

interface UseDiscoverySearchReturn {
  query: string;
  setQuery: (q: string) => void;
  users: SearchUser[];
  hashtags: SearchHashtag[];
  posts: SearchPost[];
  isSearching: boolean;
  search: (searchQuery: string) => Promise<void>;
  clearResults: () => void;
}

export const useDiscoverySearch = (): UseDiscoverySearchReturn => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [hashtags, setHashtags] = useState<SearchHashtag[]>([]);
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setUsers([]);
      setHashtags([]);
      setPosts([]);
      return;
    }

    setIsSearching(true);

    try {
      const searchTerm = `%${searchQuery.toLowerCase()}%`;

      // Search users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
        .limit(10);

      // Search hashtags
      const { data: hashtagsData } = await supabase
        .from('hashtags')
        .select('id, name, use_count')
        .ilike('name', searchTerm)
        .order('use_count', { ascending: false })
        .limit(10);

      // Search posts
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          content_type,
          user_id
        `)
        .eq('is_public', true)
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(10);

      // Get usernames for posts
      if (postsData?.length) {
        const userIds = [...new Set(postsData.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.username]) || []);

        setPosts(postsData.map(p => ({
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

      setUsers(usersData || []);
      setHashtags(hashtagsData || []);
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
  }, []);

  return {
    query,
    setQuery,
    users,
    hashtags,
    posts,
    isSearching,
    search,
    clearResults,
  };
};
