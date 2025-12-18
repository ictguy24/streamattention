import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ACCounterProps {
  balance: number;
  multiplier?: number;
}

const ACCounter = ({ balance, multiplier = 1 }: ACCounterProps) => {
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const prevBalanceRef = useRef(balance);

  useEffect(() => {
    if (balance !== prevBalanceRef.current) {
      const diff = balance - prevBalanceRef.current;
      
      if (diff > 0) {
        setIsAnimating(true);
        
        // Spawn particles for positive change
        const newParticles = Array.from({ length: Math.min(diff, 5) }, (_, i) => ({
          id: Date.now() + i,
          x: (Math.random() - 0.5) * 40,
          y: -20 - Math.random() * 20,
        }));
        setParticles(newParticles);
        setTimeout(() => setParticles([]), 600);
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
    <motion.div
      className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur-md border border-border/50"
      animate={isAnimating ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Icon with micro-pulse on increment */}
      <motion.div
        animate={isAnimating ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.25 }}
      >
        <Sparkles className="w-4 h-4 text-primary" />
      </motion.div>

      {/* Balance - smooth tick */}
      <div className="flex items-baseline gap-1">
        <motion.span
          className="text-base font-bold text-foreground tabular-nums"
          key={displayBalance}
        >
          {displayBalance.toLocaleString()}
        </motion.span>
        <span className="text-xs text-primary font-medium">AC</span>
      </div>

      {/* Multiplier Badge */}
      {multiplier > 1 && (
        <motion.div
          className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          {multiplier}x
        </motion.div>
      )}

      {/* Particle burst - flies towards wallet area */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary"
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 1, 
              opacity: 1 
            }}
            animate={{ 
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ left: "50%", top: "50%" }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default ACCounter;
