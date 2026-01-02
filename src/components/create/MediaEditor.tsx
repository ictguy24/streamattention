import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Type, Palette, Sliders, Music,
  Play, Pause, Volume2, VolumeX, Upload, Library
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMusicLibrary } from "@/hooks/usePosts";

interface MediaEditorProps {
  media: {
    file: File | null;
    blob: Blob | null;
    type: "image" | "video";
    url: string;
  };
  onSave: (editedMedia: EditedMediaOutput) => void;
  onClose: () => void;
}

export interface EditedMediaOutput {
  url: string;
  type: "image" | "video";
  filters: string;
  texts: TextOverlay[];
  musicFile?: File;
  musicLibraryId?: string;
  musicVolume: number;
  originalVolume: number;
  musicTitle?: string;
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
  const musicRef = useRef<HTMLAudioElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<"filters" | "text" | "music" | "adjust">("filters");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showTextInput, setShowTextInput] = useState(false);
  const [newTextValue, setNewTextValue] = useState("");
  const [selectedTextColor, setSelectedTextColor] = useState("#ffffff");
  
  // Music state
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicLibraryId, setMusicLibraryId] = useState<string | null>(null);
  const [musicTitle, setMusicTitle] = useState<string | null>(null);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [originalVolume, setOriginalVolume] = useState(1.0);
  const [musicPreviewUrl, setMusicPreviewUrl] = useState<string | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  
  const { tracks: libraryTracks, isLoading: loadingLibrary } = useMusicLibrary();

  useEffect(() => {
    if (media.type === "video" && videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [media.type]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = originalVolume;
    }
  }, [originalVolume]);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  // Sync music with video
  useEffect(() => {
    if (musicRef.current && videoRef.current && isPlaying && musicPreviewUrl) {
      musicRef.current.play().catch(() => {});
    } else if (musicRef.current) {
      musicRef.current.pause();
    }
  }, [isPlaying, musicPreviewUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        musicRef.current?.pause();
      } else {
        videoRef.current.play();
        musicRef.current?.play().catch(() => {});
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

  const handleMusicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMusicFile(file);
      setMusicLibraryId(null);
      setMusicTitle(file.name.replace(/\.[^/.]+$/, ''));
      const url = URL.createObjectURL(file);
      setMusicPreviewUrl(url);
    }
  };

  const selectLibraryTrack = (track: any) => {
    setMusicLibraryId(track.id);
    setMusicFile(null);
    setMusicTitle(track.title);
    setMusicPreviewUrl(track.preview_url || track.audio_url);
    setShowMusicPicker(false);
  };

  const removeMusic = () => {
    setMusicFile(null);
    setMusicLibraryId(null);
    setMusicTitle(null);
    if (musicPreviewUrl && musicFile) {
      URL.revokeObjectURL(musicPreviewUrl);
    }
    setMusicPreviewUrl(null);
  };

  const handleSave = () => {
    const filter = FILTERS.find((f) => f.id === selectedFilter);
    onSave({
      url: media.url,
      type: media.type,
      filters: filter?.css || "",
      texts: textOverlays,
      musicFile: musicFile || undefined,
      musicLibraryId: musicLibraryId || undefined,
      musicVolume,
      originalVolume,
      musicTitle: musicTitle || undefined,
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

        {/* Background music audio element */}
        {musicPreviewUrl && (
          <audio ref={musicRef} src={musicPreviewUrl} loop />
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

        {/* Music indicator */}
        {musicTitle && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-sm flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" />
            <span className="text-xs text-foreground truncate max-w-32">{musicTitle}</span>
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

      {/* Music Library Picker */}
      <AnimatePresence>
        {showMusicPicker && (
          <motion.div
            className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <motion.button
                className="p-2 rounded-full hover:bg-muted"
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMusicPicker(false)}
              >
                <X className="w-6 h-6 text-foreground" />
              </motion.button>
              <span className="font-semibold text-foreground">Music Library</span>
              <div className="w-10" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {loadingLibrary ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : libraryTracks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tracks available yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {libraryTracks.map((track) => (
                    <motion.button
                      key={track.id}
                      className="w-full p-3 rounded-xl bg-muted/50 flex items-center gap-3 hover:bg-muted transition-colors"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectLibraryTrack(track)}
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Music className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-foreground">{track.title}</p>
                        <p className="text-xs text-muted-foreground">{track.artist || 'Unknown'} • {track.genre || 'Music'}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              activeTab === "music" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            )}
            onClick={() => setActiveTab("music")}
          >
            <Music className="w-4 h-4 mx-auto mb-1" />
            Music
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

          {activeTab === "music" && (
            <div className="space-y-4">
              {/* Current music or add options */}
              {musicTitle ? (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Music className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground truncate">{musicTitle}</span>
                    </div>
                    <motion.button
                      className="p-1.5 rounded-full bg-muted"
                      whileTap={{ scale: 0.9 }}
                      onClick={removeMusic}
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </motion.button>
                  </div>
                  
                  {/* Volume controls */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Music Volume</span>
                        <span className="text-xs text-foreground">{Math.round(musicVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={musicVolume}
                        onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                    {media.type === "video" && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Original Audio</span>
                          <span className="text-xs text-foreground">{Math.round(originalVolume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={originalVolume}
                          onChange={(e) => setOriginalVolume(parseFloat(e.target.value))}
                          className="w-full accent-primary"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    className="p-4 rounded-xl bg-muted flex flex-col items-center gap-2"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => musicInputRef.current?.click()}
                  >
                    <Upload className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium text-foreground">Upload</span>
                    <span className="text-xs text-muted-foreground">MP3, WAV</span>
                  </motion.button>
                  
                  <motion.button
                    className="p-4 rounded-xl bg-muted flex flex-col items-center gap-2"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMusicPicker(true)}
                  >
                    <Library className="w-6 h-6 text-secondary" />
                    <span className="text-sm font-medium text-foreground">Library</span>
                    <span className="text-xs text-muted-foreground">Free tracks</span>
                  </motion.button>
                </div>
              )}
              
              <input
                ref={musicInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleMusicUpload}
              />
            </div>
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
