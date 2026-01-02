import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Send, Mic, Video, Image, Phone, MoreVertical, Paperclip, Square } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
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

interface ConversationViewProps {
  chatId: string;
  chatName: string;
  isOnline: boolean;
  onBack: () => void;
}

const DEMO_MESSAGES: Message[] = [
  { id: "1", text: "Hey! Did you see the new video I posted?", isSent: false, timestamp: "10:30 AM" },
  { id: "2", text: "Yes! It was amazing 🔥", isSent: true, timestamp: "10:32 AM" },
  { id: "3", text: "Thanks! I spent hours editing it", isSent: false, timestamp: "10:33 AM" },
  { id: "4", mediaType: "audio", duration: "0:45", isSent: false, timestamp: "10:34 AM" },
  { id: "5", text: "The transitions were so smooth. Really loved the color grading too.", isSent: true, timestamp: "10:35 AM" },
  { id: "6", text: "Want to collab on something?", isSent: false, timestamp: "10:36 AM" },
];

const ConversationView = ({ chatId, chatName, isOnline, onBack }: ConversationViewProps) => {
  const { sessionId, reportComment } = useAttention();
  const [messages, setMessages] = useState(DEMO_MESSAGES);
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

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      isSent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, message]);
    
    // Report message interaction to server
    if (sessionId) {
      reportComment(sessionId, chatId, newMessage);
    }
    
    setNewMessage("");
  };

  const handleStartAudioRecording = () => {
    setIsRecordingAudio(true);
  };

  const handleStopAudioRecording = () => {
    setIsRecordingAudio(false);
    const message: Message = {
      id: Date.now().toString(),
      mediaType: "audio",
      duration: formatDuration(recordingDuration),
      isSent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleStartVideoRecording = () => {
    setIsRecordingVideo(true);
  };

  const handleStopVideoRecording = () => {
    setIsRecordingVideo(false);
    const message: Message = {
      id: Date.now().toString(),
      mediaType: "video",
      duration: formatDuration(recordingDuration),
      isSent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaType = file.type.startsWith("image/") ? "image" 
                    : file.type.startsWith("video/") ? "video" 
                    : "file";
    
    const message: Message = {
      id: Date.now().toString(),
      mediaType,
      isSent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, message]);
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

      {/* Messages - Flat text blocks, NO colored backgrounds */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "max-w-[80%] transition-opacity",
              message.isSent ? "ml-auto" : "mr-auto"
            )}
          >
            {/* Text Message */}
            {message.text && (
              <p className={cn(
                "text-sm leading-relaxed",
                message.isSent ? "text-foreground" : "text-foreground/90"
              )}>
                {message.text}
              </p>
            )}
            
            {/* Audio Message */}
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

            {/* Video Message */}
            {message.mediaType === "video" && (
              <div className="relative w-48 h-32 bg-muted/20 rounded-lg flex items-center justify-center">
                <Video className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                <span className="absolute bottom-2 right-2 text-[10px] text-foreground bg-background/50 px-1 rounded">
                  {message.duration}
                </span>
              </div>
            )}

            {/* Image Message */}
            {message.mediaType === "image" && (
              <div className="w-48 h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                <Image className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
              </div>
            )}

            {/* File Message */}
            {message.mediaType === "file" && (
              <div className="flex items-center gap-2 py-2 px-3 bg-muted/10 rounded-lg">
                <Paperclip className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-sm text-foreground">Attachment</span>
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
          onChange={handleFileUpload}
        />
        
        <div className="flex items-center gap-2">
          {/* Media Attach */}
          <button 
            className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
          
          {/* Image/Gallery */}
          <button 
            className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>

          {/* Input */}
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

          {/* Action Buttons */}
          {newMessage.trim() ? (
            <button
              className="p-2.5 rounded-lg bg-foreground text-background active:scale-95 transition-transform"
              onClick={handleSend}
            >
              <Send className="w-5 h-5" strokeWidth={1.5} />
            </button>
          ) : (
            <>
              {/* Video Record */}
              <button
                className="p-2.5 rounded-lg bg-muted/10 text-muted-foreground active:scale-95 transition-transform"
                onClick={handleStartVideoRecording}
              >
                <Video className="w-5 h-5" strokeWidth={1.5} />
              </button>
              
              {/* Audio Record */}
              <button
                className="p-2.5 rounded-lg bg-muted/10 text-muted-foreground active:scale-95 transition-transform"
                onClick={handleStartAudioRecording}
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
