import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Upload, Camera, Sparkles, CheckCircle } from "lucide-react";
import MediaUploader from "../create/MediaUploader";
import VideoRecorder from "../create/VideoRecorder";
import MediaEditor from "../create/MediaEditor";
import PublishFlow from "../create/PublishFlow";
import { useToast } from "@/hooks/use-toast";

type CreateStep = "select" | "record" | "edit" | "publish" | "success";

interface MediaState {
  file: File | null;
  blob: Blob | null;
  type: "image" | "video";
  url: string;
}

interface EditedMedia {
  url: string;
  type: "image" | "video";
  filters: string;
}

const CreateTab = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<CreateStep>("select");
  const [media, setMedia] = useState<MediaState | null>(null);
  const [editedMedia, setEditedMedia] = useState<EditedMedia | null>(null);

  const handleMediaSelect = (file: File, type: "image" | "video") => {
    const url = URL.createObjectURL(file);
    setMedia({ file, blob: null, type, url });
    setStep("edit");
  };

  const handleRecordComplete = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setMedia({ file: null, blob, type: "video", url });
    setStep("edit");
  };

  const handleEditSave = (edited: { url: string; type: "image" | "video"; filters: string }) => {
    setEditedMedia(edited);
    setStep("publish");
  };

  const handlePublish = (data: { caption: string; destination: string[]; visibility: string }) => {
    console.log("Publishing:", data);
    setStep("success");
    
    // Reset after showing success
    setTimeout(() => {
      toast({
        title: "Posted successfully! 🎉",
        description: "Your content is now live and earning AC",
      });
      resetCreate();
    }, 2000);
  };

  const resetCreate = () => {
    if (media?.url) {
      URL.revokeObjectURL(media.url);
    }
    setMedia(null);
    setEditedMedia(null);
    setStep("select");
  };

  return (
    <motion.div
      className="flex flex-col min-h-[calc(100vh-8rem)]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div
            key="select"
            className="flex-1 flex flex-col px-6 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-neon mx-auto mb-4 flex items-center justify-center neon-glow"
                animate={{
                  boxShadow: [
                    "0 0 20px hsl(185 100% 50% / 0.5)",
                    "0 0 40px hsl(185 100% 50% / 0.8)",
                    "0 0 20px hsl(185 100% 50% / 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Video className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Create Content</h2>
              <p className="text-muted-foreground">Share your moments and earn AC</p>
            </div>

            {/* Upload Options */}
            <MediaUploader onMediaSelect={handleMediaSelect} />

            {/* OR Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Record Video Button */}
            <motion.button
              className="w-full py-4 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep("record")}
            >
              <Camera className="w-6 h-6 text-secondary" />
              <span className="font-semibold text-secondary">Record Video</span>
            </motion.button>

            {/* AC Info */}
            <div className="mt-auto pt-6">
              <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Earn while you create</p>
                  <p className="text-sm text-muted-foreground">
                    Get Attention Credits when others watch and engage with your content
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "record" && (
          <VideoRecorder
            onRecordComplete={handleRecordComplete}
            onClose={() => setStep("select")}
          />
        )}

        {step === "edit" && media && (
          <MediaEditor
            media={media}
            onSave={handleEditSave}
            onClose={resetCreate}
          />
        )}

        {step === "publish" && editedMedia && (
          <PublishFlow
            media={editedMedia}
            onPublish={handlePublish}
            onClose={() => setStep("edit")}
          />
        )}

        {step === "success" && (
          <motion.div
            key="success"
            className="flex-1 flex flex-col items-center justify-center px-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="p-6 rounded-full bg-green-500/20 mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Posted!</h2>
            <p className="text-muted-foreground text-center">
              Your content is live and ready to earn AC
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreateTab;
