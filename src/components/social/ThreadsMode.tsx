import { useState } from "react";
import { Heart, MessageCircle, Repeat2, Share2, MoreHorizontal, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Thread {
  id: string;
  username: string;
  displayName: string;
  content: string;
  likes: number;
  replies: number;
  reposts: number;
  timeAgo: string;
  isLiked: boolean;
  isReposted: boolean;
}

const DEMO_THREADS: Thread[] = [
  {
    id: "1",
    username: "thought_leader",
    displayName: "Marcus Chen",
    content: "The attention economy is shifting. Instead of fighting for your attention, what if platforms rewarded you for it?\n\nThis is why I'm bullish on AC (Attention Credits). Your time has value.",
    likes: 1245,
    replies: 89,
    reposts: 234,
    timeAgo: "1h",
    isLiked: false,
    isReposted: false,
  },
  {
    id: "2",
    username: "creator_vibes",
    displayName: "Luna Stars",
    content: "Just hit 10K AC this week!\n\nHere's what I learned:\n• Consistency > Virality\n• Engage with your community\n• Quality content compounds",
    likes: 892,
    replies: 156,
    reposts: 445,
    timeAgo: "3h",
    isLiked: true,
    isReposted: false,
  },
  {
    id: "3",
    username: "tech_insights",
    displayName: "Dev Patel",
    content: "Hot take: The future of social media isn't about followers.\n\nIt's about attention quality, not quantity.\n\nAgree or disagree?",
    likes: 2340,
    replies: 312,
    reposts: 567,
    timeAgo: "5h",
    isLiked: false,
    isReposted: true,
  },
];

interface ThreadsModeProps {
  onACEarned?: (amount: number) => void;
}

const ThreadsMode = ({ onACEarned }: ThreadsModeProps) => {
  const [threads, setThreads] = useState(DEMO_THREADS);
  const [newThread, setNewThread] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const toggleLike = (id: string) => {
    const thread = threads.find(t => t.id === id);
    if (thread && !thread.isLiked) {
      onACEarned?.(1);
    }
    setThreads(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, isLiked: !t.isLiked, likes: t.isLiked ? t.likes - 1 : t.likes + 1 }
          : t
      )
    );
  };

  const toggleRepost = (id: string) => {
    const thread = threads.find(t => t.id === id);
    if (thread && !thread.isReposted) {
      onACEarned?.(2);
    }
    setThreads(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, isReposted: !t.isReposted, reposts: t.isReposted ? t.reposts - 1 : t.reposts + 1 }
          : t
      )
    );
  };

  const handlePost = () => {
    if (!newThread.trim()) return;
    
    const thread: Thread = {
      id: Date.now().toString(),
      username: "you",
      displayName: "You",
      content: newThread,
      likes: 0,
      replies: 0,
      reposts: 0,
      timeAgo: "now",
      isLiked: false,
      isReposted: false,
    };
    
    setThreads(prev => [thread, ...prev]);
    setNewThread("");
    onACEarned?.(5);
  };

  const handleReply = (threadId: string) => {
    if (!replyText.trim()) return;
    onACEarned?.(3);
    setReplyingTo(null);
    setReplyText("");
  };

  return (
    <div className="flex flex-col">
      {/* Compose Box - Flat panel */}
      <div className="px-4 mb-4">
        <div className="p-4 bg-muted/10 rounded-lg">
          <div className="flex gap-3">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarFallback className="bg-muted/30 text-foreground text-sm">U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <textarea
                placeholder="What's on your mind?"
                value={newThread}
                onChange={(e) => setNewThread(e.target.value)}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm leading-relaxed"
                rows={2}
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/10">
                <span className="text-xs text-muted-foreground">
                  Posts earn +5 AC
                </span>
                <button
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors active:scale-95",
                    newThread.trim() 
                      ? "bg-foreground/10 text-foreground" 
                      : "bg-muted/20 text-muted-foreground"
                  )}
                  onClick={handlePost}
                  disabled={!newThread.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Threads Feed - Spacing-based hierarchy */}
      <div className="flex flex-col">
        {threads.map((thread) => (
          <div
            key={thread.id}
            className="px-4 py-4 border-b border-border/10"
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-2">
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarFallback className="bg-muted/30 text-foreground text-sm">
                  {thread.displayName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-medium text-foreground">{thread.displayName}</span>
                  <span className="text-muted-foreground">@{thread.username}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{thread.timeAgo}</span>
                </div>
              </div>

              <button className="p-1 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform shrink-0">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </button>
            </div>

            {/* Content - Text first, comfortable reading */}
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-line mb-3 pl-12">
              {thread.content}
            </p>

            {/* Actions - Thin icons, no backgrounds */}
            <div className="flex items-center gap-6 pl-12 text-muted-foreground">
              <button 
                className="flex items-center gap-1.5 hover:text-foreground active:scale-95 transition-all"
                onClick={() => setReplyingTo(replyingTo === thread.id ? null : thread.id)}
              >
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-xs">{thread.replies}</span>
              </button>

              <button
                className={cn(
                  "flex items-center gap-1.5 active:scale-95 transition-all",
                  thread.isReposted ? "text-green-500" : "hover:text-green-500"
                )}
                onClick={() => toggleRepost(thread.id)}
              >
                <Repeat2 className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-xs">{thread.reposts}</span>
              </button>

              <button
                className={cn(
                  "flex items-center gap-1.5 active:scale-95 transition-all",
                  thread.isLiked ? "text-red-500" : "hover:text-red-500"
                )}
                onClick={() => toggleLike(thread.id)}
              >
                <Heart className={cn("w-4 h-4", thread.isLiked && "fill-current")} strokeWidth={1.5} />
                <span className="text-xs">{thread.likes}</span>
              </button>

              <button className="flex items-center gap-1.5 hover:text-foreground active:scale-95 transition-all">
                <Share2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Reply input - Inline expansion */}
            {replyingTo === thread.id && (
              <div className="mt-3 pl-12 flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to @${thread.username}...`}
                  className="flex-1 px-3 py-2 rounded-lg bg-muted/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  autoFocus
                />
                <button
                  className="p-2 rounded-lg bg-foreground/10 text-foreground active:scale-95 transition-transform"
                  onClick={() => handleReply(thread.id)}
                >
                  <Send className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreadsMode;
