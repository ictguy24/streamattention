import { motion } from "framer-motion";
import { MessageCircle, Image, Zap, Camera } from "lucide-react";

const modes = [
  { id: "chats", icon: MessageCircle, label: "Chats", color: "text-primary" },
  { id: "moments", icon: Image, label: "Moments", color: "text-secondary" },
  { id: "pulse", icon: Zap, label: "Pulse", color: "text-accent" },
  { id: "snap", icon: Camera, label: "Snap Zone", color: "text-ac-burst" },
];

const SocialTab = () => {
  return (
    <motion.div
      className="flex flex-col min-h-[60vh] px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Social</h2>
      
      {/* Mode Switcher */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {modes.map((mode, index) => (
          <motion.button
            key={mode.id}
            className="glass-card p-4 flex flex-col items-center gap-2 rounded-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <mode.icon className={`w-6 h-6 ${mode.color}`} />
            <span className="text-xs text-muted-foreground">{mode.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Placeholder Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Connect with others and earn AC. Coming in Phase 3!
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SocialTab;
