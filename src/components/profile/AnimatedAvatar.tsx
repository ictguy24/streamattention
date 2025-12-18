import { motion } from "framer-motion";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedAvatarProps {
  imageUrl?: string;
  name?: string;
  isOnline?: boolean;
  isLive?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const AnimatedAvatar = ({ 
  imageUrl, 
  name = "User", 
  isOnline = true, 
  isLive = false,
  size = "lg" 
}: AnimatedAvatarProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  const ringClasses = {
    sm: "p-[2px]",
    md: "p-[2px]",
    lg: "p-[3px]",
    xl: "p-[4px]",
  };

  const statusSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  };

  return (
    <div className="relative">
      {/* Animated Ring */}
      <motion.div
        className={cn(
          "rounded-full",
          ringClasses[size],
          isLive 
            ? "bg-gradient-to-r from-destructive via-accent to-primary" 
            : "bg-gradient-neon"
        )}
        animate={isLive ? {
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 200%" }}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-md opacity-50"
          style={{
            background: isLive 
              ? "linear-gradient(to right, hsl(var(--destructive)), hsl(var(--accent)), hsl(var(--primary)))"
              : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--accent)))",
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Avatar Container */}
        <div className={cn(
          "rounded-full bg-background flex items-center justify-center overflow-hidden",
          sizeClasses[size]
        )}>
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className={cn(
              "text-muted-foreground",
              size === "sm" && "w-6 h-6",
              size === "md" && "w-8 h-8",
              size === "lg" && "w-12 h-12",
              size === "xl" && "w-16 h-16",
            )} />
          )}
        </div>
      </motion.div>

      {/* Status Indicator */}
      <motion.div
        className={cn(
          "absolute bottom-0 right-0 rounded-full border-2 border-background",
          statusSizes[size],
          isLive ? "bg-destructive" : isOnline ? "bg-green-500" : "bg-muted-foreground"
        )}
        animate={isLive ? { scale: [1, 1.2, 1] } : isOnline ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: isLive ? 0.8 : 2, repeat: Infinity }}
      />

      {/* Live Badge */}
      {isLive && (
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-destructive"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <span className="text-[10px] font-bold text-white uppercase">Live</span>
        </motion.div>
      )}
    </div>
  );
};

export default AnimatedAvatar;
