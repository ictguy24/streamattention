import { useState } from "react";
import { Search, Edit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import ConversationView from "./ConversationView";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const DEMO_CONVERSATIONS: Conversation[] = [
  { id: "1", name: "Alex Rivera", lastMessage: "That video was amazing! 🔥", time: "2m", unread: 3, online: true },
  { id: "2", name: "Sarah Chen", lastMessage: "Let's collab on something", time: "15m", unread: 1, online: true },
  { id: "3", name: "Mike Johnson", lastMessage: "Sent you 50 AC as a gift!", time: "1h", unread: 0, online: false },
  { id: "4", name: "Emma Wilson", lastMessage: "Check out my new post", time: "3h", unread: 0, online: true },
  { id: "5", name: "Group: Creators Hub", lastMessage: "James: New challenge dropped!", time: "5h", unread: 12, online: false },
  { id: "6", name: "David Kim", lastMessage: "Thanks for the follow!", time: "1d", unread: 0, online: false },
];

const ConversationsMode = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = DEMO_CONVERSATIONS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedConversation) {
    return (
      <ConversationView
        chatId={selectedConversation.id}
        chatName={selectedConversation.name}
        isOnline={selectedConversation.online}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar - Clean, flat */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted/20 text-sm placeholder:text-muted-foreground focus:outline-none focus:bg-muted/30 transition-colors"
          />
        </div>
      </div>

      {/* New Message Button - Flat, no hover scale */}
      <button
        className="mx-4 mb-4 flex items-center justify-center gap-2 py-3 rounded-lg bg-muted/20 text-foreground active:scale-[0.98] transition-transform"
      >
        <Edit className="w-4 h-4" strokeWidth={1.5} />
        <span className="text-sm font-medium">New Message</span>
      </button>

      {/* Conversation List - Full width, spacing-based hierarchy */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <button
            key={conversation.id}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/10 active:scale-[0.99] transition-all border-b border-border/10 last:border-b-0"
            onClick={() => setSelectedConversation(conversation)}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-muted/30 text-foreground font-medium">
                  {conversation.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              {conversation.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500/80 border-2 border-background" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={cn(
                  "font-medium truncate",
                  conversation.unread > 0 ? "text-foreground" : "text-foreground/80"
                )}>
                  {conversation.name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">{conversation.time}</span>
              </div>
              <p className={cn(
                "text-sm truncate",
                conversation.unread > 0 ? "text-foreground/70" : "text-muted-foreground"
              )}>
                {conversation.lastMessage}
              </p>
            </div>

            {/* Unread Badge - Minimal */}
            {conversation.unread > 0 && (
              <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-foreground">{conversation.unread}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationsMode;
