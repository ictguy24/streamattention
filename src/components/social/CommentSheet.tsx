import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Send, Heart, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  username: string;
  text: string;
  timeAgo: string;
  likes: number;
  isLiked: boolean;
  acEarned?: number;
}

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  onACEarned?: (amount: number) => void;
}

const DEMO_COMMENTS: Comment[] = [
  { id: "1", username: "alex_r", text: "This is incredible! 🔥", timeAgo: "2m", likes: 234, isLiked: false },
  { id: "2", username: "sarah_c", text: "How did you do this?? Need a tutorial!", timeAgo: "5m", likes: 89, isLiked: true, acEarned: 5 },
  { id: "3", username: "mike_j", text: "Absolutely love the editing 👏", timeAgo: "12m", likes: 156, isLiked: false },
  { id: "4", username: "emma_w", text: "Sharing this with everyone!", timeAgo: "18m", likes: 67, isLiked: false },
  { id: "5", username: "david_k", text: "The attention to detail is insane", timeAgo: "25m", likes: 445, isLiked: false, acEarned: 12 },
];

const CommentSheet = ({ isOpen, onClose, videoId, onACEarned }: CommentSheetProps) => {
  const [comments, setComments] = useState(DEMO_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [showACBurst, setShowACBurst] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 200) {
      onClose();
    }
  };

  const toggleLike = (commentId: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
          : c
      )
    );
    // Earn AC for liking
    if (!comments.find(c => c.id === commentId)?.isLiked) {
      onACEarned?.(1);
      setShowACBurst(commentId);
      setTimeout(() => setShowACBurst(null), 800);
    }
  };

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
    
    // Earn AC for commenting
    onACEarned?.(3);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

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
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[70vh] flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
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
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              <AnimatePresence mode="popLayout">
                {comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                    layout
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="bg-secondary/50 text-secondary-foreground text-xs">
                        {comment.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">@{comment.username}</span>
                        <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>
                        {comment.acEarned && (
                          <span className="flex items-center gap-0.5 text-xs text-primary">
                            <Sparkles className="w-3 h-3" />
                            +{comment.acEarned}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground/90 mt-0.5">{comment.text}</p>
                    </div>

                    <motion.button
                      className="relative flex flex-col items-center shrink-0"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLike(comment.id)}
                    >
                      <Heart
                        className={cn(
                          "w-4 h-4",
                          comment.isLiked ? "text-destructive fill-destructive" : "text-muted-foreground"
                        )}
                      />
                      <span className="text-xs text-muted-foreground">{comment.likes}</span>
                      
                      {/* AC Burst */}
                      <AnimatePresence>
                        {showACBurst === comment.id && (
                          <motion.div
                            className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-primary text-xs whitespace-nowrap"
                            initial={{ opacity: 0, y: 10, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <Sparkles className="w-3 h-3" />
                            +1
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">U</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <motion.button
                    className={cn(
                      "p-1.5 rounded-full transition-colors",
                      newComment.trim() ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                    )}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSubmit}
                    disabled={!newComment.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                <Sparkles className="w-3 h-3 inline mr-1" />
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
