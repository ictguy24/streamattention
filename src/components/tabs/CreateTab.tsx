import { motion } from "framer-motion";
import { Upload, Video, Scissors, Send } from "lucide-react";

const features = [
  { icon: Upload, label: "Upload", desc: "From device" },
  { icon: Video, label: "Record", desc: "In-app" },
  { icon: Scissors, label: "Edit", desc: "Trim & filters" },
  { icon: Send, label: "Publish", desc: "Share content" },
];

const CreateTab = () => {
  return (
    <motion.div
      className="flex flex-col items-center min-h-[60vh] px-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <motion.div
        className="w-24 h-24 rounded-full bg-gradient-neon flex items-center justify-center mb-6 neon-glow"
        animate={{ 
          boxShadow: [
            "0 0 20px hsl(185 100% 50% / 0.5)",
            "0 0 40px hsl(185 100% 50% / 0.8)",
            "0 0 20px hsl(185 100% 50% / 0.5)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Video className="w-10 h-10 text-primary-foreground" />
      </motion.div>

      <h2 className="text-2xl font-bold text-foreground mb-2">Create</h2>
      <p className="text-muted-foreground text-center mb-8 max-w-xs">
        Upload, record, and edit your content. Coming in Phase 4!
      </p>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {features.map((feature, index) => (
          <motion.div
            key={feature.label}
            className="glass-card p-4 rounded-xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
          >
            <feature.icon className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="font-medium text-foreground">{feature.label}</p>
            <p className="text-xs text-muted-foreground">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CreateTab;
