import { motion } from "framer-motion";
import { Download, Share, Plus, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        className="w-20 h-20 rounded-2xl bg-gradient-neon flex items-center justify-center mb-8 neon-glow"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring" }}
      >
        <Smartphone className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <motion.h1
        className="text-3xl font-bold text-foreground mb-4 text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        Install Attention App
      </motion.h1>

      <motion.p
        className="text-muted-foreground text-center mb-8 max-w-sm"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Add Attention to your home screen for the best experience. It works offline and loads instantly!
      </motion.p>

      {/* iOS Instructions */}
      <motion.div
        className="glass-card p-6 rounded-xl w-full max-w-sm mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="text-2xl">🍎</span> iPhone / iPad
        </h3>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <Share className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <span>Tap the <strong>Share</strong> button in Safari</span>
          </li>
          <li className="flex items-start gap-3">
            <Plus className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
          </li>
          <li className="flex items-start gap-3">
            <Download className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <span>Tap <strong>"Add"</strong> to install</span>
          </li>
        </ol>
      </motion.div>

      {/* Android Instructions */}
      <motion.div
        className="glass-card p-6 rounded-xl w-full max-w-sm mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="text-2xl">🤖</span> Android
        </h3>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="w-5 h-5 text-primary mt-0.5 shrink-0">⋮</span>
            <span>Tap the <strong>menu icon</strong> (3 dots) in Chrome</span>
          </li>
          <li className="flex items-start gap-3">
            <Download className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
          </li>
          <li className="flex items-start gap-3">
            <Plus className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <span>Confirm by tapping <strong>"Install"</strong></span>
          </li>
        </ol>
      </motion.div>

      <Button
        onClick={() => navigate("/")}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Continue to App
      </Button>
    </div>
  );
};

export default Install;
