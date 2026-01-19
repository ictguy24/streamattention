import { motion } from "framer-motion";
import { useAttention } from "@/contexts/AttentionContext";
import { useAuth } from "@/hooks/useAuth";

interface AvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Avatar({ size = "lg", className = "" }: AvatarProps) {
  const { ups } = useAttention();
  const { profile } = useAuth();
  const healthy = ups > 5;

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-28 h-28",
  };

  const avatarUrl = profile?.avatar_url || "/avatar.png";
  const displayName = profile?.display_name || profile?.username || "User";

  return (
    <motion.div
      animate={{ rotate: healthy ? [0, 5, -5, 0] : 0 }}
      transition={{ repeat: Infinity, duration: 2 }}
      className={`relative ${sizeClasses[size]} rounded-full overflow-hidden ${className}`}
    >
      <img
        src={avatarUrl}
        alt={displayName}
        className="w-full h-full object-cover bg-muted"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/avatar.png";
        }}
      />

      {/* UPS Ring - Green when healthy, dims when low */}
      <motion.div
        className={`absolute inset-0 rounded-full border-4 ${
          healthy ? "border-primary" : "border-muted-foreground/30"
        }`}
        style={{
          clipPath: `inset(${100 - Math.min(100, ups * 10)}% 0 0 0)`,
        }}
      />
    </motion.div>
  );
}
