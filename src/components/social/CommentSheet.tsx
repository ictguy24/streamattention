import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Send, Heart, Reply, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  onACEarned?: (amount: number) => void;
}

const CommentSheet = ({ isOpen, onClose, videoId, onACEarned }: CommentSheetProps) => {
  const { user, profile } = useAuth();
  const { comments, isLoading, addComment, isAddingComment } = useComments(isOpen ? videoId : null);
  const [newComment, setNewComment] = useState("");
  const [showACBurst, setShowACBurst] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const charCount = newComment.length;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 200) {
      onClose();
    }
    if (info.velocity.y < -300 || info.offset.y < -100) {
      setIsExpanded(true);
    }
  };

  const handleHorizontalSwipe = (_: any, info: PanInfo) => {
    if (info.velocity.x < -500 || info.offset.x < -150) {
      onClose();
    }
  };

  const toggleLike = (commentId: string) => {
    const isCurrentlyLiked = likedComments.has(commentId);
    const newLiked = new Set(likedComments);
    
    if (isCurrentlyLiked) {
      newLiked.delete(commentId);
    } else {
      newLiked.add(commentId);
      onACEarned?.(1);
      setShowACBurst(commentId);
      setTimeout(() => setShowACBurst(null), 800);
    }
    
    setLikedComments(newLiked);
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;
    
    try {
      await addComment(newComment, replyingTo || undefined);
      setNewComment("");
      setReplyingTo(null);
      onACEarned?.(3);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl flex flex-col",
              isExpanded ? "h-[90vh]" : "max-h-[70vh]"
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Handle + Expand/Collapse */}
            <div className="flex flex-col items-center py-3">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-2" />
              <motion.button
                className="p-1"
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                )}
              </motion.button>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-border/50">
              <h3 className="font-semibold text-foreground">{comments.length} Comments</h3>
              <motion.button
                className="p-2 rounded-full hover:bg-muted/50"
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Comments List */}
            <motion.div 
              className="flex-1 overflow-y-auto px-4 py-3 space-y-4"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={handleHorizontalSwipe}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-sm">No comments yet</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">Be the first to comment!</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.03 }}
                      layout
                    >
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage src={comment.avatar_url} />
                          <AvatarFallback className="bg-secondary/50 text-secondary-foreground text-xs">
                            {(comment.username || "U")[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">@{comment.username}</span>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.created_at)}</span>
                          </div>
                          <p className="text-sm text-foreground/90 mt-0.5">{comment.content}</p>
                          
                          <motion.button
                            className="flex items-center gap-1 mt-1 text-xs text-muted-foreground hover:text-foreground"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setReplyingTo(comment.id)}
                          >
                            <Reply className="w-3 h-3" />
                            Reply
                          </motion.button>
                        </div>

                        <motion.button
                          className="relative flex flex-col items-center shrink-0"
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleLike(comment.id)}
                        >
                          <Heart
                            className={cn(
                              "w-4 h-4",
                              likedComments.has(comment.id) ? "text-destructive fill-destructive" : "text-muted-foreground"
                            )}
                          />
                          <span className="text-xs text-muted-foreground">
                            {likedComments.has(comment.id) ? 1 : 0}
                          </span>
                          
                          <AnimatePresence>
                            {showACBurst === comment.id && (
                              <motion.div
                                className="absolute -top-4 left-1/2 -translate-x-1/2 text-primary text-xs whitespace-nowrap font-medium"
                                initial={{ opacity: 0, y: 10, scale: 0.5 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10 }}
                              >
                                +1 AC
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </motion.div>

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-card safe-area-bottom">
              {replyingTo && (
                <div className="flex items-center justify-between mb-2 px-2">
                  <span className="text-xs text-muted-foreground">
                    Replying to @{comments.find(c => c.id === replyingTo)?.username}
                  </span>
                  <button 
                    className="text-xs text-primary"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {(profile?.username || user?.email || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder={user ? "Add a comment..." : "Sign in to comment"}
                    disabled={!user || isAddingComment}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                  />
                  {charCount > 0 && (
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {charCount}
                    </span>
                  )}
                  <motion.button
                    className={cn(
                      "p-1.5 rounded-full transition-colors",
                      newComment.trim() && user ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || !user || isAddingComment}
                  >
                    {isAddingComment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </motion.button>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Comments earn +3 AC
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentSheet;