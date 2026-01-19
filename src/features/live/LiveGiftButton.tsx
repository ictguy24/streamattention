import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { sendGift } from "./LiveGiftEngine";
import { toast } from "sonner";

export default function LiveGiftButton() {
  const handleGift = () => {
    sendGift();
    toast.success("Gift sent! +0.6 UPS");
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
