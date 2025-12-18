import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Flame, Trophy, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import DepositWithdrawModal from "./DepositWithdrawModal";

interface WalletPanelProps {
  balance: number;
  monthlyEarned: number;
  dailyEarned?: number;
  multiplier?: number;
}

const WalletPanel = ({ balance, monthlyEarned, dailyEarned = 0, multiplier = 1 }: WalletPanelProps) => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw">("deposit");

  const milestones = [100, 500, 1000, 5000, 10000];
  const nextMilestone = milestones.find(m => m > balance) || balance + 1000;
  const prevMilestone = milestones.filter(m => m <= balance).pop() || 0;
  const progress = ((balance - prevMilestone) / (nextMilestone - prevMilestone)) * 100;

  const openDeposit = () => {
    setModalMode("deposit");
    setShowModal(true);
  };

  const openWithdraw = () => {
    setModalMode("withdraw");
    setShowModal(true);
  };

  return (
    <>
      <motion.div
        className="mx-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Main Balance with Multiplier inline */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
            <motion.div 
              className="flex items-baseline gap-1.5"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              <span className="text-3xl font-bold text-foreground tabular-nums">
                {balance.toLocaleString()}
              </span>
              <span className="text-sm text-primary font-semibold">AC</span>
              {multiplier > 1 && (
                <span className="text-sm font-bold text-accent">x{multiplier}</span>
              )}
            </motion.div>
          </div>

          {/* Deposit / Withdraw Buttons */}
          <div className="flex gap-2">
            <motion.button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 text-green-400 text-sm font-medium"
              whileTap={{ scale: 0.95 }}
              onClick={openDeposit}
            >
              <ArrowDownToLine className="w-4 h-4" />
              Deposit
            </motion.button>
            <motion.button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/10 text-orange-400 text-sm font-medium"
              whileTap={{ scale: 0.95 }}
              onClick={openWithdraw}
            >
              <ArrowUpFromLine className="w-4 h-4" />
              Withdraw
            </motion.button>
          </div>
        </div>

        {/* Progress to Next Milestone */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Next: {nextMilestone.toLocaleString()} AC</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <motion.div 
            className="p-2 rounded-xl bg-muted/20 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">{dailyEarned || Math.floor(monthlyEarned / 30)}</p>
            <p className="text-[9px] text-muted-foreground">Today</p>
          </motion.div>
          
          <motion.div 
            className="p-2 rounded-xl bg-muted/20 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <TrendingUp className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">{monthlyEarned.toLocaleString()}</p>
            <p className="text-[9px] text-muted-foreground">Month</p>
          </motion.div>
          
          <motion.div 
            className="p-2 rounded-xl bg-muted/20 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">7</p>
            <p className="text-[9px] text-muted-foreground">Streak</p>
          </motion.div>
          
          <motion.div 
            className="p-2 rounded-xl bg-muted/20 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-foreground">#1.2K</p>
            <p className="text-[9px] text-muted-foreground">Rank</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Deposit/Withdraw Modal */}
      <DepositWithdrawModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        balance={balance}
      />
    </>
  );
};

export default WalletPanel;
