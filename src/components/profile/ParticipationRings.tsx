import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParticipationRingsProps {
  score: number; // 0-100
  accountType: "user" | "creator" | "both";
  className?: string;
}

const ParticipationRings = ({ score, accountType, className }: ParticipationRingsProps) => {
  // Calculate ring properties based on score
  const outerProgress = Math.min(score, 100) / 100;
  const middleProgress = Math.min(score * 1.2, 100) / 100;
  const innerProgress = Math.min(score * 0.8, 100) / 100;

  // Account type colors
  const getTypeColor = () => {
    switch (accountType) {
      case "creator":
        return "hsl(var(--secondary))";
      case "both":
        return "hsl(var(--accent))";
      default:
        return "hsl(var(--primary))";
    }
  };

  const typeColor = getTypeColor();

  // Ring configurations
  const rings = [
    { radius: 40, strokeWidth: 4, progress: outerProgress, opacity: 0.3 },
    { radius: 32, strokeWidth: 3, progress: middleProgress, opacity: 0.5 },
    { radius: 24, strokeWidth: 2.5, progress: innerProgress, opacity: 0.8 },
  ];

  return (
    <div className={cn("relative w-24 h-24", className)}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {rings.map((ring, index) => {
          const circumference = 2 * Math.PI * ring.radius;
          const strokeDashoffset = circumference * (1 - ring.progress);

          return (
            <g key={index}>
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r={ring.radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={ring.strokeWidth}
                className="text-muted/20"
              />
              {/* Progress ring */}
              <motion.circle
                cx="50"
                cy="50"
                r={ring.radius}
                fill="none"
                stroke={typeColor}
                strokeWidth={ring.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ 
                  duration: 1.5, 
                  delay: index * 0.2,
                  ease: "easeOut" 
                }}
                style={{ opacity: ring.opacity }}
              />
            </g>
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <motion.span 
          className="text-lg font-bold text-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {score}
        </motion.span>
        <span className="text-[8px] text-muted-foreground uppercase tracking-wider">
          {accountType === "both" ? "Dual" : accountType}
        </span>
      </div>

      {/* Subtle pulse animation for high scores */}
      {score > 80 && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${typeColor}10 0%, transparent 70%)` 
          }}
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
};

export default ParticipationRings;
