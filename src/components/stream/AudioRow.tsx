import { motion } from "framer-motion";
import { Music } from "lucide-react";

interface AudioRowProps {
  audioName: string;
  artistName: string;
}

const AudioRow = ({ audioName, artistName }: AudioRowProps) => {
  return (
    <motion.div 
      className="flex items-center gap-2 mt-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Animated Album Art */}
      <motion.div
        className="relative w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center overflow-hidden"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-1 rounded-full bg-background/80 flex items-center justify-center">
          <Music className="w-3 h-3 text-foreground/70" />
        </div>
        {/* Grooves */}
        <div className="absolute inset-0 rounded-full border border-foreground/10" />
        <div className="absolute inset-2 rounded-full border border-foreground/5" />
      </motion.div>

      {/* Waveform Animation */}
      <div className="flex items-end gap-0.5 h-4">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="w-0.5 bg-foreground/50 rounded-full"
            animate={{
              height: ["4px", "16px", "8px", "12px", "4px"],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Audio Info - Marquee Style */}
      <div className="flex-1 overflow-hidden">
        <motion.p 
          className="text-xs text-foreground/70 whitespace-nowrap"
          animate={{ x: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          {audioName} · {artistName}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AudioRow;
