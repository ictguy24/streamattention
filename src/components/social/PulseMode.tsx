import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Repeat2, Share2, MoreHorizontal, Sparkles, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Pulse {
  id: string;
  username: string;
  displayName: string;
  content: string;
  likes: number;
  replies: number;
  repulses: number;
  timeAgo: string;
  isLiked: boolean;
  isRepulsed: boolean;
  acEarned?: number;
}

const DEMO_PULSES: Pulse[] = [
  {
    id: "1",
    username: "thought_leader",
    displayName: "Marcus Chen",
    content: "The attention economy is shifting. Instead of fighting for your attention, what if platforms rewarded you for it? 🧠\n\nThis is why I'm bullish on AC (Attention Credits). Your time has value.",
    likes: 1245,
    replies: 89,
    repulses: 234,
    timeAgo: "1h",
    isLiked: false,
    isRepulsed: false,
    acEarned: 50,
  },
  {
    id: "2",
    username: "creator_vibes",
    displayName: "Luna Stars",
    content: "Just hit 10K AC this week! 🎉\n\nHere's what I learned:\n• Consistency > Virality\n• Engage with your community\n• Quality content compounds",
    likes: 892,
    replies: 156,
    repulses: 445,
    timeAgo: "3h",
    isLiked: true,
    isRepulsed: false,
  },
  {
    id: "3",
    username: "tech_insights",
    displayName: "Dev Patel",
    content: "Hot take: The future of social media isn't about followers.\n\nIt's about attention quality, not quantity.\n\nAgree or disagree? 🤔",
    likes: 2340,
    replies: 312,
    repulses: 567,
    timeAgo: "5h",
    isLiked: false,
    isRepulsed: true,
  },
];

interface PulseModeProps {
  onACEarned?: (amount: number) => void;
}

const PulseMode = ({ onACEarned }: PulseModeProps) => {
  const [pulses, setPulses] = useState(DEMO_PULSES);
  const [newPulse, setNewPulse] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showACFly, setShowACFly] = useState<string | null>(null);

  const toggleLike = (id: string) => {
    const pulse = pulses.find(p => p.id === id);
    if (pulse && !pulse.isLiked) {
      onACEarned?.(1);
      setShowACFly(id);
      setTimeout(() => setShowACFly(null), 800);
    }
    setPulses(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const toggleRepulse = (id: string) => {
    const pulse = pulses.find(p => p.id === id);
    if (pulse && !pulse.isRepulsed) {
      onACEarned?.(2);
    }
    setPulses(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, isRepulsed: !p.isRepulsed, repulses: p.isRepulsed ? p.repulses - 1 : p.repulses + 1 }
          : p
      )
    );
  };

  const handlePost = () => {
    if (!newPulse.trim()) return;
    
    const pulse: Pulse = {
      id: Date.now().toString(),
      username: "you",
      displayName: "You",
      content: newPulse,
      likes: 0,
      replies: 0,
      repulses: 0,
      timeAgo: "now",
      isLiked: false,
      isRepulsed: false,
    };
    
    setPulses(prev => [pulse, ...prev]);
    setNewPulse("");
    onACEarned?.(5); // Earn AC for posting
  };

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Compose Box */}
      <div className="px-4 mb-4">
        <div className="rounded-xl p-4 bg-card/30">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/20 text-primary">U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                placeholder="What's on your mind?"
                value={newPulse}
                onChange={(e) => setNewPulse(e.target.value)}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm"
                rows={2}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Posts earn +5 AC</span>
                </div>
                <motion.button
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    newPulse.trim() 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePost}
                  disabled={!newPulse.trim()}
                >
                  Pulse
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pulses Feed */}
      <div className="flex flex-col">
        {pulses.map((pulse, index) => (
          <motion.div
            key={pulse.id}
            className="px-4 py-4 border-b border-border/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {pulse.displayName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-medium text-foreground truncate">{pulse.displayName}</span>
                    <span className="text-muted-foreground text-sm">@{pulse.username}</span>
                    <span className="text-muted-foreground text-sm">·</span>
                    <span className="text-muted-foreground text-sm">{pulse.timeAgo}</span>
                  </div>
                  <button className="p-1 rounded-full hover:bg-muted/50 shrink-0">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Text */}
                <p className="text-foreground text-sm whitespace-pre-line mb-3">{pulse.content}</p>

                {/* AC Earned Badge */}
                {pulse.acEarned && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 mb-3">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary font-medium">+{pulse.acEarned} AC</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between max-w-xs">
                  <motion.button 
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setReplyingTo(pulse.id)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{pulse.replies}</span>
                  </motion.button>

                  <motion.button
                    className={cn(
                      "flex items-center gap-1 transition-colors relative",
                      pulse.isRepulsed ? "text-green-500" : "text-muted-foreground hover:text-green-500"
                    )}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleRepulse(pulse.id)}
                  >
                    <Repeat2 className="w-4 h-4" />
                    <span className="text-xs">{pulse.repulses}</span>
                  </motion.button>

                  <motion.button
                    className={cn(
                      "flex items-center gap-1 transition-colors relative",
                      pulse.isLiked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                    )}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleLike(pulse.id)}
                  >
                    <Heart className={cn("w-4 h-4", pulse.isLiked && "fill-current")} />
                    <span className="text-xs">{pulse.likes}</span>
                    
                    {showACFly === pulse.id && (
                      <motion.span
                        className="absolute -top-4 left-0 text-xs text-primary font-medium"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        +1 AC
                      </motion.span>
                    )}
                  </motion.button>

                  <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Reply input */}
                {replyingTo === pulse.id && (
                  <motion.div 
                    className="mt-3 flex items-center gap-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <input
                      type="text"
                      placeholder={`Reply to @${pulse.username}...`}
                      className="flex-1 px-3 py-2 rounded-full bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      autoFocus
                    />
                    <motion.button
                      className="p-2 rounded-full bg-primary text-primary-foreground"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        onACEarned?.(3);
                        setReplyingTo(null);
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PulseMode;
