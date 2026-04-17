import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { sendGift } from "./LiveGiftEngine";
import { toast } from "sonner";
import { useAttention } from "@/contexts/AttentionContext";

export default function LiveGiftButton() {
  const { registerAttention } = useAttention();

  const handleGift = () => {
    sendGift(registerAttention);
    toast.success("Gift submitted for verification.");
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleGift}
      className="fixed bottom-24 right-6 p-4 rounded-full bg-accent text-accent-foreground shadow-lg"
    >
      <Gift className="w-6 h-6" />
    </motion.button>
  );
}
