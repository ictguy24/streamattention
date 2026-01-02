import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Post {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  content_type: string;
  title: string | null;
  description: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  cover_image_url: string | null;
  music_url: string | null;
  music_volume: number;
  original_volume: number;
  music_title: string | null;
  like_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  relevance_score?: number;
}

interface UsePostsReturn {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const usePosts = (feedType: 'personalized' | 'latest' = 'personalized'): UsePostsReturn => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      const currentOffset = reset ? 0 : offset;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      let result;
      
      if (session && feedType === 'personalized') {
        // Use personalized feed function
        const { data, error: rpcError } = await supabase.rpc('get_personalized_feed', {
          p_user_id: session.user.id,
          p_limit: limit,
          p_offset: currentOffset,
        });
        
        if (rpcError) throw rpcError;
        result = data;
      } else {
        // Fallback to latest posts
        const { data, error: queryError } = await supabase
          .from('posts')
          .select(`
            id,
            user_id,
            content_type,
            title,
            description,
            media_url,
            thumbnail_url,
            cover_image_url,
            music_url,
            music_volume,
            original_volume,
            music_title,
            like_count,
            comment_count,
            view_count,
            created_at,
            profiles!inner(username, display_name, avatar_url)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .range(currentOffset, currentOffset + limit - 1);
        
        if (queryError) throw queryError;
        
        result = data?.map((post: any) => ({
          ...post,
          username: post.profiles?.username,
          display_name: post.profiles?.display_name,
          avatar_url: post.profiles?.avatar_url,
        }));
      }
      
      if (reset) {
        setPosts(result || []);
        setOffset(limit);
      } else {
        setPosts(prev => [...prev, ...(result || [])]);
        setOffset(prev => prev + limit);
      }
      
      setHasMore((result?.length || 0) === limit);
      setError(null);
    } catch (err) {
      console.error('Posts fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  }, [feedType, offset]);

  const refetch = useCallback(async () => {
    setOffset(0);
    await fetchPosts(true);
  }, [fetchPosts]);

  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await fetchPosts(false);
    }
  }, [fetchPosts, isLoading, hasMore]);

  // Initial fetch
  useEffect(() => {
    fetchPosts(true);
  }, [feedType]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('posts-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    posts,
    isLoading,
    error,
    refetch,
    hasMore,
    loadMore,
  };
};

export interface CreatePostData {
  contentType: 'video' | 'image' | 'audio' | 'text';
  title?: string;
  description?: string;
  mediaFile?: File | Blob;
  coverImageFile?: File;
  musicFile?: File;
  musicLibraryId?: string;
  musicVolume?: number;
  originalVolume?: number;
  hashtags?: string[];
  isPublic?: boolean;
}

export const useCreatePost = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createPost = async (data: CreatePostData): Promise<{ success: boolean; error?: string; postId?: string }> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const userId = session.user.id;
      let mediaUrl: string | null = null;
      let coverImageUrl: string | null = null;
      let musicUrl: string | null = null;
      let musicTitle: string | null = null;

      // Upload main media
      if (data.mediaFile) {
        const fileExt = data.mediaFile instanceof File ? data.mediaFile.name.split('.').pop() : 'mp4';
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, data.mediaFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName);
        
        mediaUrl = urlData.publicUrl;
        setUploadProgress(40);
      }

      // Upload cover image
      if (data.coverImageFile) {
        const fileExt = data.coverImageFile.name.split('.').pop();
        const fileName = `${userId}/covers/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, data.coverImageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName);
        
        coverImageUrl = urlData.publicUrl;
        setUploadProgress(60);
      }

      // Upload custom music or get from library
      if (data.musicFile) {
        const fileExt = data.musicFile.name.split('.').pop();
        const fileName = `${userId}/music/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, data.musicFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName);
        
        musicUrl = urlData.publicUrl;
        musicTitle = data.musicFile.name.replace(/\.[^/.]+$/, '');
        setUploadProgress(80);
      } else if (data.musicLibraryId) {
        const { data: libraryTrack } = await supabase
          .from('music_library')
          .select('audio_url, title')
          .eq('id', data.musicLibraryId)
          .maybeSingle();
        
        if (libraryTrack) {
          musicUrl = libraryTrack.audio_url;
          musicTitle = libraryTrack.title;
        }
      }

      // Create post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content_type: data.contentType,
          title: data.title,
          description: data.description,
          media_url: mediaUrl,
          cover_image_url: coverImageUrl,
          music_url: musicUrl,
          music_title: musicTitle,
          music_volume: data.musicVolume ?? 1.0,
          original_volume: data.originalVolume ?? 1.0,
          music_source: data.musicFile ? 'upload' : data.musicLibraryId ? 'library' : null,
          is_public: data.isPublic ?? true,
        })
        .select()
        .single();

      if (postError) throw postError;

      setUploadProgress(90);

      // Process hashtags
      if (data.hashtags && data.hashtags.length > 0) {
        for (const tagName of data.hashtags) {
          const cleanTag = tagName.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!cleanTag) continue;

          // Upsert hashtag
          const { data: existingTag } = await supabase
            .from('hashtags')
            .select('id')
            .eq('name', cleanTag)
            .maybeSingle();

          let hashtagId: string;

          if (existingTag) {
            hashtagId = existingTag.id;
          } else {
            const { data: newTag, error: tagError } = await supabase
              .from('hashtags')
              .insert({ name: cleanTag, use_count: 1 })
              .select()
              .single();
            
            if (tagError || !newTag) continue;
            hashtagId = newTag.id;
          }

          // Link to post
          await supabase
            .from('post_hashtags')
            .insert({ post_id: post.id, hashtag_id: hashtagId });
        }
      }

      setUploadProgress(100);

      return { success: true, postId: post.id };
    } catch (err) {
      console.error('Create post error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to create post' };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    createPost,
    isUploading,
    uploadProgress,
  };
};

export const useMusicLibrary = () => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const { data, error } = await supabase
          .from('music_library')
          .select('*')
          .eq('is_active', true)
          .order('use_count', { ascending: false });

        if (error) throw error;
        setTracks(data || []);
      } catch (err) {
        console.error('Failed to fetch music library:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, []);

  return { tracks, isLoading };
};
