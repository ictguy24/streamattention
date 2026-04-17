import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Edit, ChevronLeft, Send, Mic, Video, Image, Phone, 
  MoreVertical, Paperclip, Square, Loader2, MessageCircle, X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useConversations, useMessages } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { useAttention } from "@/contexts/AttentionContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DisplayConversation {
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

// =================== NEW MESSAGE BUTTON ===================

interface NewMessageButtonProps {
  userId?: string;
  onConversationCreated: (conv: DisplayConversation) => void;
}

const NewMessageButton = ({ userId, onConversationCreated }: NewMessageButtonProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["user-search-msg", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) return [];
      const { data } = await supabase
        .from("profiles_public")
        .select("id, username, display_name, avatar_url")
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .neq("id", userId || "")
        .limit(10);
      return data || [];
    },
    enabled: showPicker && searchQuery.length >= 2,
  });

  const handleSelectUser = async (selectedUser: any) => {
    if (!userId || isCreating) return;
    setIsCreating(true);
    try {
      const { data } = await supabase.rpc("get_or_create_conversation", {
        p_user_id: userId,
        p_other_user_id: selectedUser.id,
      });
      if (data) {
        onConversationCreated({
          id: data,
          name: selectedUser.username || selectedUser.display_name || "User",
          lastMessage: "",
          time: "",
          unread: 0,
          online: false,
          avatar_url: selectedUser.avatar_url,
        });
        setShowPicker(false);
        setSearchQuery("");
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <motion.button
        className="mx-4 mb-4 flex items-center justify-center gap-2 py-3 rounded-lg bg-muted/20 text-foreground active:scale-[0.98] transition-transform"
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowPicker(true)}
      >
        <Edit className="w-4 h-4" strokeWidth={1.5} />
        <span className="text-sm font-medium">New Message</span>
      </motion.button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            className="fixed inset-0 z-50 bg-background flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/20">
              <button onClick={() => { setShowPicker(false); setSearchQuery(""); }} className="p-2 -ml-2">
                <X className="w-5 h-5 text-foreground" />
              </button>
              <h3 className="font-semibold text-foreground">New Message</h3>
            </div>
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-muted/20 text-sm placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                <p className="text-center text-muted-foreground text-sm py-8">No users found</p>
              ) : (
                searchResults.map((u: any) => (
                  <button
                    key={u.id}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/10 active:scale-[0.99] transition-all"
                    onClick={() => handleSelectUser(u)}
                    disabled={isCreating}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={u.avatar_url} />
                      <AvatarFallback className="bg-muted/30 text-foreground">{(u.username || "U")[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{u.display_name || u.username}</p>
                      {u.username && <p className="text-xs text-muted-foreground">@{u.username}</p>}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// =================== MESSAGING CONTAINER ===================

const MessagingContainer = ({ onACEarned }: MessagingContainerProps) => {
  const { user } = useAuth();
  const { conversations, isLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<DisplayConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Transform conversations to our format
  const displayConversations: DisplayConversation[] = conversations.length > 0 
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
    // Get recipient ID from the conversation participants
    const recipientId = conversations.find(c => c.id === selectedConversation.id)?.participants?.[0]?.user_id;
    
    return (
      <ConversationView
        conversationId={selectedConversation.id}
        conversationName={selectedConversation.name}
        recipientId={recipientId}
        avatarUrl={selectedConversation.avatar_url}
        isOnline={selectedConversation.online}
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
      <NewMessageButton 
        userId={user?.id}
        onConversationCreated={(conv) => setSelectedConversation(conv)}
      />

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
            <p className="text-muted-foreground/60 text-xs text-center mt-1">Start a conversation with someone you follow</p>
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
  conversationId: string;
  conversationName: string;
  recipientId?: string;
  avatarUrl?: string;
  isOnline: boolean;
  onBack: () => void;
  onACEarned?: (amount: number) => void;
}

const ConversationView = ({ 
  conversationId, 
  conversationName, 
  recipientId,
  avatarUrl,
  isOnline, 
  onBack, 
  onACEarned 
}: ConversationViewProps) => {
  const { user } = useAuth();
  const { sessionId, reportComment } = useAttention();
  const { messages, isLoading, sendMessage, isSending, markAsRead } = useMessages(conversationId);
  const [newMessage, setNewMessage] = useState("");
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check mutual follow status for call features
  const { data: isMutualFollow } = useQuery({
    queryKey: ['mutual-follow', user?.id, recipientId],
    queryFn: async () => {
      if (!user?.id || !recipientId) return false;
      
      const [{ data: iFollow }, { data: theyFollow }] = await Promise.all([
        supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', recipientId)
          .maybeSingle(),
        supabase
          .from('follows')
          .select('id')
          .eq('follower_id', recipientId)
          .eq('following_id', user.id)
          .maybeSingle()
      ]);
      
      return !!(iFollow && theyFollow);
    },
    enabled: !!user?.id && !!recipientId,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    void markAsRead();
  }, [markAsRead, messages.length]);

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

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await sendMessage({ content: newMessage });
      
      reportComment(sessionId, conversationId, newMessage);
      
      setNewMessage("");
      onACEarned?.(3);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleStopRecording = async () => {
    setIsRecordingAudio(false);
    // In a real app, we'd upload the audio file here
    await sendMessage({ content: `🎙️ Voice message (${formatDuration(recordingDuration)})` });
    onACEarned?.(5);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      setIsUploadingFile(true);
      const ext = file.name.split(".").pop() || "bin";
      const path = `${user.id}/messages/${conversationId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from("posts").getPublicUrl(path);

      let mediaType = "file";
      if (file.type.startsWith("image/")) mediaType = "image";
      if (file.type.startsWith("video/")) mediaType = "video";
      if (file.type.startsWith("audio/")) mediaType = "audio";

      await sendMessage(
        mediaType === "file"
          ? { content: `📎 ${file.name}`, mediaUrl: publicUrl.publicUrl, mediaType }
          : { mediaUrl: publicUrl.publicUrl, mediaType }
      );
      onACEarned?.(4);
    } catch (error) {
      console.error("Failed to upload attachment:", error);
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
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
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-muted/30 text-foreground">
            {conversationName.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="font-medium text-foreground">{conversationName}</p>
          <p className="text-xs text-muted-foreground">
            {isOnline ? "Online" : "Last seen recently"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button 
            className={cn(
              "p-2 rounded-lg transition-transform",
              isMutualFollow ? "hover:bg-muted/20 active:scale-95" : "opacity-30 cursor-not-allowed"
            )}
            disabled={!isMutualFollow}
            title={!isMutualFollow ? "Follow each other to call" : "Voice call"}
          >
            <Phone className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
          <button 
            className={cn(
              "p-2 rounded-lg transition-transform",
              isMutualFollow ? "hover:bg-muted/20 active:scale-95" : "opacity-30 cursor-not-allowed"
            )}
            disabled={!isMutualFollow}
            title={!isMutualFollow ? "Follow each other to video call" : "Video call"}
          >
            <Video className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform">
            <MoreVertical className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No messages yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Send a message to start chatting</p>
          </div>
        ) : (
          messages.map((message) => {
            const isSent = message.sender_id === user?.id;
            return (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] transition-opacity",
                  isSent ? "ml-auto" : "mr-auto"
                )}
              >
                {message.content && (
                  <p className={cn(
                    "text-sm leading-relaxed",
                    isSent ? "text-foreground" : "text-foreground/90"
                  )}>
                    {message.content}
                  </p>
                )}

                {message.media_type === "image" && message.media_url && (
                  <img
                    src={message.media_url}
                    alt="attachment"
                    className="mt-2 rounded-lg max-w-48 max-h-56 object-cover"
                  />
                )}

                {message.media_type === "video" && message.media_url && (
                  <video
                    src={message.media_url}
                    className="mt-2 rounded-lg max-w-48 max-h-56"
                    controls
                    playsInline
                  />
                )}
                
                {message.media_type === "audio" && (
                  <div className="flex items-center gap-2 py-2">
                    <button className="p-2 rounded-full bg-muted/20 active:scale-95 transition-transform">
                      <Mic className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                    </button>
                    <div className="h-1 flex-1 bg-muted/30 rounded-full max-w-32">
                      <div className="h-full w-1/3 bg-foreground/50 rounded-full" />
                    </div>
                  </div>
                )}

                <p className="text-[10px] mt-1 text-muted-foreground">
                  {formatMessageTime(message.created_at)}
                  {isSent && <span className="ml-2">✓✓</span>}
                </p>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 py-3 border-t border-border/20 safe-area-bottom">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <div className="flex items-center gap-2">
          <button 
            className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
          
          <button
            className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
            onClick={() => fileInputRef.current?.click()}
          >
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
              disabled={isSending || isUploadingFile}
            >
              {isSending || isUploadingFile ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" strokeWidth={1.5} />
              )}
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

// Helper functions
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

function formatMessageTime(date: string): string {
  try {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export default MessagingContainer;
