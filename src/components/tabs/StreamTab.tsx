import { motion } from "framer-motion";
import { Play, Compass } from "lucide-react";

const StreamTab = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.div
        className="p-6 rounded-full bg-primary/10 mb-6"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Play className="w-12 h-12 text-primary" />
      </motion.div>
      
      <h2 className="text-2xl font-bold text-foreground mb-2">Stream</h2>
      <p className="text-muted-foreground max-w-xs mb-6">
        Watch videos and earn AC by engaging with content. Coming soon in Phase 2!
      </p>

      <div className="flex gap-4">
        <div className="glass-card px-4 py-2 rounded-full">
          <span className="text-sm text-muted-foreground">Your Stream</span>
        </div>
        <div className="glass-card px-4 py-2 rounded-full flex items-center gap-2">
          <Compass className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Companions</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StreamTab;
