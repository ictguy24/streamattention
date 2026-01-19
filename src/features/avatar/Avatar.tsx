import { motion } from "framer-motion"
import { useAttention } from "@/contexts/AttentionContext"

export default function Avatar() {
  const { ups } = useAttention()
  const healthy = ups > 5

  return (
    <motion.div
      animate={{ rotate: healthy ? [0, 5, -5, 0] : 0 }}
      transition={{ repeat: Infinity, duration: 2 }}
      className="relative w-28 h-28 rounded-full overflow-hidden"
    >
      <img
        src="/avatar.png"
        className="w-full h-full object-cover"
      />

      {/* UPS Ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-green-400"
        style={{
          clipPath: `inset(${100 - Math.min(100, ups * 10)}% 0 0 0)`
        }}
      />
    </motion.div>
  )
}
