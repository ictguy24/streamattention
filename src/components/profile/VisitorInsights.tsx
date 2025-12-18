import { motion } from "framer-motion";
import { Eye, Users, TrendingUp, MapPin, Clock, Globe } from "lucide-react";

interface VisitorInsightsProps {
  totalViews: number;
  uniqueVisitors: number;
  viewsChange: number;
  topLocations: { name: string; count: number }[];
  peakHours: { hour: string; count: number }[];
}

const DEMO_INSIGHTS: VisitorInsightsProps = {
  totalViews: 1234,
  uniqueVisitors: 892,
  viewsChange: 23,
  topLocations: [
    { name: "United States", count: 456 },
    { name: "United Kingdom", count: 234 },
    { name: "Canada", count: 156 },
    { name: "Germany", count: 89 },
  ],
  peakHours: [
    { hour: "9 AM", count: 45 },
    { hour: "12 PM", count: 78 },
    { hour: "6 PM", count: 123 },
    { hour: "9 PM", count: 98 },
  ],
};

const VisitorInsights = () => {
  const insights = DEMO_INSIGHTS;
  const maxHourCount = Math.max(...insights.peakHours.map(h => h.count));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Eye className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Visitor Insights</h3>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
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
            <span className="text-2xl font-bold text-foreground">
              {insights.totalViews.toLocaleString()}
            </span>
            <span className="text-xs text-green-500 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +{insights.viewsChange}%
            </span>
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
          <span className="text-2xl font-bold text-foreground">
            {insights.uniqueVisitors.toLocaleString()}
          </span>
        </motion.div>
      </div>

      {/* Peak Hours */}
      <motion.div
        className="glass-card rounded-xl p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Peak Hours</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-20">
          {insights.peakHours.map((hour, index) => (
            <div key={hour.hour} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className="w-full rounded-t-lg bg-gradient-to-t from-primary/50 to-primary"
                initial={{ height: 0 }}
                animate={{ height: `${(hour.count / maxHourCount) * 100}%` }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              />
              <span className="text-[10px] text-muted-foreground">{hour.hour}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Locations */}
      <motion.div
        className="glass-card rounded-xl p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-secondary" />
          <span className="text-sm font-medium text-foreground">Top Locations</span>
        </div>
        <div className="space-y-3">
          {insights.topLocations.map((location, index) => {
            const percentage = (location.count / insights.totalViews) * 100;
            return (
              <div key={location.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{location.name}</span>
                  </div>
                  <span className="text-muted-foreground">{location.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default VisitorInsights;
