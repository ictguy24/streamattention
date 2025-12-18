import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  { id: "4", text: "The transitions were so smooth", isSent: true, timestamp: "10:35 AM" },
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
    onACEarned?.(1); // Earn AC for sending message
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-xl safe-area-top">
        <motion.button
          className="p-2 -ml-2 rounded-full hover:bg-muted/50"
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
        >
          <ChevronLeft className="w-6 h-6 text-foreground" />
        </motion.button>

        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
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
          <motion.button 
            className="p-2 rounded-full hover:bg-muted/50"
            whileTap={{ scale: 0.9 }}
          >
            <Phone className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          <motion.button 
            className="p-2 rounded-full hover:bg-muted/50"
            whileTap={{ scale: 0.9 }}
          >
            <Video className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          <motion.button 
            className="p-2 rounded-full hover:bg-muted/50"
            whileTap={{ scale: 0.9 }}
          >
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            className={cn(
              "flex",
              message.isSent ? "justify-end" : "justify-start"
            )}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.03 }}
          >
            <div
              className={cn(
                "max-w-[75%] px-4 py-2.5 rounded-2xl",
                message.isSent
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted rounded-bl-md"
              )}
            >
              <p className="text-sm">{message.text}</p>
              <p className={cn(
                "text-[10px] mt-1",
                message.isSent ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {message.timestamp}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="px-4 py-3 border-t border-border/50 bg-card/50 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center gap-2">
          {/* Media Buttons */}
          <motion.button
            className="p-2 rounded-full hover:bg-muted/50"
            whileTap={{ scale: 0.9 }}
          >
            <Camera className="w-5 h-5 text-muted-foreground" />
          </motion.button>
          <motion.button
            className="p-2 rounded-full hover:bg-muted/50"
            whileTap={{ scale: 0.9 }}
          >
            <Image className="w-5 h-5 text-muted-foreground" />
          </motion.button>

          {/* Input */}
          <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
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
            <motion.button
              className="p-2.5 rounded-full bg-primary text-primary-foreground"
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              className={cn(
                "p-2.5 rounded-full",
                isRecording ? "bg-destructive text-destructive-foreground" : "bg-muted/50"
              )}
              whileTap={{ scale: 0.9 }}
              onPointerDown={() => setIsRecording(true)}
              onPointerUp={() => setIsRecording(false)}
              onPointerLeave={() => setIsRecording(false)}
            >
              <Mic className={cn("w-5 h-5", isRecording ? "text-destructive-foreground" : "text-muted-foreground")} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ConversationView;
