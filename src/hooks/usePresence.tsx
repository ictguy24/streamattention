import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';

interface PresenceUser {
  user_id: string;
  username?: string;
  avatar_url?: string;
  online_at: string;
}

interface UsePresenceReturn {
  onlineUsers: PresenceUser[];
  onlineUserIds: Set<string>;
  isUserOnline: (userId: string) => boolean;
  onlineCount: number;
}

export const usePresence = (): UsePresenceReturn => {
  const { user, profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState() as RealtimePresenceState<PresenceUser>;
        const users: PresenceUser[] = [];
        
        Object.values(state).forEach((presences) => {
          presences.forEach((presence: any) => {
            if (presence.user_id && presence.user_id !== user.id) {
              users.push({
                user_id: presence.user_id,
                username: presence.username,
                avatar_url: presence.avatar_url,
                online_at: presence.online_at,
              });
            }
          });
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            username: profile?.username,
            avatar_url: profile?.avatar_url,
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [user, profile?.username, profile?.avatar_url]);

  const onlineUserIds = new Set(onlineUsers.map(u => u.user_id));

  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUserIds.has(userId);
  }, [onlineUserIds]);

  return {
    onlineUsers,
    onlineUserIds,
    isUserOnline,
    onlineCount: onlineUsers.length,
  };
};
