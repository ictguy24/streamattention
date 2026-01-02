import { useState, useRef } from "react";
import { MoreHorizontal, Send, Mic, Image, Quote, Square } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { EnergyIcon, DiscussIcon, AmplifyIcon } from "./InteractionIcons";
import { useAttention } from "@/contexts/AttentionContext";

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
  quotedThread?: {
    username: string;
    content: string;
  };
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

const ThreadsMode = () => {
  const { sessionId, reportLike } = useAttention();
  const [threads, setThreads] = useState(DEMO_THREADS);
  const [newThread, setNewThread] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [quotingThread, setQuotingThread] = useState<Thread | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [attachedMedia, setAttachedMedia] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleLike = (id: string) => {
    const thread = threads.find(t => t.id === id);
    if (thread && !thread.isLiked && sessionId) {
      reportLike(sessionId, id);
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
    setThreads(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, isReposted: !t.isReposted, reposts: t.isReposted ? t.reposts - 1 : t.reposts + 1 }
          : t
      )
    );
  };

  const handlePost = () => {
    if (!newThread.trim() && !attachedMedia) return;
    
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
      quotedThread: quotingThread ? {
        username: quotingThread.username,
        content: quotingThread.content.slice(0, 100) + "..."
      } : undefined,
    };
    
    setThreads(prev => [thread, ...prev]);
    setNewThread("");
    setQuotingThread(null);
    setAttachedMedia(null);
  };

  const handleReply = (threadId: string) => {
    if (!replyText.trim()) return;
    setReplyingTo(null);
    setReplyText("");
  };

  const handleQuoteReply = (thread: Thread) => {
    setQuotingThread(thread);
    setReplyingTo(null);
  };

  const startAudioRecording = () => {
    setIsRecordingAudio(true);
    recordingIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopAudioRecording = () => {
    setIsRecordingAudio(false);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => setAttachedMedia(e.target.files?.[0] || null)}
      />

      {/* Compose Box */}
      <div className="px-4 mb-4">
        <div className="p-4 bg-muted/10 rounded-lg">
          <div className="flex gap-3">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarFallback className="bg-muted/30 text-foreground text-sm">U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {/* Quoted thread preview */}
              {quotingThread && (
                <div className="mb-3 p-2 bg-muted/10 rounded border-l-2 border-foreground/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">@{quotingThread.username}</span>
                    <button 
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setQuotingThread(null)}
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-xs text-foreground/70 line-clamp-2">{quotingThread.content}</p>
                </div>
              )}

              {/* Media preview */}
              {attachedMedia && (
                <div className="mb-3 p-2 bg-muted/10 rounded flex items-center justify-between">
                  <span className="text-xs text-foreground">{attachedMedia.name}</span>
                  <button 
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setAttachedMedia(null)}
                  >
                    ×
                  </button>
                </div>
              )}

              <textarea
                placeholder="What's on your mind?"
                value={newThread}
                onChange={(e) => setNewThread(e.target.value)}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-sm leading-relaxed"
                rows={2}
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/10">
                <div className="flex items-center gap-2">
                  <button
                    className="p-1.5 rounded hover:bg-muted/20 active:scale-95 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  </button>
                  <button
                    className={cn(
                      "p-1.5 rounded active:scale-95 transition-all",
                      isRecordingAudio ? "bg-destructive/20 text-destructive" : "hover:bg-muted/20"
                    )}
                    onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
                  >
                    {isRecordingAudio ? (
                      <Square className="w-4 h-4" fill="currentColor" />
                    ) : (
                      <Mic className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                    )}
                  </button>
                  {isRecordingAudio && (
                    <span className="text-xs text-destructive">{formatDuration(recordingDuration)}</span>
                  )}
                </div>
                <button
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors active:scale-95",
                    newThread.trim() || attachedMedia
                      ? "bg-foreground text-background" 
                      : "bg-muted/20 text-muted-foreground"
                  )}
                  onClick={handlePost}
                  disabled={!newThread.trim() && !attachedMedia}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Threads Feed */}
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

            {/* Quoted thread */}
            {thread.quotedThread && (
              <div className="ml-12 mb-2 p-2 bg-muted/10 rounded border-l-2 border-foreground/20">
                <span className="text-xs text-muted-foreground">@{thread.quotedThread.username}</span>
                <p className="text-xs text-foreground/70">{thread.quotedThread.content}</p>
              </div>
            )}

            {/* Content */}
            <p className="text-foreground text-sm leading-relaxed whitespace-pre-line mb-3 pl-12">
              {thread.content}
            </p>

            {/* Actions - Custom icons */}
            <div className="flex items-center gap-6 pl-12 text-muted-foreground">
              <button 
                className="flex items-center gap-1.5 hover:text-foreground active:scale-95 transition-all"
                onClick={() => setReplyingTo(replyingTo === thread.id ? null : thread.id)}
              >
                <DiscussIcon className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-xs">{thread.replies}</span>
              </button>

              <button
                className={cn(
                  "flex items-center gap-1.5 active:scale-95 transition-all",
                  thread.isReposted ? "text-green-500" : "hover:text-green-500"
                )}
                onClick={() => toggleRepost(thread.id)}
              >
                <AmplifyIcon className="w-4 h-4" isActive={thread.isReposted} strokeWidth={1.5} />
                <span className="text-xs">{thread.reposts}</span>
              </button>

              <button
                className={cn(
                  "flex items-center gap-1.5 active:scale-95 transition-all",
                  thread.isLiked ? "text-amber-500" : "hover:text-amber-500"
                )}
                onClick={() => toggleLike(thread.id)}
              >
                <EnergyIcon className="w-4 h-4" isActive={thread.isLiked} strokeWidth={1.5} />
                <span className="text-xs">{thread.likes}</span>
              </button>

              <button 
                className="flex items-center gap-1.5 hover:text-foreground active:scale-95 transition-all"
                onClick={() => handleQuoteReply(thread)}
              >
                <Quote className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Reply input */}
            {replyingTo === thread.id && (
              <div className="mt-3 pl-12">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to @${thread.username}...`}
                    className="flex-1 px-3 py-2 rounded-lg bg-muted/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    autoFocus
                  />
                  <button
                    className="p-1.5 rounded hover:bg-muted/20 active:scale-95 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Image className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-muted/20 active:scale-95 transition-all"
                    onClick={startAudioRecording}
                  >
                    <Mic className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  </button>
                  <button
                    className="p-2 rounded-lg bg-foreground text-background active:scale-95 transition-transform"
                    onClick={() => handleReply(thread.id)}
                  >
                    <Send className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreadsMode;
