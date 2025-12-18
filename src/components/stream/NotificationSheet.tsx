import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Heart, UserPlus, MessageCircle, Repeat2, Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "follow" | "like" | "comment" | "repost";
  username: string;
  message: string;
  timeAgo: string;
  isRead: boolean;
}

interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "follow", username: "alex_rivera", message: "started following you", timeAgo: "2m", isRead: false },
  { id: "2", type: "like", username: "sarah_chen", message: "liked your video", timeAgo: "15m", isRead: false },
  { id: "3", type: "comment", username: "mike_j", message: "commented: This is amazing! 🔥", timeAgo: "1h", isRead: false },
  { id: "4", type: "follow", username: "emma_wilson", message: "started following you", timeAgo: "2h", isRead: true },
  { id: "5", type: "repost", username: "david_kim", message: "reposted your pulse", timeAgo: "5h", isRead: true },
  { id: "6", type: "like", username: "luna_stars", message: "liked your moment", timeAgo: "1d", isRead: true },
];

const NotificationSheet = ({ isOpen, onClose }: NotificationSheetProps) => {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 200) {
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "follow": return <UserPlus className="w-4 h-4 text-primary" />;
      case "like": return <Heart className="w-4 h-4 text-destructive" />;
      case "comment": return <MessageCircle className="w-4 h-4 text-blue-400" />;
      case "repost": return <Repeat2 className="w-4 h-4 text-green-400" />;
      default: return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
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
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
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
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <motion.button
                className="p-2 rounded-full hover:bg-muted/50"
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 border-b border-border/30",
                    !notification.isRead && "bg-primary/5"
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  {/* Avatar with Icon */}
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                        {notification.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-card">
                      {getIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">@{notification.username}</span>{" "}
                      <span className="text-muted-foreground">{notification.message}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{notification.timeAgo}</p>
                  </div>

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationSheet;
