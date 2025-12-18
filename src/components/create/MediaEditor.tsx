import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  X, Check, Type, Palette, Sliders, RotateCcw, 
  Play, Pause, Volume2, VolumeX, Scissors
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaEditorProps {
  media: {
    file: File;
    type: "image" | "video";
    url: string;
  };
  onSave: (editedMedia: { url: string; type: "image" | "video"; filters: string; texts: TextOverlay[] }) => void;
  onClose: () => void;
}

interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: "sm" | "md" | "lg";
}

const FILTERS = [
  { id: "none", name: "Original", css: "" },
  { id: "grayscale", name: "B&W", css: "grayscale(100%)" },
  { id: "sepia", name: "Sepia", css: "sepia(100%)" },
  { id: "contrast", name: "Contrast", css: "contrast(130%)" },
  { id: "brightness", name: "Bright", css: "brightness(120%)" },
  { id: "saturate", name: "Vivid", css: "saturate(150%)" },
  { id: "hue", name: "Cool", css: "hue-rotate(180deg)" },
  { id: "vintage", name: "Vintage", css: "sepia(50%) contrast(95%) brightness(95%)" },
];

const TEXT_COLORS = ["#ffffff", "#000000", "#00e5ff", "#a855f7", "#ec4899", "#f59e0b", "#22c55e"];

const MediaEditor = ({ media, onSave, onClose }: MediaEditorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTab, setActiveTab] = useState<"filters" | "text" | "adjust">("filters");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showTextInput, setShowTextInput] = useState(false);
  const [newTextValue, setNewTextValue] = useState("");
  const [selectedTextColor, setSelectedTextColor] = useState("#ffffff");

  useEffect(() => {
    if (media.type === "video" && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [media.type]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const addTextOverlay = () => {
    if (!newTextValue.trim()) return;
    
    const newText: TextOverlay = {
      id: Date.now().toString(),
      text: newTextValue,
      x: 50,
      y: 50,
      color: selectedTextColor,
      size: "md",
    };
    
    setTextOverlays([...textOverlays, newText]);
    setNewTextValue("");
    setShowTextInput(false);
  };

  const removeTextOverlay = (id: string) => {
    setTextOverlays(textOverlays.filter((t) => t.id !== id));
  };

  const handleSave = () => {
    const filter = FILTERS.find((f) => f.id === selectedFilter);
    onSave({
      url: media.url,
      type: media.type,
      filters: filter?.css || "",
      texts: textOverlays,
    });
  };

  const currentFilter = FILTERS.find((f) => f.id === selectedFilter)?.css || "";

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        <span className="font-semibold text-foreground">Edit</span>
        <motion.button
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium"
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
        >
          Done
        </motion.button>
      </div>

      {/* Media Preview */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {media.type === "image" ? (
          <img
            src={media.url}
            alt="Edit preview"
            className="max-w-full max-h-full object-contain"
            style={{ filter: currentFilter }}
          />
        ) : (
          <video
            ref={videoRef}
            src={media.url}
            className="max-w-full max-h-full object-contain"
            style={{ filter: currentFilter }}
            loop
            muted={isMuted}
            playsInline
          />
        )}

        {/* Text Overlays */}
        {textOverlays.map((overlay) => (
          <motion.div
            key={overlay.id}
            className="absolute cursor-move"
            style={{
              left: `${overlay.x}%`,
              top: `${overlay.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            drag
            dragMomentum={false}
            whileTap={{ scale: 1.1 }}
            onClick={() => removeTextOverlay(overlay.id)}
          >
            <span
              className={cn(
                "font-bold drop-shadow-lg",
                overlay.size === "sm" && "text-lg",
                overlay.size === "md" && "text-2xl",
                overlay.size === "lg" && "text-4xl"
              )}
              style={{ color: overlay.color }}
            >
              {overlay.text}
            </span>
          </motion.div>
        ))}

        {/* Video Controls */}
        {media.type === "video" && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <motion.button
              className="p-2 rounded-full bg-background/50 backdrop-blur-sm"
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-foreground" />
              ) : (
                <Play className="w-5 h-5 text-foreground" />
              )}
            </motion.button>
            <motion.button
              className="p-2 rounded-full bg-background/50 backdrop-blur-sm"
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-foreground" />
              ) : (
                <Volume2 className="w-5 h-5 text-foreground" />
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* Text Input Modal */}
      {showTextInput && (
        <motion.div
          className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <input
            type="text"
            placeholder="Enter text..."
            value={newTextValue}
            onChange={(e) => setNewTextValue(e.target.value)}
            className="w-full max-w-sm px-4 py-3 rounded-xl bg-muted text-foreground text-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          
          {/* Color Picker */}
          <div className="flex items-center gap-3 mt-4">
            {TEXT_COLORS.map((color) => (
              <button
                key={color}
                className={cn(
                  "w-8 h-8 rounded-full border-2",
                  selectedTextColor === color ? "border-primary scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedTextColor(color)}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 mt-6">
            <motion.button
              className="px-6 py-2 rounded-full bg-muted text-foreground"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTextInput(false)}
            >
              Cancel
            </motion.button>
            <motion.button
              className="px-6 py-2 rounded-full bg-primary text-primary-foreground"
              whileTap={{ scale: 0.95 }}
              onClick={addTextOverlay}
            >
              Add Text
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Editor Tabs */}
      <div className="border-t border-border">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-border">
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeTab === "filters" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            )}
            onClick={() => setActiveTab("filters")}
          >
            <Palette className="w-4 h-4 mx-auto mb-1" />
            Filters
          </button>
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeTab === "text" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            )}
            onClick={() => setActiveTab("text")}
          >
            <Type className="w-4 h-4 mx-auto mb-1" />
            Text
          </button>
          <button
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors",
              activeTab === "adjust" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            )}
            onClick={() => setActiveTab("adjust")}
          >
            <Sliders className="w-4 h-4 mx-auto mb-1" />
            Adjust
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 safe-area-bottom">
          {activeTab === "filters" && (
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {FILTERS.map((filter) => (
                <motion.button
                  key={filter.id}
                  className={cn(
                    "shrink-0 flex flex-col items-center gap-2",
                    selectedFilter === filter.id && "opacity-100",
                    selectedFilter !== filter.id && "opacity-60"
                  )}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedFilter(filter.id)}
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-lg bg-muted overflow-hidden border-2",
                      selectedFilter === filter.id ? "border-primary" : "border-transparent"
                    )}
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt={filter.name}
                        className="w-full h-full object-cover"
                        style={{ filter: filter.css }}
                      />
                    ) : (
                      <div className="w-full h-full bg-muted" style={{ filter: filter.css }} />
                    )}
                  </div>
                  <span className="text-xs text-foreground">{filter.name}</span>
                </motion.button>
              ))}
            </div>
          )}

          {activeTab === "text" && (
            <motion.button
              className="w-full py-3 rounded-xl bg-muted flex items-center justify-center gap-2"
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTextInput(true)}
            >
              <Type className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Add Text</span>
            </motion.button>
          )}

          {activeTab === "adjust" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Brightness</span>
                <input type="range" className="w-40 accent-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contrast</span>
                <input type="range" className="w-40 accent-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Saturation</span>
                <input type="range" className="w-40 accent-primary" />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MediaEditor;
