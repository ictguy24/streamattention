import { AnimatePresence, PanInfo, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { EnergyIcon, DiscussIcon, AmplifyIcon, ConnectIcon } from "@/components/social/InteractionIcons";
import { useNotifications } from "@/hooks/useNotifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile?: (username: string) => void;
  onNavigateToContent?: (contentId: string) => void;
}

const NotificationSheet = ({ isOpen, onClose, onNavigateToProfile, onNavigateToContent }: NotificationSheetProps) => {
  const { notifications, isLoading, unreadCount, markAsRead } = useNotifications();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 200) {
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "follow": return <ConnectIcon className="w-4 h-4 text-foreground" />;
      case "like": return <EnergyIcon className="w-4 h-4 text-amber-500" />;
      case "comment": return <DiscussIcon className="w-4 h-4 text-blue-400" />;
      case "repost": return <AmplifyIcon className="w-4 h-4 text-green-400" />;
      default: return <ConnectIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Follow back mutation
  const followMutation = useMutation({
    mutationFn: async (actorId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("follows").insert({
        follower_id: user.id,
        following_id: actorId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follows"] });
    },
  });

  const handleUsernameClick = (username: string | undefined) => {
    if (username) {
      onNavigateToProfile?.(username);
      onClose();
    }
  };

  const handleContentClick = (contentId: string | null) => {
    if (contentId) {
      onNavigateToContent?.(contentId);
      onClose();
    }
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[70vh] flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-foreground/10 text-foreground text-xs font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                className="p-2 rounded-full hover:bg-muted/50 active:scale-95 transition-all"
                onClick={onClose}
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                    <ConnectIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground mt-1">When someone interacts with you, you'll see it here</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 border-b border-border/30",
                      !notification.is_read && "bg-foreground/5"
                    )}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    {/* Avatar */}
                    <button
                      className="relative shrink-0 active:scale-95 transition-transform"
                      onClick={() => handleUsernameClick(notification.actor_username)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={notification.actor_avatar || undefined} />
                        <AvatarFallback className="bg-muted/30 text-foreground text-sm">
                          {notification.actor_username?.[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-card">
                        {getIcon(notification.type)}
                      </div>
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {notification.actor_username && (
                          <button
                            className="font-medium hover:underline"
                            onClick={() => handleUsernameClick(notification.actor_username)}
                          >
                            @{notification.actor_username}
                          </button>
                        )}{" "}
                        {notification.content_id ? (
                          <button
                            className="text-muted-foreground hover:text-foreground hover:underline"
                            onClick={() => handleContentClick(notification.content_id)}
                          >
                            {notification.message}
                          </button>
                        ) : (
                          <span className="text-muted-foreground">{notification.message}</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                    </div>

                    {/* Action Buttons for follows */}
                    {notification.type === "follow" && notification.actor_id && (
                      <div className="shrink-0">
                        <button
                          className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium active:scale-95 transition-transform"
                          onClick={() => followMutation.mutate(notification.actor_id!)}
                          disabled={followMutation.isPending}
                        >
                          {followMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "Follow Back"
                          )}
                        </button>
                      </div>
                    )}

                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-foreground shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationSheet;
