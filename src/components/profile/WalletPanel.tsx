import { useState, useEffect } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Crown, Lock, AlertTriangle, Shield } from "lucide-react";
import DepositWithdrawModal from "./DepositWithdrawModal";
import WithdrawFlow from "./WithdrawFlow";
import { cn } from "@/lib/utils";
import { useWallet } from "@/hooks/useWallet";
import { useSubscription } from "@/hooks/useSubscription";
import { useAttention } from "@/contexts/AttentionContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// UGX conversion rate (example: 1 AC = 50 UGX)
const AC_TO_UGX = 50;

// Trust state display config
const TRUST_STATE_CONFIG = {
  cold: { label: "Cold", color: "text-blue-400", bg: "bg-blue-400/10" },
  warm: { label: "Warm", color: "text-yellow-400", bg: "bg-yellow-400/10" },
  active: { label: "Active", color: "text-green-400", bg: "bg-green-400/10" },
  trusted: { label: "Trusted", color: "text-emerald-400", bg: "bg-emerald-400/10" },
};

const WalletPanel = () => {
  const { user } = useAuth();
  const { wallet, isLoading: walletLoading, getWithdrawableBalance, refetch } = useWallet();
  const { subscription, isLoading: subLoading } = useSubscription();
  
  // Server-verified balance from AttentionContext
  const { balance: verifiedBalance, ups, trustState, isBalanceLoading } = useAttention();
  
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawFlow, setShowWithdrawFlow] = useState(false);
  const [withdrawableBalance, setWithdrawableBalance] = useState(0);

  // Use server-verified balance from attention_ledger
  const balance = verifiedBalance;
  const lifetimeEarned = wallet?.lifetime_earned || 0;
  const tier = subscription?.tier?.name || "free";
  const tierDisplayName = subscription?.tier?.display_name || "Free";
  const multiplier = subscription?.tier?.base_multiplier || 1;
  const monthlyFee = subscription?.tier?.monthly_fee_ac || 0;
  const nextDeduction = subscription?.next_deduction_at;
  const isFrozen = wallet?.withdrawal_frozen || false;
  const freezeReason = wallet?.freeze_reason;

  // Trust state display
  const trustConfig = TRUST_STATE_CONFIG[trustState as keyof typeof TRUST_STATE_CONFIG] || TRUST_STATE_CONFIG.cold;
  const upsPercent = Math.round(ups * 100);

  // Calculate progress to next milestone
  const milestones = [100, 500, 1000, 5000, 10000];
  const nextMilestone = milestones.find(m => m > balance) || balance + 1000;
  const prevMilestone = milestones.filter(m => m <= balance).pop() || 0;
  const progress = ((balance - prevMilestone) / (nextMilestone - prevMilestone)) * 100;

  const ugxEquivalent = balance * AC_TO_UGX;

  // Fetch withdrawable balance
  useEffect(() => {
    const fetchWithdrawable = async () => {
      const amount = await getWithdrawableBalance();
      setWithdrawableBalance(amount);
    };
    fetchWithdrawable();
  }, [getWithdrawableBalance, balance]);

  const openDeposit = () => {
    setShowDepositModal(true);
  };

  const openWithdraw = () => {
    if (isFrozen) return;
    setShowWithdrawFlow(true);
  };

  const handleWithdraw = async (amount: number) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc("process_withdrawal", {
        p_user_id: user.id,
        p_amount: amount
      });
      
      if (error) throw error;
      
      const result = data?.[0];
      if (result?.success) {
        toast.success("Withdrawal successful!");
        refetch();
      } else {
        toast.error(result?.message || "Withdrawal failed");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to process withdrawal");
    }
  };

  const getTierColor = () => {
    switch (tier) {
      case "premium": return "text-amber-400";
      case "both": return "text-purple-400";
      case "user": return "text-blue-400";
      default: return "text-muted-foreground";
    }
  };

  const getTierBg = () => {
    switch (tier) {
      case "premium": return "bg-amber-400/10";
      case "both": return "bg-purple-400/10";
      case "user": return "bg-blue-400/10";
      default: return "bg-muted/20";
    }
  };

  const formatNextDeduction = () => {
    if (!nextDeduction) return null;
    const date = new Date(nextDeduction);
    const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 0) return "Due now";
    if (daysUntil === 1) return "Tomorrow";
    return `${daysUntil} days`;
  };

  if (walletLoading || subLoading || isBalanceLoading) {
    return (
      <div className="mx-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/30 animate-pulse">
        <div className="h-8 bg-muted/30 rounded mb-3" />
        <div className="h-12 bg-muted/30 rounded mb-4" />
        <div className="h-2 bg-muted/30 rounded mb-4" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-muted/30 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/30">
        {/* Tier Badge & Trust State */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full", getTierBg())}>
              <Crown className={cn("w-3.5 h-3.5", getTierColor())} strokeWidth={1.5} />
              <span className={cn("text-xs font-medium", getTierColor())}>{tierDisplayName}</span>
            </div>
            {/* Trust State Badge */}
            <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full", trustConfig.bg)}>
              <Shield className={cn("w-3 h-3", trustConfig.color)} strokeWidth={1.5} />
              <span className={cn("text-[10px] font-medium", trustConfig.color)}>
                {trustConfig.label} · {upsPercent}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {multiplier > 1 && (
              <span className="text-sm font-bold text-accent">x{multiplier} bonus</span>
            )}
            {monthlyFee > 0 && nextDeduction && (
              <span className="text-xs text-muted-foreground">
                Next fee: {formatNextDeduction()}
              </span>
            )}
          </div>
        </div>

        {/* Frozen Warning */}
        {isFrozen && (
          <div className="mb-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-xs text-destructive">
              {freezeReason || "Withdrawals temporarily frozen"}
            </p>
          </div>
        )}

        {/* Main Balance */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Verified Balance</p>
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
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                isFrozen 
                  ? "bg-muted/30 text-muted-foreground cursor-not-allowed" 
                  : "bg-orange-500/10 text-orange-400 active:scale-95"
              )}
              onClick={openWithdraw}
              disabled={isFrozen}
            >
              {isFrozen ? (
                <Lock className="w-4 h-4" />
              ) : (
                <ArrowUpFromLine className="w-4 h-4" />
              )}
              Withdraw
            </button>
          </div>
        </div>

        {/* UGX Equivalent & Withdrawable */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            = {ugxEquivalent.toLocaleString()} UGX
          </p>
          {!isFrozen && withdrawableBalance < balance && (
            <p className="text-xs text-muted-foreground">
              Withdrawable: {withdrawableBalance.toLocaleString()} AC
            </p>
          )}
        </div>

        {/* Progress to Next Milestone */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Next: {nextMilestone.toLocaleString()} AC</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-foreground/50 transition-all duration-500"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 rounded-xl bg-muted/20 text-center">
            <p className="text-sm font-bold text-foreground tabular-nums">
              {Math.floor(lifetimeEarned / 30)}
            </p>
            <p className="text-[9px] text-muted-foreground">Avg/Day</p>
          </div>
          
          <div className="p-2 rounded-xl bg-muted/20 text-center">
            <p className="text-sm font-bold text-foreground tabular-nums">
              {monthlyFee.toLocaleString()}
            </p>
            <p className="text-[9px] text-muted-foreground">Fee/Mo</p>
          </div>
          
          <div className="p-2 rounded-xl bg-muted/20 text-center">
            <p className="text-sm font-bold text-foreground tabular-nums">
              {lifetimeEarned.toLocaleString()}
            </p>
            <p className="text-[9px] text-muted-foreground">Lifetime</p>
          </div>
          
          <div className="p-2 rounded-xl bg-muted/20 text-center">
            <p className="text-sm font-bold text-foreground tabular-nums">
              {(wallet?.lifetime_withdrawn || 0).toLocaleString()}
            </p>
            <p className="text-[9px] text-muted-foreground">Withdrawn</p>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositWithdrawModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        mode="deposit"
        balance={balance}
        withdrawableBalance={withdrawableBalance}
        isFrozen={isFrozen}
      />

      {/* Psychology-Safe Withdraw Flow */}
      <WithdrawFlow
        isOpen={showWithdrawFlow}
        onClose={() => setShowWithdrawFlow(false)}
        withdrawableBalance={withdrawableBalance}
        onWithdraw={handleWithdraw}
      />
    </>
  );
};

export default WalletPanel;
