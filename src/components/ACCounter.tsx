import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ACCounterProps {
  balance: number;
  multiplier?: number;
  earnedThisSession?: number;
}

const ACCounter = ({ balance, multiplier = 1, earnedThisSession = 0 }: ACCounterProps) => {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [isAnimating, setIsAnimating] = useState(false);
  const [recentEarned, setRecentEarned] = useState(0);
  const prevBalanceRef = useRef(balance);

  useEffect(() => {
    if (balance !== prevBalanceRef.current) {
      const diff = balance - prevBalanceRef.current;
      
      if (diff > 0) {
        setIsAnimating(true);
        setRecentEarned(prev => prev + diff);
        
        // Clear recent earned after 3s
        setTimeout(() => setRecentEarned(0), 3000);
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
      className="relative flex flex-col"
      style={{ 
        contain: 'layout style',
        minWidth: '4.5rem',
      }}
    >
      {/* Main Balance - Text Only */}
      <div className="flex items-baseline gap-1">
        <motion.span
          className="text-base font-bold text-foreground tabular-nums"
          style={{ fontVariantNumeric: 'tabular-nums' }}
          animate={isAnimating ? { 
            color: ['hsl(var(--foreground))', 'hsl(var(--primary))', 'hsl(var(--foreground))']
          } : {}}
          transition={{ duration: 0.3 }}
        >
          {displayBalance.toLocaleString()}
        </motion.span>
        <span className="text-[10px] text-primary font-semibold">
          AC
          {multiplier > 1 && (
            <span className="text-accent ml-0.5">x{multiplier}</span>
          )}
        </span>
      </div>

      {/* AC Earned Subtitle */}
      <AnimatePresence>
        {recentEarned > 0 && (
          <motion.span
            className="text-[9px] text-primary/80 absolute -bottom-3 left-0"
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
          >
            +{recentEarned}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ACCounter;
