import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Camera, CheckCircle } from "lucide-react";
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
  const { createPost, isUploading, uploadProgress, resetUpload } = useCreatePost();
  const [step, setStep] = useState<CreateStep>("select");
  const [media, setMedia] = useState<MediaState | null>(null);
  const [editedMedia, setEditedMedia] = useState<EditedMediaOutput | null>(null);

  // Persistence: Check for unfinished drafts on mount (simple example)
  useEffect(() => {
    const savedDraft = localStorage.getItem('create_draft_hint');
    if (savedDraft) {
      // We could prompt the user to resume
      console.log("Draft hint found");
    }
  }, []);

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
        resetUpload(); // Reset upload state after success message
        resetCreate();
      }, 2000);
    } else {
      resetUpload(); // Reset upload state on failure
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
            className="flex-1 flex flex-col px-6 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Studio Header */}
            <div className="relative mb-10 text-center">
              <motion.div
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <h1 className="text-3xl font-black text-foreground tracking-tighter mb-2 italic">STUDIO_MODE</h1>
              <div className="flex items-center justify-center gap-2">
                <span className="h-px w-8 bg-primary/50" />
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Create & Earn AC</p>
                <span className="h-px w-8 bg-primary/50" />
              </div>
            </div>

            {/* Main Creative Options */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {/* Record Live Card */}
              <motion.button
                className="group relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-secondary/20 to-transparent border border-white/10 hover:border-secondary/50 transition-all text-left"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep("record")}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -z-10 group-hover:bg-secondary/20 transition-colors" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center border border-secondary/30">
                    <Camera className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-[8px] font-bold text-secondary uppercase">Recommended</div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">Capture Moment</h3>
                <p className="text-xs text-muted-foreground">High-quality video recorder with filters</p>
              </motion.button>

              {/* Upload Card */}
              <div className="grid grid-cols-2 gap-4">
                <MediaUploader onMediaSelect={handleMediaSelect} variant="compact" />

                <motion.button
                  className="group relative overflow-hidden rounded-3xl p-5 bg-white/5 border border-white/10 hover:border-primary/50 transition-all text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1">AI Create</h3>
                  <p className="text-[10px] text-muted-foreground">Generate from text</p>
                </motion.button>
              </div>
            </div>

            {/* Activity Hint */}
            <div className="mt-auto">
              <div className="glass-card rounded-2xl p-4 flex items-center gap-4 bg-primary/5 border-primary/20">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  <span className="text-primary font-bold">1.2K creators</span> are live right now earning AC.
                </p>
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
