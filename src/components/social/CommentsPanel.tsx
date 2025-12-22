import { useState, useRef, useEffect } from "react";
import { X, Send, Mic, Image } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  username: string;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

const DEMO_COMMENTS: Comment[] = [
  {
    id: "1",
    username: "creative_mind",
    text: "This is incredible! The attention to detail is amazing.",
    timeAgo: "2m",
    likes: 45,
    isLiked: false,
    replies: [
      { id: "1-1", username: "author", text: "Thank you so much!", timeAgo: "1m", likes: 12, isLiked: true },
    ],
  },
  {
    id: "2",
    username: "daily_explorer",
    text: "Where was this taken? I need to visit!",
    timeAgo: "5m",
    likes: 23,
    isLiked: true,
  },
  {
    id: "3",
    username: "photography_pro",
    text: "The lighting in this shot is perfect. What time of day did you capture this?",
    timeAgo: "12m",
    likes: 67,
    isLiked: false,
  },
];

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  onACEarned?: (amount: number) => void;
}

const CommentsPanel = ({ isOpen, onClose, contentId, onACEarned }: CommentsPanelProps) => {
  const [comments, setComments] = useState(DEMO_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const maxChars = 500;

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      username: "you",
      text: newComment,
      timeAgo: "now",
      likes: 0,
      isLiked: false,
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment("");
    onACEarned?.(2);
  };

  const toggleLike = (id: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        ref={panelRef}
        className="relative bg-card rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-in-right"
        style={{ animationName: 'none', transform: 'translateY(0)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
          <h3 className="font-medium text-foreground">Comments</h3>
          <button 
            className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {comments.map((comment) => (
            <div key={comment.id} className="py-3 border-b border-border/10 last:border-b-0">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-muted/30 text-foreground text-xs">
                    {comment.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">@{comment.username}</span>
                    <span className="text-[10px] text-muted-foreground">{comment.timeAgo}</span>
                  </div>
                  
                  <p className="text-sm text-foreground leading-relaxed">{comment.text}</p>
                  
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <button 
                      className={cn(
                        "text-xs active:scale-95 transition-all",
                        comment.isLiked && "text-red-500"
                      )}
                      onClick={() => toggleLike(comment.id)}
                    >
                      {comment.likes} likes
                    </button>
                    <button 
                      className="text-xs active:scale-95 transition-all"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                      Reply
                    </button>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 pl-4 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <Avatar className="w-6 h-6 shrink-0">
                            <AvatarFallback className="bg-muted/30 text-foreground text-[10px]">
                              {reply.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-foreground">@{reply.username}</span>
                              <span className="text-[10px] text-muted-foreground">{reply.timeAgo}</span>
                            </div>
                            <p className="text-xs text-foreground leading-relaxed">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border/20 safe-area-bottom">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform">
              <Image className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted/20 active:scale-95 transition-transform">
              <Mic className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </button>

            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/15">
              <input
                ref={inputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value.slice(0, maxChars))}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Add a comment..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <span className="text-[10px] text-muted-foreground shrink-0">
                {newComment.length}/{maxChars}
              </span>
            </div>

            <button
              className={cn(
                "p-2 rounded-lg active:scale-95 transition-transform",
                newComment.trim() ? "bg-foreground/10 text-foreground" : "bg-muted/10 text-muted-foreground"
              )}
              onClick={handleSubmit}
              disabled={!newComment.trim()}
            >
              <Send className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsPanel;
