import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Interest {
  id: string;
  label: string;
  emoji: string;
}

const INTERESTS: Interest[] = [
  { id: "entertainment", label: "Entertainment", emoji: "🎬" },
  { id: "comedy", label: "Comedy", emoji: "😂" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "education", label: "Education", emoji: "📚" },
  { id: "tech", label: "Tech", emoji: "💻" },
  { id: "fitness", label: "Fitness", emoji: "💪" },
  { id: "food", label: "Food & Cooking", emoji: "🍕" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "fashion", label: "Fashion", emoji: "👗" },
  { id: "art", label: "Art & Design", emoji: "🎨" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "pets", label: "Pets & Animals", emoji: "🐕" },
  { id: "diy", label: "DIY & Crafts", emoji: "🔧" },
  { id: "news", label: "News & Politics", emoji: "📰" },
];

interface InterestSurveyProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (interests: string[]) => void;
}

const InterestSurvey = ({ isOpen, onClose, onComplete }: InterestSurveyProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleComplete = () => {
    onComplete(selectedInterests);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background flex flex-col"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 safe-area-top">
            <motion.button
              className="p-2 rounded-full hover:bg-muted/50"
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </motion.button>
            <motion.button
              className="text-sm text-muted-foreground"
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
            >
              Skip
            </motion.button>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                What interests you?
              </h1>
              <p className="text-muted-foreground text-sm">
                Select topics to personalize your feed. You can change these anytime.
              </p>
            </motion.div>

            {/* Interests Grid */}
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map((interest, index) => (
                <motion.button
                  key={interest.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                    selectedInterests.includes(interest.id)
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/30 border-border/50 hover:border-border"
                  )}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleInterest(interest.id)}
                >
                  <span className="text-2xl">{interest.emoji}</span>
                  <span className={cn(
                    "text-sm font-medium",
                    selectedInterests.includes(interest.id)
                      ? "text-primary"
                      : "text-foreground"
                  )}>
                    {interest.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/50 safe-area-bottom">
            <motion.button
              className={cn(
                "w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                selectedInterests.length > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
            >
              {selectedInterests.length > 0 ? (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </>
              ) : (
                "Select at least one interest"
              )}
            </motion.button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              {selectedInterests.length} selected
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InterestSurvey;
