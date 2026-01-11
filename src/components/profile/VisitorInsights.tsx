import { motion } from "framer-motion";
import { Eye, Users, TrendingUp, Clock, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const VisitorInsights = () => {
  const { user } = useAuth();

  // For now, show a "Coming Soon" state since analytics requires backend tracking
  // In production, this would fetch from an analytics edge function or table

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Eye className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Visitor Insights</h3>
      </div>

      {/* Coming Soon State */}
      <motion.div
        className="glass-card rounded-xl p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h4 className="text-lg font-medium text-foreground mb-2">Analytics Coming Soon</h4>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Track who views your profile, where they're from, and when they're most active.
        </p>
      </motion.div>

      {/* Placeholder Stats */}
      <div className="grid grid-cols-2 gap-3 opacity-50">
        <motion.div
          className="glass-card rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Profile Views</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">—</span>
          </div>
        </motion.div>

        <motion.div
          className="glass-card rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-xs text-muted-foreground">Unique Visitors</span>
          </div>
          <span className="text-2xl font-bold text-foreground">—</span>
        </motion.div>
      </div>

      {/* Peak Hours Placeholder */}
      <motion.div
        className="glass-card rounded-xl p-4 opacity-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Peak Hours</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-20">
          {["9 AM", "12 PM", "6 PM", "9 PM"].map((hour, index) => (
            <div key={hour} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg bg-muted/30"
                style={{ height: `${20 + index * 15}%` }}
              />
              <span className="text-[10px] text-muted-foreground">{hour}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default VisitorInsights;
