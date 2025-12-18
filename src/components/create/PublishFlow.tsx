import { useState } from "react";
import { motion } from "framer-motion";
import { 
  X, ChevronDown, Globe, Users, Lock, 
  Sparkles, Play, Image as ImageIcon, Send
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PublishFlowProps {
  media: {
    url: string;
    type: "image" | "video";
    filters: string;
  };
  onPublish: (data: PublishData) => void;
  onClose: () => void;
}

interface PublishData {
  caption: string;
  destination: string[];
  visibility: "public" | "followers" | "private";
}

const DESTINATIONS = [
  { id: "stream", name: "Stream", icon: Play, description: "Video feed" },
  { id: "moments", name: "Moments", icon: ImageIcon, description: "Photo/video posts" },
  { id: "snap", name: "Snap Zone", icon: Sparkles, description: "24h stories" },
];

const VISIBILITY_OPTIONS = [
  { id: "public", name: "Everyone", icon: Globe, description: "Anyone can see" },
  { id: "followers", name: "Followers", icon: Users, description: "Only followers" },
  { id: "private", name: "Only Me", icon: Lock, description: "Private post" },
];

const PublishFlow = ({ media, onPublish, onClose }: PublishFlowProps) => {
  const [caption, setCaption] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(["moments"]);
  const [visibility, setVisibility] = useState<"public" | "followers" | "private">("public");
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const toggleDestination = (id: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    
    // Simulate publish delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    onPublish({
      caption,
      destination: selectedDestinations,
      visibility,
    });
  };

  const currentVisibility = VISIBILITY_OPTIONS.find((v) => v.id === visibility);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <motion.button
          className="p-2 rounded-full hover:bg-muted"
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
        >
          <X className="w-6 h-6 text-foreground" />
        </motion.button>
        <span className="font-semibold text-foreground">New Post</span>
        <motion.button
          className={cn(
            "px-4 py-2 rounded-full font-medium flex items-center gap-2",
            selectedDestinations.length > 0
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
          whileTap={{ scale: 0.95 }}
          onClick={handlePublish}
          disabled={selectedDestinations.length === 0 || isPublishing}
        >
          {isPublishing ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Post
            </>
          )}
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Media Preview & Caption */}
        <div className="p-4 flex gap-4">
          {/* Media Thumbnail */}
          <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden shrink-0">
            {media.type === "image" ? (
              <img
                src={media.url}
                alt="Post preview"
                className="w-full h-full object-cover"
                style={{ filter: media.filters }}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Caption Input */}
          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
            rows={4}
          />
        </div>

        {/* AC Earning Info */}
        <div className="mx-4 mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Earn AC from this post</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Get Attention Credits when others engage with your content
          </p>
        </div>

        {/* Destinations */}
        <div className="px-4 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Post to</h3>
          <div className="space-y-2">
            {DESTINATIONS.map((dest) => (
              <motion.button
                key={dest.id}
                className={cn(
                  "w-full p-3 rounded-xl flex items-center gap-3 transition-colors",
                  selectedDestinations.includes(dest.id)
                    ? "bg-primary/10 border border-primary/30"
                    : "glass-card"
                )}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleDestination(dest.id)}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    selectedDestinations.includes(dest.id) ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  <dest.icon
                    className={cn(
                      "w-5 h-5",
                      selectedDestinations.includes(dest.id)
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{dest.name}</p>
                  <p className="text-xs text-muted-foreground">{dest.description}</p>
                </div>
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    selectedDestinations.includes(dest.id)
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  )}
                >
                  {selectedDestinations.includes(dest.id) && (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-primary-foreground"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div className="px-4 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Who can see this</h3>
          <motion.button
            className="w-full p-3 rounded-xl glass-card flex items-center justify-between"
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowVisibilityPicker(!showVisibilityPicker)}
          >
            <div className="flex items-center gap-3">
              {currentVisibility && (
                <>
                  <div className="p-2 rounded-lg bg-muted">
                    <currentVisibility.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{currentVisibility.name}</p>
                    <p className="text-xs text-muted-foreground">{currentVisibility.description}</p>
                  </div>
                </>
              )}
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-muted-foreground transition-transform",
                showVisibilityPicker && "rotate-180"
              )}
            />
          </motion.button>

          {/* Visibility Options */}
          {showVisibilityPicker && (
            <motion.div
              className="mt-2 rounded-xl overflow-hidden border border-border"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              {VISIBILITY_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={cn(
                    "w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors",
                    visibility === option.id && "bg-muted"
                  )}
                  onClick={() => {
                    setVisibility(option.id as typeof visibility);
                    setShowVisibilityPicker(false);
                  }}
                >
                  <option.icon className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">{option.name}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PublishFlow;
