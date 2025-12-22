import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Send, Mic, Camera, Image, MoreVertical, Phone, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  isSent: boolean;
  timestamp: string;
}

interface ConversationViewProps {
  chatId: string;
  chatName: string;
  isOnline: boolean;
  onBack: () => void;
  onACEarned?: (amount: number) => void;
}

const DEMO_MESSAGES: Message[] = [
  { id: "1", text: "Hey! Did you see the new video I posted?", isSent: false, timestamp: "10:30 AM" },
  { id: "2", text: "Yes! It was amazing 🔥", isSent: true, timestamp: "10:32 AM" },
  { id: "3", text: "Thanks! I spent hours editing it", isSent: false, timestamp: "10:33 AM" },
  { id: "4", text: "The transitions were so smooth. Really loved the color grading too. What software did you use?", isSent: true, timestamp: "10:35 AM" },
  { id: "5", text: "Want to collab on something?", isSent: false, timestamp: "10:36 AM" },
];

const ConversationView = ({ chatId, chatName, isOnline, onBack, onACEarned }: ConversationViewProps) => {
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      isSent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage("");
    onACEarned?.(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-slide-in-right">
      {/* Header - Clean, flat */}
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

      {/* Messages - Panel-based, no bubbles */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "py-3 px-4 transition-opacity",
              message.isSent 
                ? "ml-8 bg-muted/15 rounded-lg" 
                : "mr-8"
            )}
          >
            <p className="text-sm leading-relaxed text-foreground">{message.text}</p>
            <p className="text-[10px] mt-1.5 text-muted-foreground">
              {message.timestamp}
              {message.isSent && <span className="ml-2">✓✓</span>}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar - Clean, flat */}
      <div className="px-4 py-3 border-t border-border/20 safe-area-bottom">
        <div className="flex items-center gap-2">
          {/* Media Buttons */}
          <button className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform">
            <Camera className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform">
            <Image className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>

          {/* Input */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/15">
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

          {/* Record / Send */}
          {newMessage.trim() ? (
            <button
              className="p-2.5 rounded-lg bg-foreground/10 text-foreground active:scale-95 transition-transform"
              onClick={handleSend}
            >
              <Send className="w-5 h-5" strokeWidth={1.5} />
            </button>
          ) : (
            <button
              className={cn(
                "p-2.5 rounded-lg active:scale-95 transition-transform",
                isRecording ? "bg-destructive/20 text-destructive" : "bg-muted/15 text-muted-foreground"
              )}
              onPointerDown={() => setIsRecording(true)}
              onPointerUp={() => setIsRecording(false)}
              onPointerLeave={() => setIsRecording(false)}
            >
              <Mic className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}
        </div>
        
        {/* Voice/Media info */}
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Voice up to 3 hours • Media up to 5GB
        </p>
      </div>
    </div>
  );
};

export default ConversationView;
