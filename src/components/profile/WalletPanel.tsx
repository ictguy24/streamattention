import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Flame, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletPanelProps {
  balance: number;
  monthlyEarned: number;
  multiplier?: number;
}

const WalletPanel = ({ balance, monthlyEarned, multiplier = 1 }: WalletPanelProps) => {
  const milestones = [100, 500, 1000, 5000, 10000];
  const nextMilestone = milestones.find(m => m > balance) || balance + 1000;
  const prevMilestone = milestones.filter(m => m <= balance).pop() || 0;
  const progress = ((balance - prevMilestone) / (nextMilestone - prevMilestone)) * 100;

  return (
    <motion.div
      className="mx-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Main Balance */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
          <motion.div 
            className="flex items-baseline gap-2"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <span className="text-3xl font-bold text-foreground tabular-nums">
              {balance.toLocaleString()}
            </span>
            <span className="text-sm text-primary font-semibold">AC</span>
          </motion.div>
        </div>
        
        {/* Multiplier Badge */}
        {multiplier > 1 && (
          <motion.div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
          >
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-accent">{multiplier}x</span>
          </motion.div>
        )}
      </div>

      {/* Progress to Next Milestone */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Progress to {nextMilestone.toLocaleString()} AC</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div 
          className="p-3 rounded-xl bg-muted/30 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{monthlyEarned.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">This Month</p>
        </motion.div>
        
        <motion.div 
          className="p-3 rounded-xl bg-muted/30 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">7</p>
          <p className="text-[10px] text-muted-foreground">Day Streak</p>
        </motion.div>
        
        <motion.div 
          className="p-3 rounded-xl bg-muted/30 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">#1,234</p>
          <p className="text-[10px] text-muted-foreground">Global Rank</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WalletPanel;
