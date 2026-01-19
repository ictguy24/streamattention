import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { activateBooster } from "./BoosterEngine";
import { toast } from "sonner";

export default function BoosterStore() {
  const handleActivate = () => {
    activateBooster();
    toast.success("Booster activated! +1.2 UPS");
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleActivate}
      className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium"
    >
      <Zap className="w-5 h-5" />
      Activate Booster
    </motion.button>
  );
}
