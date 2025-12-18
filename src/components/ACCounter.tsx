import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ACCounterProps {
  balance: number;
  multiplier?: number;
}

const ACCounter = ({ balance, multiplier = 1 }: ACCounterProps) => {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [particles, setParticles] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (balance !== displayBalance) {
      setIsAnimating(true);
      
      // Animate counter
      const diff = balance - displayBalance;
      const steps = Math.min(Math.abs(diff), 20);
      const stepValue = diff / steps;
      let current = displayBalance;
      
      const interval = setInterval(() => {
        current += stepValue;
        if ((diff > 0 && current >= balance) || (diff < 0 && current <= balance)) {
          setDisplayBalance(balance);
          clearInterval(interval);
          setTimeout(() => setIsAnimating(false), 500);
        } else {
          setDisplayBalance(Math.round(current));
        }
      }, 50);

      // Create particles on increase
      if (diff > 0) {
        const newParticles = Array.from({ length: 5 }, (_, i) => Date.now() + i);
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 1000);
      }

      return () => clearInterval(interval);
    }
  }, [balance]);

  return (
    <motion.div
      className="relative flex items-center gap-2 px-4 py-2 rounded-full glass-card"
      animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-glow-pulse" />
      
      {/* Icon */}
      <motion.div
        className="relative z-10"
        animate={isAnimating ? { rotate: [0, 15, -15, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <Sparkles className="w-5 h-5 text-primary" />
      </motion.div>

      {/* Balance */}
      <div className="relative z-10 flex items-baseline gap-1">
        <motion.span
          className="text-lg font-bold text-foreground tabular-nums"
          key={displayBalance}
        >
          {displayBalance.toLocaleString()}
        </motion.span>
        <span className="text-xs text-primary font-medium">AC</span>
      </div>

      {/* Multiplier Badge */}
      {multiplier > 1 && (
        <motion.div
          className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          {multiplier}x
        </motion.div>
      )}

      {/* Particle Effects */}
      <AnimatePresence>
        {particles.map((id) => (
          <motion.div
            key={id}
            className="absolute w-2 h-2 rounded-full bg-ac-burst"
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 1, 
              opacity: 1 
            }}
            animate={{ 
              x: (Math.random() - 0.5) * 60,
              y: -30 - Math.random() * 20,
              scale: 0,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              left: "50%",
              top: "50%",
            }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ACCounter;
