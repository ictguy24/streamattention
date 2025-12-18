import { motion } from "framer-motion";
import { TrendingUp, Clock, MapPin, BarChart3 } from "lucide-react";

const PerformanceDashboard = () => {
  // Demo data for watch depth
  const watchDepthData = [
    { label: "0-25%", value: 15, color: "bg-red-400" },
    { label: "25-50%", value: 25, color: "bg-orange-400" },
    { label: "50-75%", value: 35, color: "bg-yellow-400" },
    { label: "75-100%", value: 65, color: "bg-green-400" },
  ];

  const peakHours = [
    { hour: "6AM", value: 20 },
    { hour: "9AM", value: 45 },
    { hour: "12PM", value: 60 },
    { hour: "3PM", value: 55 },
    { hour: "6PM", value: 85 },
    { hour: "9PM", value: 95 },
    { hour: "12AM", value: 40 },
  ];

  const maxValue = Math.max(...peakHours.map(p => p.value));

  return (
    <motion.div
      className="px-4 py-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-sm font-semibold text-foreground mb-3">Performance</h3>

      {/* Watch Depth Bars */}
      <div className="p-4 rounded-xl border border-border/50 bg-card/40 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Watch Depth</span>
        </div>
        
        <div className="space-y-2">
          {watchDepthData.map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <span className="text-xs text-muted-foreground w-16">{item.label}</span>
              <div className="flex-1 h-3 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${item.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-8">{item.value}%</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Peak Activity Hours */}
      <div className="p-4 rounded-xl border border-border/50 bg-card/40">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-accent" />
          <span className="text-xs font-medium text-foreground">Peak Hours</span>
        </div>
        
        <div className="flex items-end justify-between h-20 gap-1">
          {peakHours.map((hour, index) => (
            <motion.div
              key={hour.hour}
              className="flex-1 flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <motion.div
                className="w-full rounded-t bg-gradient-to-t from-primary to-accent"
                initial={{ height: 0 }}
                animate={{ height: `${(hour.value / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
              />
              <span className="text-[9px] text-muted-foreground">{hour.hour}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trend Summary */}
      <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
        <TrendingUp className="w-4 h-4 text-green-400" />
        <span className="text-xs text-green-400">Engagement up 23% this week</span>
      </div>
    </motion.div>
  );
};

export default PerformanceDashboard;
