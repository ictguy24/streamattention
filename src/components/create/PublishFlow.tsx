import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, ChevronDown, Globe, Users, Lock, Sparkles, Play, Image as ImageIcon, Send, Hash, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublishFlowProps {
  media: { url: string; type: "image" | "video"; filters: string };
  onPublish: (data: PublishData) => void;
  onClose: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

interface PublishData {
  caption: string;
  destination: string[];
  visibility: "public" | "followers" | "private";
  hashtags: string[];
  coverImageFile?: File;
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

const PublishFlow = ({ media, onPublish, onClose, isUploading = false, uploadProgress = 0 }: PublishFlowProps) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(["moments"]);
  const [visibility, setVisibility] = useState<"public" | "followers" | "private">("public");
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<{ file: File; url: string } | null>(null);

  const toggleDestination = (id: string) => {
    setSelectedDestinations((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  const addHashtag = () => {
    const tag = hashtagInput.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    if (tag && !hashtags.includes(tag) && hashtags.length < 10) {
      setHashtags([...hashtags, tag]);
      setHashtagInput("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage({ file, url: URL.createObjectURL(file) });
    }
  };

  const handlePublish = () => {
    onPublish({ caption, destination: selectedDestinations, visibility, hashtags, coverImageFile: coverImage?.file });
  };

  const currentVisibility = VISIBILITY_OPTIONS.find((v) => v.id === visibility);

  return (
    <motion.div className="fixed inset-0 z-50 bg-background flex flex-col" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <motion.button className="p-2 rounded-full hover:bg-muted" whileTap={{ scale: 0.9 }} onClick={onClose}>
          <X className="w-6 h-6 text-foreground" />
        </motion.button>
        <span className="font-semibold text-foreground">New Post</span>
        <motion.button
          className={cn("px-4 py-2 rounded-full font-medium flex items-center gap-2", selectedDestinations.length > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
          whileTap={{ scale: 0.95 }}
          onClick={handlePublish}
          disabled={selectedDestinations.length === 0 || isUploading}
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              {uploadProgress}%
            </>
          ) : (
            <><Send className="w-4 h-4" />Post</>
          )}
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex gap-4">
          <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden shrink-0 relative">
            {coverImage ? (
              <img src={coverImage.url} alt="Cover" className="w-full h-full object-cover" />
            ) : media.type === "image" ? (
              <img src={media.url} alt="Post preview" className="w-full h-full object-cover" style={{ filter: media.filters }} />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <button onClick={() => coverInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Upload className="w-5 h-5 text-white" />
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
          </div>
          <textarea placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none" rows={4} />
        </div>

        {/* Hashtags */}
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Hashtags</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {hashtags.map(tag => (
              <span key={tag} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs flex items-center gap-1">
                #{tag}
                <button onClick={() => removeHashtag(tag)} className="ml-1 text-primary/70 hover:text-primary">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
              placeholder="Add hashtag..."
              className="flex-1 px-3 py-2 rounded-lg bg-muted text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button onClick={addHashtag} className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">Add</button>
          </div>
        </div>

        <div className="mx-4 mb-4 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Earn AC from this post</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Get Attention Credits when others engage with your content</p>
        </div>

        <div className="px-4 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Post to</h3>
          <div className="space-y-2">
            {DESTINATIONS.map((dest) => (
              <motion.button key={dest.id} className={cn("w-full p-3 rounded-xl flex items-center gap-3 transition-colors", selectedDestinations.includes(dest.id) ? "bg-primary/10 border border-primary/30" : "glass-card")} whileTap={{ scale: 0.98 }} onClick={() => toggleDestination(dest.id)}>
                <div className={cn("p-2 rounded-lg", selectedDestinations.includes(dest.id) ? "bg-primary/20" : "bg-muted")}>
                  <dest.icon className={cn("w-5 h-5", selectedDestinations.includes(dest.id) ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{dest.name}</p>
                  <p className="text-xs text-muted-foreground">{dest.description}</p>
                </div>
                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", selectedDestinations.includes(dest.id) ? "border-primary bg-primary" : "border-muted-foreground")}>
                  {selectedDestinations.includes(dest.id) && <motion.div className="w-2 h-2 rounded-full bg-primary-foreground" initial={{ scale: 0 }} animate={{ scale: 1 }} />}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="px-4 mb-4">
          <h3 className="font-semibold text-foreground mb-3">Who can see this</h3>
          <motion.button className="w-full p-3 rounded-xl glass-card flex items-center justify-between" whileTap={{ scale: 0.98 }} onClick={() => setShowVisibilityPicker(!showVisibilityPicker)}>
            <div className="flex items-center gap-3">
              {currentVisibility && (
                <>
                  <div className="p-2 rounded-lg bg-muted"><currentVisibility.icon className="w-5 h-5 text-muted-foreground" /></div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{currentVisibility.name}</p>
                    <p className="text-xs text-muted-foreground">{currentVisibility.description}</p>
                  </div>
                </>
              )}
            </div>
            <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", showVisibilityPicker && "rotate-180")} />
          </motion.button>

          {showVisibilityPicker && (
            <motion.div className="mt-2 rounded-xl overflow-hidden border border-border" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              {VISIBILITY_OPTIONS.map((option) => (
                <button key={option.id} className={cn("w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors", visibility === option.id && "bg-muted")} onClick={() => { setVisibility(option.id as typeof visibility); setShowVisibilityPicker(false); }}>
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
