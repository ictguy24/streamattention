import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle, Sparkles, Wand2, Clock3, Rocket } from "lucide-react";
import MediaUploader from "../create/MediaUploader";
import VideoRecorder from "../create/VideoRecorder";
import MediaEditor, { EditedMediaOutput } from "../create/MediaEditor";
import PublishFlow from "../create/PublishFlow";
import { useToast } from "@/hooks/use-toast";
import { useCreatePost } from "@/hooks/usePosts";

type CreateStep = "select" | "record" | "edit" | "publish" | "success";

interface MediaState {
  file: File | null;
  blob: Blob | null;
  type: "image" | "video";
  url: string;
}

const CreateTab = () => {
  const { toast } = useToast();
  const { createPost, isUploading, uploadProgress } = useCreatePost();
  const [step, setStep] = useState<CreateStep>("select");
  const [media, setMedia] = useState<MediaState | null>(null);
  const [editedMedia, setEditedMedia] = useState<EditedMediaOutput | null>(null);

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

  const handleEditSave = (edited: EditedMediaOutput) => {
    setEditedMedia(edited);
    setStep("publish");
  };

  const handlePublish = async (data: { 
    caption: string; 
    destination: string[]; 
    visibility: string;
    hashtags: string[];
    coverImageFile?: File;
  }) => {
    if (!media && !editedMedia) return;

    const result = await createPost({
      contentType: editedMedia?.type || media?.type || 'video',
      description: data.caption,
      mediaFile: media?.file || media?.blob || undefined,
      coverImageFile: data.coverImageFile,
      musicFile: editedMedia?.musicFile,
      musicLibraryId: editedMedia?.musicLibraryId,
      musicVolume: editedMedia?.musicVolume,
      originalVolume: editedMedia?.originalVolume,
      hashtags: data.hashtags,
      isPublic: data.visibility === 'public',
      destinations: data.destination,
    });

    if (result.success) {
      setStep("success");
      setTimeout(() => {
        toast({
          title: "Posted successfully! 🎉",
          description: "Your content is now live and earning AC",
        });
        resetCreate();
      }, 2000);
    } else {
      toast({
        title: "Upload failed",
        description: result.error || "Please try again",
        variant: "destructive",
      });
    }
  };

  const resetCreate = () => {
    if (media?.url) URL.revokeObjectURL(media.url);
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
            <div className="mb-6 rounded-2xl border border-border/40 bg-card/60 p-5 backdrop-blur-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary/80 mb-2">Creator Studio</p>
                  <h2 className="text-2xl font-bold text-foreground mb-1">Make something worth replaying</h2>
                  <p className="text-sm text-muted-foreground">
                    Upload, edit, and publish in minutes. Built for short-form consistency.
                  </p>
                </div>
                <motion.div
                  className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-muted/20 px-2 py-2 text-center">
                  <Clock3 className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground">Fast flow</p>
                </div>
                <div className="rounded-xl bg-muted/20 px-2 py-2 text-center">
                  <Wand2 className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground">Auto polish</p>
                </div>
                <div className="rounded-xl bg-muted/20 px-2 py-2 text-center">
                  <Rocket className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground">Publish ready</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <MediaUploader onMediaSelect={handleMediaSelect} />

              <motion.button
                className="w-full py-4 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep("record")}
              >
                <Camera className="w-6 h-6 text-secondary" />
                <span className="font-semibold text-secondary">Record with Camera</span>
              </motion.button>
            </div>

            <div className="mt-auto pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl p-4 border border-border/40 bg-card/40">
                <p className="text-sm font-semibold text-foreground mb-1">Earning insight</p>
                <p className="text-xs text-muted-foreground">
                  Posts with clear hooks in first 3 seconds tend to convert better.
                </p>
              </div>
              <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">AC</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Earn while you create</p>
                  <p className="text-sm text-muted-foreground">Verified engagement updates your balance automatically.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "record" && <VideoRecorder onRecordComplete={handleRecordComplete} onClose={() => setStep("select")} />}
        
        {step === "edit" && media && <MediaEditor media={media} onSave={handleEditSave} onClose={resetCreate} />}
        
        {step === "publish" && editedMedia && (
          <PublishFlow 
            media={editedMedia} 
            onPublish={handlePublish} 
            onClose={() => setStep("edit")}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        )}

        {step === "success" && (
          <motion.div key="success" className="flex-1 flex flex-col items-center justify-center px-6" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div className="p-6 rounded-full bg-green-500/20 mb-6" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5 }}>
              <CheckCircle className="w-16 h-16 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Posted!</h2>
            <p className="text-muted-foreground text-center">Your content is live and ready to earn AC</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CreateTab;
