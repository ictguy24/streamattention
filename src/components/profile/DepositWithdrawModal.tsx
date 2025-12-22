import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDownToLine, ArrowUpFromLine, AlertCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "deposit" | "withdraw";
  balance: number;
  withdrawableBalance?: number;
  isFrozen?: boolean;
}

const PAYMENT_METHODS = [
  { id: "airtel", name: "Airtel Money", icon: "📱", color: "bg-red-500/20 text-red-400" },
  { id: "mtn", name: "MTN Mobile Money", icon: "📱", color: "bg-yellow-500/20 text-yellow-400" },
];

// UGX conversion rate
const AC_TO_UGX = 50;

const DepositWithdrawModal = ({ 
  isOpen, 
  onClose, 
  mode, 
  balance, 
  withdrawableBalance = 0,
  isFrozen = false 
}: DepositWithdrawModalProps) => {
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleContinue = async () => {
    if (step === 1 && amount && parseFloat(amount) > 0) {
      // Check withdrawal limits
      if (isWithdraw) {
        const amountNum = parseFloat(amount);
        const maxWithdrawUGX = withdrawableBalance * AC_TO_UGX;
        
        if (amountNum > maxWithdrawUGX) {
          toast.error(`Maximum withdrawable: ${maxWithdrawUGX.toLocaleString()} UGX`);
          return;
        }
      }
      setStep(2);
    } else if (step === 2 && selectedMethod) {
      setStep(3);
    } else if (step === 3 && phoneNumber.length >= 9) {
      setIsProcessing(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isWithdraw) {
        toast.success(`Withdrawal request submitted! You'll receive ${parseFloat(amount).toLocaleString()} UGX within 24 hours.`);
      } else {
        toast.success(`Deposit initiated! Complete the payment on your phone to add ${parseFloat(amount).toLocaleString()} AC.`);
      }
      
      setIsProcessing(false);
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep(1);
      setAmount("");
      setPhoneNumber("");
      setSelectedMethod(null);
    }, 300);
  };

  const isWithdraw = mode === "withdraw";
  const maxWithdrawUGX = withdrawableBalance * AC_TO_UGX;

  // Block withdrawals if frozen
  if (isWithdraw && isFrozen && isOpen) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />
        <motion.div
          className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-card rounded-2xl border border-border/50 max-w-md mx-auto overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: "-45%" }}
          animate={{ opacity: 1, scale: 1, y: "-50%" }}
          exit={{ opacity: 0, scale: 0.95, y: "-45%" }}
        >
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Withdrawals Frozen
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your withdrawals are temporarily frozen due to pending subscription fees. 
              Earn more AC or upgrade to a free tier to unfreeze.
            </p>
            <button
              className="w-full py-3 rounded-xl bg-muted text-foreground font-medium"
              onClick={handleClose}
            >
              Got it
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-card rounded-2xl border border-border/50 max-w-md mx-auto overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: "-45%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-45%" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {isWithdraw ? (
                  <ArrowUpFromLine className="w-5 h-5 text-orange-400" />
                ) : (
                  <ArrowDownToLine className="w-5 h-5 text-green-400" />
                )}
                {isWithdraw ? "Withdraw" : "Deposit"}
              </h2>
              <motion.button
                className="p-2 rounded-full hover:bg-muted/50"
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-4">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <label className="text-sm text-muted-foreground mb-2 block">
                      {isWithdraw ? "Amount to withdraw (UGX)" : "Amount to deposit (AC)"}
                    </label>
                    
                    <div className="relative mb-4">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-2xl font-bold text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {isWithdraw ? "UGX" : "AC"}
                      </span>
                    </div>

                    {/* Quick amounts */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {(isWithdraw ? [5000, 10000, 20000, 50000] : [100, 500, 1000, 5000]).map((value) => (
                        <motion.button
                          key={value}
                          className="py-2 rounded-lg bg-muted/30 text-sm text-foreground font-medium hover:bg-muted/50"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAmountSelect(value)}
                        >
                          {value.toLocaleString()}
                        </motion.button>
                      ))}
                    </div>

                    {isWithdraw && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground text-center">
                          Available: {maxWithdrawUGX.toLocaleString()} UGX ({withdrawableBalance.toLocaleString()} AC)
                        </p>
                        {withdrawableBalance < balance && (
                          <p className="text-xs text-amber-400 text-center">
                            Note: {(balance - withdrawableBalance).toLocaleString()} AC reserved for subscription fees
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <label className="text-sm text-muted-foreground mb-3 block">
                      Select payment method
                    </label>
                    
                    <div className="space-y-2">
                      {PAYMENT_METHODS.map((method) => (
                        <motion.button
                          key={method.id}
                          className={cn(
                            "w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                            selectedMethod === method.id
                              ? "border-primary bg-primary/10"
                              : "border-border/50 bg-muted/30 hover:border-border"
                          )}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedMethod(method.id)}
                        >
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-xl", method.color)}>
                            {method.icon}
                          </div>
                          <span className="font-medium text-foreground">{method.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <label className="text-sm text-muted-foreground mb-2 block">
                      Enter your phone number
                    </label>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-3 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground font-medium">
                        +256
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="7XX XXX XXX"
                        className="flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <p className="text-xs text-accent">
                        {isWithdraw 
                          ? "You will receive a confirmation SMS. Funds will be sent within 24 hours."
                          : "You will receive a payment prompt on your phone. Complete the payment to add AC."}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-border/50">
              <motion.button
                className={cn(
                  "w-full py-3 rounded-xl font-semibold transition-all",
                  (step === 1 && amount) || (step === 2 && selectedMethod) || (step === 3 && phoneNumber.length >= 9)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Processing...
                  </span>
                ) : step === 3 ? (
                  isWithdraw ? "Withdraw" : "Deposit"
                ) : (
                  "Continue"
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DepositWithdrawModal;
