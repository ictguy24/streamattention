import { useState, useRef, useEffect } from "react";
import { X, Send, Mic, Image, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useComments } from "@/hooks/useComments";
import { formatDistanceToNow } from "date-fns";

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  onACEarned?: (amount: number) => void;
}

const CommentsPanel = ({ isOpen, onClose, contentId, onACEarned }: CommentsPanelProps) => {
  const { comments, isLoading, addComment, isAddingComment } = useComments(isOpen ? contentId : null);
  const [newComment, setNewComment] = useState("");
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const maxChars = 500;

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment(newComment);
      setNewComment("");
      onACEarned?.(2);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const toggleLike = (id: string) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false });
    } catch {
      return "now";
    }
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No comments yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isLiked = likedComments.has(comment.id);
              return (
                <div key={comment.id} className="py-3 border-b border-border/10 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={comment.avatar_url} />
                      <AvatarFallback className="bg-muted/30 text-foreground text-xs">
                        {(comment.username || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">@{comment.username || 'user'}</span>
                        <span className="text-[10px] text-muted-foreground">{formatTimeAgo(comment.created_at)}</span>
                      </div>
                      
                      <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                        <button 
                          className={cn(
                            "text-xs active:scale-95 transition-all",
                            isLiked && "text-red-500"
                          )}
                          onClick={() => toggleLike(comment.id)}
                        >
                          {isLiked ? '1 like' : 'Like'}
                        </button>
                        <button className="text-xs active:scale-95 transition-all">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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
              disabled={!newComment.trim() || isAddingComment}
            >
              {isAddingComment ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsPanel;
