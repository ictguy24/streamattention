import { useState } from "react";
import { AnimatePresence, PanInfo, motion } from "framer-motion";
import { X, Check, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { EnergyIcon, DiscussIcon, AmplifyIcon, ConnectIcon } from "@/components/social/InteractionIcons";

interface Notification {
  id: string;
  type: "follow" | "like" | "comment" | "repost";
  username: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
  isFollowing: boolean;
  contentId?: string;
}

interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile?: (username: string) => void;
  onNavigateToContent?: (contentId: string) => void;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "follow", username: "alex_rivera", message: "started following you", timeAgo: "2m", isRead: false, isFollowing: false },
  { id: "2", type: "like", username: "sarah_chen", message: "liked your video", timeAgo: "15m", isRead: false, isFollowing: true, contentId: "video_1" },
  { id: "3", type: "comment", username: "mike_j", message: "commented: This is amazing! 🔥", timeAgo: "1h", isRead: false, isFollowing: true, contentId: "post_2" },
  { id: "4", type: "follow", username: "emma_wilson", message: "started following you", timeAgo: "2h", isRead: true, isFollowing: false },
  { id: "5", type: "repost", username: "david_kim", message: "amplified your thread", timeAgo: "5h", isRead: true, isFollowing: true, contentId: "thread_1" },
  { id: "6", type: "like", username: "luna_stars", message: "liked your memory", timeAgo: "1d", isRead: true, isFollowing: false, contentId: "memory_1" },
];

const NotificationSheet = ({ isOpen, onClose, onNavigateToProfile, onNavigateToContent }: NotificationSheetProps) => {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

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

  const handleFollowBack = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isFollowing: true } : n
      )
    );
  };

  const handleUnfollow = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isFollowing: false } : n
      )
    );
  };

  const handleUsernameClick = (username: string) => {
    onNavigateToProfile?.(username);
    onClose();
  };

  const handleContentClick = (contentId: string) => {
    onNavigateToContent?.(contentId);
    onClose();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 border-b border-border/30",
                    !notification.isRead && "bg-foreground/5"
                  )}
                >
                  {/* Avatar - Clickable to profile */}
                  <button
                    className="relative shrink-0 active:scale-95 transition-transform"
                    onClick={() => handleUsernameClick(notification.username)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-muted/30 text-foreground text-sm">
                        {notification.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-card">
                      {getIcon(notification.type)}
                    </div>
                  </button>

                  {/* Content - Clickable parts */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <button
                        className="font-medium hover:underline"
                        onClick={() => handleUsernameClick(notification.username)}
                      >
                        @{notification.username}
                      </button>{" "}
                      {notification.contentId ? (
                        <button
                          className="text-muted-foreground hover:text-foreground hover:underline"
                          onClick={() => handleContentClick(notification.contentId!)}
                        >
                          {notification.message}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">{notification.message}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notification.timeAgo}</p>
                  </div>

                  {/* Action Buttons */}
                  {notification.type === "follow" && (
                    <div className="shrink-0">
                      {notification.isFollowing ? (
                        <button
                          className="px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground text-xs font-medium flex items-center gap-1 active:scale-95 transition-transform"
                          onClick={() => handleUnfollow(notification.id)}
                        >
                          <Check className="w-3 h-3" />
                          Following
                        </button>
                      ) : (
                        <button
                          className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium active:scale-95 transition-transform"
                          onClick={() => handleFollowBack(notification.id)}
                        >
                          Follow Back
                        </button>
                      )}
                    </div>
                  )}

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationSheet;