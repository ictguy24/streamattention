import { useState } from "react";
import { TrendingUp, Flame, Trophy, ArrowDownToLine, ArrowUpFromLine, Crown } from "lucide-react";
import DepositWithdrawModal from "./DepositWithdrawModal";
import { cn } from "@/lib/utils";

interface WalletPanelProps {
  balance: number;
  monthlyEarned: number;
  dailyEarned?: number;
  multiplier?: number;
  tier?: "free" | "pro" | "premium";
  lifetimeEarned?: number;
}

// UGX conversion rate (example: 1 AC = 50 UGX)
const AC_TO_UGX = 50;

const WalletPanel = ({ 
  balance, 
  monthlyEarned, 
  dailyEarned = 0, 
  multiplier = 1,
  tier = "free",
  lifetimeEarned = 0
}: WalletPanelProps) => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw">("deposit");

  const milestones = [100, 500, 1000, 5000, 10000];
  const nextMilestone = milestones.find(m => m > balance) || balance + 1000;
  const prevMilestone = milestones.filter(m => m <= balance).pop() || 0;
  const progress = ((balance - prevMilestone) / (nextMilestone - prevMilestone)) * 100;

  const ugxEquivalent = balance * AC_TO_UGX;
  const calculatedLifetime = lifetimeEarned || Math.floor(balance * 2.5);

  const openDeposit = () => {
    setModalMode("deposit");
    setShowModal(true);
  };

  const openWithdraw = () => {
    setModalMode("withdraw");
    setShowModal(true);
  };

  const getTierColor = () => {
    switch (tier) {
      case "premium": return "text-amber-400";
      case "pro": return "text-blue-400";
      default: return "text-muted-foreground";
    }
  };

  const getTierBg = () => {
    switch (tier) {
      case "premium": return "bg-amber-400/10";
      case "pro": return "bg-blue-400/10";
      default: return "bg-muted/20";
    }
  };

  return (
    <>
      <div className="mx-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/30">
        {/* Tier Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full", getTierBg())}>
            <Crown className={cn("w-3.5 h-3.5", getTierColor())} strokeWidth={1.5} />
            <span className={cn("text-xs font-medium capitalize", getTierColor())}>{tier}</span>
          </div>
          {multiplier > 1 && (
            <span className="text-sm font-bold text-accent">x{multiplier} bonus</span>
          )}
        </div>

        {/* Main Balance */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-foreground tabular-nums">
                {balance.toLocaleString()}
              </span>
              <span className="text-sm text-primary font-semibold">AC</span>
            </div>
          </div>

          {/* Deposit / Withdraw Buttons */}
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 text-green-400 text-sm font-medium active:scale-95 transition-transform"
              onClick={openDeposit}
            >
              <ArrowDownToLine className="w-4 h-4" />
              Deposit
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/10 text-orange-400 text-sm font-medium active:scale-95 transition-transform"
              onClick={openWithdraw}
            >
              <ArrowUpFromLine className="w-4 h-4" />
              Withdraw
            </button>
          </div>
        </div>

        {/* UGX Equivalent */}
        <p className="text-sm text-muted-foreground mb-4">
          = {ugxEquivalent.toLocaleString()} UGX
        </p>

        {/* Progress to Next Milestone */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Next: {nextMilestone.toLocaleString()} AC</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground/50 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats Grid - No decorative icons, just data */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded-xl bg-muted/20 text-center">
            <p className="text-sm font-bold text-foreground tabular-nums">
              {dailyEarned || Math.floor(monthlyEarned / 30)}
            </p>
            <p className="text-[9px] text-muted-foreground">Today</p>
          </div>
          
          <div className="p-2 rounded-xl bg-muted/20 text-center">
            <p className="text-sm font-bold text-foreground tabular-nums">
              {monthlyEarned.toLocaleString()}
            </p>
            <p className="text-[9px] text-muted-foreground">Month</p>
          </div>
          
          <div className="p-2 rounded-xl bg-muted/20 text-center">
            <p className="text-sm font-bold text-foreground tabular-nums">
              {calculatedLifetime.toLocaleString()}
            </p>
            <p className="text-[9px] text-muted-foreground">Lifetime</p>
          </div>
          
          <div className="p-2 rounded-xl bg-muted/20 text-center">
            <p className="text-sm font-bold text-foreground tabular-nums">#1.2K</p>
            <p className="text-[9px] text-muted-foreground">Rank</p>
          </div>
        </div>
      </div>

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