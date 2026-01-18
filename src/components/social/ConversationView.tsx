import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Send, Mic, Video, Image, Phone, MoreVertical, Paperclip, Square, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAttention } from "@/contexts/AttentionContext";
import { useMessages } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";

interface ConversationViewProps {
  chatId: string;
  chatName: string;
  isOnline: boolean;
  avatarUrl?: string;
  onBack: () => void;
  onACEarned?: (amount: number) => void;
}

const ConversationView = ({ chatId, chatName, isOnline, avatarUrl, onBack, onACEarned }: ConversationViewProps) => {
  const { user } = useAuth();
  const { sessionId, reportComment } = useAttention();
  const { messages, isLoading, sendMessage, isSending } = useMessages(chatId);
  const [newMessage, setNewMessage] = useState("");
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showCallUI, setShowCallUI] = useState<"audio" | "video" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isRecordingAudio || isRecordingVideo) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingDuration(0);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecordingAudio, isRecordingVideo]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await sendMessage({ content: newMessage });
      
      if (sessionId) {
        reportComment(sessionId, chatId, newMessage);
      }
      
      setNewMessage("");
      onACEarned?.(3);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleStopAudioRecording = async () => {
    setIsRecordingAudio(false);
    await sendMessage({ content: `🎙️ Voice message (${formatDuration(recordingDuration)})` });
    onACEarned?.(5);
  };

  const handleStopVideoRecording = async () => {
    setIsRecordingVideo(false);
    await sendMessage({ content: `📹 Video message (${formatDuration(recordingDuration)})` });
    onACEarned?.(5);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaType = file.type.startsWith("image/") ? "image" 
                    : file.type.startsWith("video/") ? "video" 
                    : "file";
    
    await sendMessage({ content: `📎 Attachment: ${file.name}`, mediaType });
  };

  const handleCall = (type: "audio" | "video") => {
    setShowCallUI(type);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-slide-in-right">
      {/* Call UI Overlay */}
      {showCallUI && (
        <div className="absolute inset-0 z-60 bg-background flex flex-col items-center justify-center">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-muted/30 text-foreground text-3xl">
              {chatName.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <p className="text-lg font-medium text-foreground mb-2">{chatName}</p>
          <p className="text-sm text-muted-foreground mb-8">
            {showCallUI === "video" ? "Video calling..." : "Calling..."}
          </p>
          <button
            className="px-8 py-3 rounded-full bg-destructive text-destructive-foreground font-medium active:scale-95 transition-transform"
            onClick={() => setShowCallUI(null)}
          >
            End Call
          </button>
        </div>
      )}

      {/* Recording Overlay */}
      {(isRecordingAudio || isRecordingVideo) && (
        <div className="absolute inset-0 z-50 bg-background/95 flex flex-col items-center justify-center">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-4",
            isRecordingVideo ? "bg-destructive/20" : "bg-primary/20"
          )}>
            {isRecordingVideo ? (
              <Video className="w-8 h-8 text-destructive" />
            ) : (
              <Mic className="w-8 h-8 text-primary animate-pulse" />
            )}
          </div>
          <p className="text-2xl font-mono text-foreground mb-2">{formatDuration(recordingDuration)}</p>
          <p className="text-sm text-muted-foreground mb-8">
            {isRecordingVideo ? "Recording video..." : "Recording audio..."}
          </p>
          <p className="text-xs text-muted-foreground mb-4">Up to 3 hours</p>
          <button
            className="px-8 py-3 rounded-full bg-destructive text-destructive-foreground font-medium active:scale-95 transition-transform flex items-center gap-2"
            onClick={isRecordingVideo ? handleStopVideoRecording : handleStopAudioRecording}
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
            {chatName.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="font-medium text-foreground">{chatName}</p>
          <p className="text-xs text-muted-foreground">
            {isOnline ? "Online" : "Last seen recently"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button 
            className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
            onClick={() => handleCall("audio")}
          >
            <Phone className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
          <button 
            className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
            onClick={() => handleCall("video")}
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

                {message.media_type === "video" && (
                  <div className="relative w-48 h-32 bg-muted/20 rounded-lg flex items-center justify-center">
                    <Video className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                )}

                {message.media_type === "image" && (
                  <div className="w-48 h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                    <Image className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                )}

                {message.media_type === "file" && (
                  <div className="flex items-center gap-2 py-2 px-3 bg-muted/10 rounded-lg">
                    <Paperclip className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-sm text-foreground">Attachment</span>
                  </div>
                )}

                <p className="text-[10px] mt-1 text-muted-foreground">
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          onChange={handleFileUpload}
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
              ref={inputRef}
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
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          ) : (
            <>
              <button
                className="p-2.5 rounded-lg bg-muted/10 text-muted-foreground active:scale-95 transition-transform"
                onClick={() => setIsRecordingVideo(true)}
              >
                <Video className="w-5 h-5" strokeWidth={1.5} />
              </button>
              
              <button
                className="p-2.5 rounded-lg bg-muted/10 text-muted-foreground active:scale-95 transition-transform"
                onClick={() => setIsRecordingAudio(true)}
              >
                <Mic className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </>
          )}
        </div>
        
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Voice up to 3 hours • Media up to 5GB
        </p>
      </div>
    </div>
  );
};

export default ConversationView;