import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Edit, ChevronLeft, Send, Mic, Video, Image, Phone, 
  MoreVertical, Paperclip, Square, Loader2, MessageCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { useAttention } from "@/contexts/AttentionContext";

interface Message {
  id: string;
  text?: string;
  mediaType?: "image" | "video" | "audio" | "file";
  mediaUrl?: string;
  isSent: boolean;
  timestamp: string;
  duration?: string;
}

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar_url?: string;
}

interface MessagingContainerProps {
  onACEarned?: (amount: number) => void;
}

const MessagingContainer = ({ onACEarned }: MessagingContainerProps) => {
  const { user } = useAuth();
  const { conversations, isLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Transform conversations to our format
  const displayConversations: Conversation[] = conversations.length > 0 
    ? conversations.map(c => {
        const participant = c.participants?.[0];
        return {
          id: c.id,
          name: participant?.username || 'User',
          lastMessage: c.lastMessage?.content || 'No messages yet',
          time: c.lastMessage?.created_at ? formatTimeAgo(c.lastMessage.created_at) : '',
          unread: c.unreadCount || 0,
          online: false,
          avatar_url: participant?.avatar_url,
        };
      })
    : [];

  const filteredConversations = displayConversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedConversation) {
    return (
      <ConversationView
        conversation={selectedConversation}
        onBack={() => setSelectedConversation(null)}
        onACEarned={onACEarned}
      />
    );
  }

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Search Bar */}
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

      {/* New Message Button */}
      <motion.button
        className="mx-4 mb-4 flex items-center justify-center gap-2 py-3 rounded-lg bg-muted/20 text-foreground active:scale-[0.98] transition-transform"
        whileTap={{ scale: 0.98 }}
      >
        <Edit className="w-4 h-4" strokeWidth={1.5} />
        <span className="text-sm font-medium">New Message</span>
      </motion.button>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" strokeWidth={1.5} />
            <p className="text-muted-foreground text-sm text-center">No conversations yet</p>
            <p className="text-muted-foreground/60 text-xs text-center mt-1">Start a conversation with someone</p>
          </div>
        ) : (
          filteredConversations.map((conversation, index) => (
            <motion.button
              key={conversation.id}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/10 active:scale-[0.99] transition-all border-b border-border/10 last:border-b-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="relative shrink-0">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conversation.avatar_url} />
                  <AvatarFallback className="bg-muted/30 text-foreground font-medium">
                    {conversation.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                {conversation.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500/80 border-2 border-background" />
                )}
              </div>

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

              {conversation.unread > 0 && (
                <div className="min-w-[20px] h-5 px-1.5 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-foreground">{conversation.unread}</span>
                </div>
              )}
            </motion.button>
          ))
        )}
      </div>

      <div className="px-4 py-3 border-t border-border/10">
        <p className="text-[10px] text-muted-foreground text-center">
          Voice recordings up to 3 hours • Video messages • Media up to 5GB
        </p>
      </div>
    </motion.div>
  );
};

// =================== CONVERSATION VIEW ===================

interface ConversationViewProps {
  conversation: Conversation;
  onBack: () => void;
  onACEarned?: (amount: number) => void;
}

const DEMO_MESSAGES: Message[] = [
  { id: "1", text: "Hey! Did you see the new video I posted?", isSent: false, timestamp: "10:30 AM" },
  { id: "2", text: "Yes! It was amazing 🔥", isSent: true, timestamp: "10:32 AM" },
  { id: "3", text: "Thanks! I spent hours editing it", isSent: false, timestamp: "10:33 AM" },
  { id: "4", text: "The transitions were so smooth.", isSent: true, timestamp: "10:35 AM" },
];

const ConversationView = ({ conversation, onBack, onACEarned }: ConversationViewProps) => {
  const { sessionId, reportComment } = useAttention();
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isRecordingAudio) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      setRecordingDuration(0);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecordingAudio]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      isSent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, message]);
    
    if (sessionId) {
      reportComment(sessionId, conversation.id, newMessage);
    }
    
    setNewMessage("");
    onACEarned?.(3);
  };

  const handleStopRecording = () => {
    setIsRecordingAudio(false);
    const message: Message = {
      id: Date.now().toString(),
      mediaType: "audio",
      duration: formatDuration(recordingDuration),
      isSent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, message]);
    onACEarned?.(5);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Recording Overlay */}
      {isRecordingAudio && (
        <div className="absolute inset-0 z-50 bg-background/95 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Mic className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-2xl font-mono text-foreground mb-2">{formatDuration(recordingDuration)}</p>
          <p className="text-sm text-muted-foreground mb-8">Recording audio...</p>
          <button
            className="px-8 py-3 rounded-full bg-destructive text-destructive-foreground font-medium active:scale-95 transition-transform flex items-center gap-2"
            onClick={handleStopRecording}
          >
            <Square className="w-4 h-4" fill="currentColor" />
            Stop Recording
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/20 safe-area-top">
        <button
          className="p-2 -ml-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
          onClick={onBack}
        >
          <ChevronLeft className="w-6 h-6 text-foreground" strokeWidth={1.5} />
        </button>

        <Avatar className="w-10 h-10">
          <AvatarImage src={conversation.avatar_url} />
          <AvatarFallback className="bg-muted/30 text-foreground">
            {conversation.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="font-medium text-foreground">{conversation.name}</p>
          <p className="text-xs text-muted-foreground">
            {conversation.online ? "Online" : "Last seen recently"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform">
            <Phone className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform">
            <Video className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform">
            <MoreVertical className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[80%] transition-opacity",
              message.isSent ? "ml-auto" : "mr-auto"
            )}
          >
            {message.text && (
              <p className={cn(
                "text-sm leading-relaxed",
                message.isSent ? "text-foreground" : "text-foreground/90"
              )}>
                {message.text}
              </p>
            )}
            
            {message.mediaType === "audio" && (
              <div className="flex items-center gap-2 py-2">
                <button className="p-2 rounded-full bg-muted/20 active:scale-95 transition-transform">
                  <Mic className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                </button>
                <div className="h-1 flex-1 bg-muted/30 rounded-full max-w-32">
                  <div className="h-full w-1/3 bg-foreground/50 rounded-full" />
                </div>
                <span className="text-xs text-muted-foreground">{message.duration}</span>
              </div>
            )}

            <p className="text-[10px] mt-1 text-muted-foreground">
              {message.timestamp}
              {message.isSent && <span className="ml-2">✓✓</span>}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 py-3 border-t border-border/20 safe-area-bottom">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          className="hidden"
        />
        
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
          
          <button className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform">
            <Image className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>

          <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/10">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Message..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {newMessage.trim() ? (
            <button
              className="p-2.5 rounded-lg bg-foreground text-background active:scale-95 transition-transform"
              onClick={handleSend}
            >
              <Send className="w-5 h-5" strokeWidth={1.5} />
            </button>
          ) : (
            <button
              className="p-2.5 rounded-lg bg-muted/10 text-muted-foreground active:scale-95 transition-transform"
              onClick={() => setIsRecordingAudio(true)}
            >
              <Mic className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Helper function
function formatTimeAgo(date: string): string {
  try {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  } catch {
    return '';
  }
}

export default MessagingContainer;
