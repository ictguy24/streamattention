import { motion } from "framer-motion";
import { User, Settings, Trophy, Grid, Clock, Palette } from "lucide-react";
import ACCounter from "../ACCounter";

interface ProfileTabProps {
  acBalance: number;
}

const widgets = [
  { icon: Trophy, label: "Achievements" },
  { icon: Grid, label: "Media Grid" },
  { icon: Clock, label: "Timeline" },
  { icon: Palette, label: "Customize" },
];

const ProfileTab = ({ acBalance }: ProfileTabProps) => {
  return (
    <motion.div
      className="flex flex-col items-center min-h-[60vh] px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Avatar with Status Ring */}
      <motion.div
        className="relative mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-neon p-[3px]">
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
        {/* Online Status */}
        <motion.div
          className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <h2 className="text-xl font-bold text-foreground mb-1">Guest User</h2>
      <p className="text-sm text-muted-foreground mb-4">Create account to save AC</p>

      {/* AC Balance Display */}
      <div className="mb-6">
        <ACCounter balance={acBalance} multiplier={1} />
      </div>

      {/* Settings Button */}
      <motion.button
        className="glass-card px-4 py-2 rounded-full flex items-center gap-2 mb-8"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Settings className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Settings</span>
      </motion.button>

      {/* Widget Grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {widgets.map((widget, index) => (
          <motion.div
            key={widget.label}
            className="glass-card p-4 rounded-xl flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <widget.icon className="w-5 h-5 text-primary" />
            <span className="text-sm text-foreground">{widget.label}</span>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-6 text-center">
        Full profile customization coming in Phase 6!
      </p>
    </motion.div>
  );
};

export default ProfileTab;
