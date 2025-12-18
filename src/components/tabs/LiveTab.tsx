import { motion } from "framer-motion";
import { Radio, Users, Gift, MessageSquare } from "lucide-react";

const LiveTab = () => {
  return (
    <motion.div
      className="flex flex-col items-center min-h-[60vh] px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <motion.div
        className="relative p-6 rounded-full bg-destructive/20 mb-6"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Radio className="w-12 h-12 text-destructive" />
        {/* Live Pulse Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-destructive"
          animate={{ scale: [1, 1.5], opacity: [1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>

      <h2 className="text-2xl font-bold text-foreground mb-2">Live</h2>
      <p className="text-muted-foreground text-center mb-8 max-w-xs">
        Go live or watch live streams. Earn and send AC in real-time. Coming in Phase 5!
      </p>

      <div className="flex gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-muted">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Viewers</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-muted">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Chat</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 rounded-full bg-muted">
            <Gift className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Gifts</span>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveTab;
