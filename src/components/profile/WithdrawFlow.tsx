import { useState, useEffect, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, TrendingUp, Clock, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface WithdrawFlowProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawableBalance: number;
  onWithdraw: (amount: number) => void;
}

type FlowStep = "eligibility" | "progress" | "range" | "confirm" | "success";

const WithdrawFlow = forwardRef<HTMLDivElement, WithdrawFlowProps>(({ isOpen, onClose, withdrawableBalance, onWithdraw }, ref) => {
  const [step, setStep] = useState<FlowStep>("eligibility");
  const [progressValue, setProgressValue] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Simulated data
  const acToUGX = 50; // 1 AC = 50 UGX
  const minWithdraw = 100;
  const maxWithdraw = withdrawableBalance;
  const estimatedMin = Math.floor(withdrawableBalance * 0.9 * acToUGX);
  const estimatedMax = Math.floor(withdrawableBalance * acToUGX);
  const rankPercentile = 15; // Top 15%
  const nextUnlock = "3 days";
  const stabilityBonus = 5; // 5% bonus

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setStep("eligibility");
      setProgressValue(0);
      setShowConfetti(false);
    }
  }, [isOpen]);

  // Progress animation
  useEffect(() => {
    if (step === "progress") {
      const interval = setInterval(() => {
        setProgressValue(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep("range"), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Success confetti
  useEffect(() => {
    if (step === "success") {
      setShowConfetti(true);
      // Play sound effect (browser may block without user interaction)
      const audio = new Audio("/success.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, [step]);

  const handleContinue = () => {
    switch (step) {
      case "eligibility":
        setStep("progress");
        break;
      case "range":
        setStep("confirm");
        break;
      case "confirm":
        onWithdraw(withdrawableBalance);
        setStep("success");
        break;
      case "success":
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm bg-card rounded-2xl border border-border/20 overflow-hidden"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/10">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Withdraw</h2>
            <button
              className="text-muted-foreground text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Eligibility */}
            {step === "eligibility" && (
              <motion.div
                key="eligibility"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  You're Eligible
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  You're eligible to convert attention into value.
                </p>
              </motion.div>
            )}

            {/* Step 2: Progress Reveal */}
            {step === "progress" && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <h3 className="text-sm text-muted-foreground mb-4">
                  Calculating your value...
                </h3>
                
                <div className="relative h-3 bg-muted/20 rounded-full overflow-hidden mb-4">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full"
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
                
                <p className="text-2xl font-bold text-foreground">
                  {progressValue}%
                </p>
              </motion.div>
            )}

            {/* Step 3: Range Display */}
            {step === "range" && (
              <motion.div
                key="range"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <h3 className="text-sm text-muted-foreground mb-4">
                  Estimated payout range
                </h3>
                
                <div className="py-6 px-4 bg-muted/10 rounded-xl mb-4">
                  <div className="flex items-center justify-center gap-2 text-foreground">
                    <span className="text-xl font-medium">
                      {estimatedMin.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-xl font-bold text-primary">
                      {estimatedMax.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">UGX</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ≈ ${(estimatedMax / 3700).toFixed(2)} USD
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>+{stabilityBonus}% stability bonus included</span>
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <h3 className="text-sm text-muted-foreground mb-4">
                  Confirm withdrawal
                </h3>
                
                <div className="py-8 px-4 bg-muted/10 rounded-xl mb-4">
                  <p className="text-3xl font-bold text-foreground">
                    {withdrawableBalance.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Attention Credits
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  Processing may take up to 24 hours
                </p>
              </motion.div>
            )}

            {/* Step 5: Success */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center relative"
              >
                {/* Subtle confetti */}
                {showConfetti && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={cn(
                          "absolute w-2 h-2 rounded-full",
                          i % 3 === 0 ? "bg-primary" : 
                          i % 3 === 1 ? "bg-secondary" : "bg-accent"
                        )}
                        initial={{ 
                          x: "50%", 
                          y: "30%",
                          opacity: 1,
                        }}
                        animate={{ 
                          x: `${20 + Math.random() * 60}%`, 
                          y: `${Math.random() * 100}%`,
                          opacity: 0,
                          scale: [1, 1.5, 0],
                        }}
                        transition={{ 
                          duration: 1 + Math.random() * 0.5,
                          delay: i * 0.05,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </motion.div>
                )}

                <motion.div
                  className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <Check className="w-8 h-8 text-green-500" />
                </motion.div>

                <h3 className="text-lg font-medium text-foreground mb-2">
                  Withdrawal Complete!
                </h3>
                
                <p className="text-2xl font-bold text-foreground mb-6">
                  {(withdrawableBalance * acToUGX).toLocaleString()} UGX
                </p>

                {/* Reinforcement stats */}
                <div className="space-y-3 py-4 border-t border-border/10">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>Your rank</span>
                    </div>
                    <span className="font-medium text-foreground">
                      Top {rankPercentile}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Next unlock</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {nextUnlock}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span>Stability bonus</span>
                    </div>
                    <span className="font-medium text-green-500">
                      +{stabilityBonus}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/10">
          <button
            className={cn(
              "w-full py-3 rounded-xl font-medium transition-colors active:scale-[0.98]",
              step === "success" 
                ? "bg-muted/20 text-foreground"
                : "bg-foreground text-background"
            )}
            onClick={handleContinue}
          >
            {step === "eligibility" && "Continue"}
            {step === "progress" && "Processing..."}
            {step === "range" && "Proceed to Withdraw"}
            {step === "confirm" && "Confirm Withdrawal"}
            {step === "success" && "Done"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

WithdrawFlow.displayName = "WithdrawFlow";

export default WithdrawFlow;
