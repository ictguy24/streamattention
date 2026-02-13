import { useState, useEffect } from "react";
import { Radio, Users, Gift, MessageSquare, Circle, Volume2, Mic, Phone, Settings } from "lucide-react";
import { motion } from "framer-motion";

const LiveTab = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(12);
  const [streamTitle, setStreamTitle] = useState("My Live Stream");
  const [streamDescription, setStreamDescription] = useState("");
  
  // Simulate viewer count changes
  useEffect(() => {
    if (!isStreaming) return;
    
    const interval = setInterval(() => {
      setViewerCount(prev => {
        // Randomly increase or decrease viewers by small amounts
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(1, prev + change);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      setViewerCount(1);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[60vh] px-6">
      {/* Live Indicator */}
      <motion.div
        className={`relative p-6 rounded-full mb-6 ${isStreaming ? 'bg-destructive/20' : 'bg-muted'}`}
        animate={{ scale: isStreaming ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 1.5, repeat: isStreaming ? Infinity : 0 }}
      >
        <Radio className={`w-12 h-12 ${isStreaming ? 'text-destructive' : 'text-muted-foreground'}`} />
        {isStreaming && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-destructive"
            animate={{ scale: [1, 1.5], opacity: [1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      <h2 className="text-2xl font-bold text-foreground mb-2">Live</h2>
      
      {!isStreaming ? (
        <div className="w-full max-w-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Stream Title</label>
              <input
                type="text"
                value={streamTitle}
                onChange={(e) => setStreamTitle(e.target.value)}
                placeholder="Enter stream title"
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                value={streamDescription}
                onChange={(e) => setStreamDescription(e.target.value)}
                placeholder="What's this stream about?"
                className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
              />
            </div>
            <button
              onClick={toggleStreaming}
              className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-medium active:scale-[0.98] transition-transform"
            >
              Go Live Now
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <div className="bg-muted/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">{streamTitle}</h3>
              <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full">LIVE</span>
            </div>
            {streamDescription && (
              <p className="text-sm text-muted-foreground mb-3">{streamDescription}</p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{viewerCount} watching</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/50 active:scale-[0.98] transition-transform">
              <Mic className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Mute</span>
            </button>
            <button className="flex items-center justify-center gap-2 p-3 rounded-xl bg-muted/50 active:scale-[0.98] transition-transform">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Settings</span>
            </button>
          </div>

          <button
            onClick={toggleStreaming}
            className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-medium active:scale-[0.98] transition-transform"
          >
            End Stream
          </button>
        </div>
      )}

      {isStreaming && (
        <div className="mt-8 w-full">
          <div className="flex gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-muted">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">{viewerCount}</span>
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
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Interact with your audience in real-time</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTab;
