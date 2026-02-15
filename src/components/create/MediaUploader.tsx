import { useRef, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { Upload, Image, Video, X } from "lucide-react";

interface MediaUploaderProps {
  onMediaSelect: (file: File, type: "image" | "video") => void;
  variant?: "default" | "compact";
}

const MediaUploader = ({ onMediaSelect, variant = "default" }: MediaUploaderProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (file) {
      onMediaSelect(file, type);
    }
  };

  if (variant === "compact") {
    return (
      <motion.button
        className="group relative overflow-hidden rounded-3xl p-5 bg-white/5 border border-white/10 hover:border-primary/50 transition-all text-left"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => imageInputRef.current?.click()}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-3">
          <Upload className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">Library</h3>
        <p className="text-[10px] text-muted-foreground">Upload from phone</p>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const type = file.type.startsWith('video') ? 'video' : 'image';
              onMediaSelect(file, type);
            }
          }}
        />
      </motion.button>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Image Upload */}
      <motion.button
        className="aspect-square rounded-2xl glass-card flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border hover:border-primary/50 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => imageInputRef.current?.click()}
      >
        <div className="p-4 rounded-full bg-primary/10">
          <Image className="w-8 h-8 text-primary" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">Photo</p>
          <p className="text-xs text-muted-foreground">JPG, PNG, WEBP</p>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, "image")}
        />
      </motion.button>

      {/* Video Upload */}
      <motion.button
        className="aspect-square rounded-2xl glass-card flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border hover:border-secondary/50 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => videoInputRef.current?.click()}
      >
        <div className="p-4 rounded-full bg-secondary/10">
          <Video className="w-8 h-8 text-secondary" />
        </div>
        <div className="text-center">
          <p className="font-medium text-foreground">Video</p>
          <p className="text-xs text-muted-foreground">MP4, MOV, WEBM</p>
        </div>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileChange(e, "video")}
        />
      </motion.button>
    </div>
  );
};

export default MediaUploader;
