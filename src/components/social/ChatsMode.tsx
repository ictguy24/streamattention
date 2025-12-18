import { motion } from "framer-motion";
import { Search, Edit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const DEMO_CHATS: Chat[] = [
  { id: "1", name: "Alex Rivera", lastMessage: "That video was amazing! 🔥", time: "2m", unread: 3, online: true },
  { id: "2", name: "Sarah Chen", lastMessage: "Let's collab on something", time: "15m", unread: 1, online: true },
  { id: "3", name: "Mike Johnson", lastMessage: "Sent you 50 AC as a gift!", time: "1h", unread: 0, online: false },
  { id: "4", name: "Emma Wilson", lastMessage: "Check out my new post", time: "3h", unread: 0, online: true },
  { id: "5", name: "Group: Creators Hub", lastMessage: "James: New challenge dropped!", time: "5h", unread: 12, online: false },
  { id: "6", name: "David Kim", lastMessage: "Thanks for the follow!", time: "1d", unread: 0, online: false },
];

interface ChatsModeProps {
  onACEarned?: (amount: number) => void;
}

const ChatsMode = ({ onACEarned }: ChatsModeProps) => {
  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* New Message Button */}
      <motion.button
        className="mx-4 mb-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Edit className="w-4 h-4" />
        <span className="text-sm font-medium">New Message</span>
      </motion.button>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2">
        {DEMO_CHATS.map((chat, index) => (
          <motion.div
            key={chat.id}
            className="flex items-center gap-3 p-3 rounded-xl glass-card cursor-pointer hover:bg-muted/30 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-gradient-neon text-primary-foreground font-medium">
                  {chat.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              {chat.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-medium text-foreground truncate">{chat.name}</span>
                <span className="text-xs text-muted-foreground">{chat.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
            </div>

            {/* Unread Badge */}
            {chat.unread > 0 && (
              <motion.div
                className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <span className="text-xs font-bold text-primary-foreground">{chat.unread}</span>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ChatsMode;
