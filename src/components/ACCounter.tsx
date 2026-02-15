import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface ACCounterProps {
  balance: number;
  multiplier?: number;
}

const ACCounter = ({ balance, multiplier = 1 }: ACCounterProps) => {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevBalanceRef = useRef(balance);

  useEffect(() => {
    if (balance !== prevBalanceRef.current) {
      const diff = balance - prevBalanceRef.current;
      
      if (diff !== 0) {
        setIsAnimating(true);
      }

      // Smooth counter animation
      const steps = Math.min(Math.abs(diff), 15);
      const stepValue = diff / steps;
      let current = prevBalanceRef.current;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        current += stepValue;
        if (step >= steps) {
          setDisplayBalance(balance);
          clearInterval(interval);
          setTimeout(() => setIsAnimating(false), 200);
        } else {
          setDisplayBalance(Math.round(current));
        }
      }, 30);

      prevBalanceRef.current = balance;
      return () => clearInterval(interval);
    }
  }, [balance]);

  return (
    <div
      className="relative flex flex-col group cursor-pointer"
      style={{
        contain: 'layout style',
        minWidth: '4.5rem',
      }}
    >
      {/* HUD Capsule Background */}
      <div className="absolute -inset-x-2 -inset-y-1 bg-primary/5 rounded-full blur-sm group-hover:bg-primary/10 transition-colors" />

      {/* Main Balance - Text Only */}
      <div className="relative flex items-baseline gap-1">
        <motion.span
          className="text-sm font-bold text-foreground tabular-nums drop-shadow-[0_0_8px_rgba(185,100,50,0.3)]"
          style={{ fontVariantNumeric: 'tabular-nums' }}
          animate={isAnimating ? {
            color: ['hsl(var(--foreground))', 'hsl(var(--primary))', 'hsl(var(--foreground))'],
            scale: [1, 1.05, 1],
          } : {}}
          transition={{ duration: 0.3 }}
        >
          {displayBalance.toLocaleString()}
        </motion.span>
        <div className="flex flex-col">
          <span className="text-[9px] text-primary font-bold tracking-tight leading-none">
            AC
          </span>
          {multiplier > 1 && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[8px] text-accent font-bold leading-none"
            >
              x{multiplier}
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ACCounter;
