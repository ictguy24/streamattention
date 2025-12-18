import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Flame, Clock, Trophy, Eye } from "lucide-react";

interface ACStatsProps {
  balance: number;
  todayEarned: number;
  weeklyEarned: number;
  streak: number;
  totalEarned: number;
  rank?: number;
}

const ACStats = ({ 
  balance, 
  todayEarned, 
  weeklyEarned, 
  streak, 
  totalEarned,
  rank 
}: ACStatsProps) => {
  const stats = [
    { 
      label: "Today", 
      value: todayEarned, 
      icon: Clock, 
      color: "text-primary",
      bgColor: "bg-primary/10" 
    },
    { 
      label: "This Week", 
      value: weeklyEarned, 
      icon: TrendingUp, 
      color: "text-secondary",
      bgColor: "bg-secondary/10" 
    },
    { 
      label: "Streak", 
      value: `${streak}d`, 
      icon: Flame, 
      color: "text-accent",
      bgColor: "bg-accent/10" 
    },
    { 
      label: "All Time", 
      value: totalEarned, 
      icon: Trophy, 
      color: "text-ac-burst",
      bgColor: "bg-ac-burst/10" 
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <motion.div
        className="glass-card rounded-2xl p-6 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Balance</span>
            {rank && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-ac-burst/20">
                <Trophy className="w-3 h-3 text-ac-burst" />
                <span className="text-xs font-bold text-ac-burst">#{rank}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-baseline gap-2">
            <motion.span
              className="text-4xl font-bold text-foreground"
              key={balance}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
            >
              {balance.toLocaleString()}
            </motion.span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-lg font-medium text-primary">AC</span>
            </div>
          </div>

          {/* Mini Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Next milestone: {((Math.floor(balance / 1000) + 1) * 1000).toLocaleString()} AC</span>
              <span>{Math.round((balance % 1000) / 10)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-gradient-neon rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(balance % 1000) / 10}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="glass-card rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ACStats;
