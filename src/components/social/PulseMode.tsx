import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Repeat2, Share2, MoreHorizontal, Sparkles } from "lucide-react";
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
  replyTo?: string;
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
    content: "Just hit 10K AC this week! 🎉\n\nHere's what I learned:\n• Consistency > Virality\n• Engage with your community\n• Quality content compounds\n\nDrop your AC tips below 👇",
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
  {
    id: "4",
    username: "daily_thoughts",
    displayName: "Ava Martinez",
    content: "Woke up feeling grateful today ✨\n\nSmall wins count. Celebrate them.",
    likes: 456,
    replies: 23,
    repulses: 78,
    timeAgo: "8h",
    isLiked: false,
    isRepulsed: false,
  },
];

const PulseMode = () => {
  const [pulses, setPulses] = useState(DEMO_PULSES);

  const toggleLike = (id: string) => {
    setPulses(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const toggleRepulse = (id: string) => {
    setPulses(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, isRepulsed: !p.isRepulsed, repulses: p.isRepulsed ? p.repulses - 1 : p.repulses + 1 }
          : p
      )
    );
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
        <div className="glass-card rounded-xl p-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/20 text-primary">U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                placeholder="What's on your mind?"
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm"
                rows={2}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Earn AC from engagement</span>
                </div>
                <motion.button
                  className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
            className="px-4 py-4 border-b border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex gap-3">
              {/* Avatar */}
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {pulse.displayName[0]}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
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
                    <span className="text-xs text-primary font-medium">+{pulse.acEarned} AC earned</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between max-w-xs">
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{pulse.replies}</span>
                  </button>

                  <motion.button
                    className={cn(
                      "flex items-center gap-1 transition-colors",
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
                      "flex items-center gap-1 transition-colors",
                      pulse.isLiked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                    )}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleLike(pulse.id)}
                  >
                    <Heart className={cn("w-4 h-4", pulse.isLiked && "fill-current")} />
                    <span className="text-xs">{pulse.likes}</span>
                  </motion.button>

                  <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PulseMode;
