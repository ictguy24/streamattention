import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Camera, CheckCircle, Music, Mic, Smile, X } from "lucide-react";
import MediaUploader from "../create/MediaUploader";
import VideoRecorder from "../create/VideoRecorder";
import MediaEditor, { EditedMediaOutput } from "../create/MediaEditor";
import PublishFlow from "../create/PublishFlow";
import { useToast } from "@/hooks/use-toast";
import { useCreatePost } from "@/hooks/usePosts";

type CreateStep = "select" | "record" | "edit" | "publish" | "success" | "tiktok-mode";

interface MediaState {
  file: File | null;
  blob: Blob | null;
  type: "image" | "video";
  url: string;
}

const CreateTab = () => {
  const { toast } = useToast();
  const { createPost, isUploading, uploadProgress } = useCreatePost();
  const [step, setStep] = useState<CreateStep>("tiktok-mode");
  const [media, setMedia] = useState<MediaState | null>(null);
  const [editedMedia, setEditedMedia] = useState<EditedMediaOutput | null>(null);
  const [contentType, setContentType] = useState<'video' | 'photo' | 'text'>('video');
  const [content, setContent] = useState('');
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mock music library - would come from actual music library in real implementation
  const musicLibrary = [
    { id: '1', title: 'Trending Beat #1', artist: 'Unknown Artist', duration: '0:30' },
    { id: '2', title: 'Viral Sound #1', artist: 'Popular Creator', duration: '0:15' },
    { id: '3', title: 'Meme Audio', artist: 'Internet', duration: '0:45' },
  ];

  useEffect(() => {
    if (step === "tiktok-mode" && contentType === 'video' && !media?.url) {
      startCamera();
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopCamera();
    };
  }, [step, contentType]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: true 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = () => {
    if (recording) return;
    
    setRecording(true);
    setDuration(0);
    
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (!recording) return;
    
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Capture frame from video
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        canvasRef.current.toBlob(blob => {
          if (blob) {
            const file = new File([blob], `recording_${Date.now()}.webm`, { type: 'video/webm' });
            const url = URL.createObjectURL(file);
            setMedia({ file, blob, type: 'video', url });
            setStep('edit');
          }
        }, 'video/webm');
      }
    }
  };

  const handleMediaSelect = (file: File, type: "image" | "video") => {
    const url = URL.createObjectURL(file);
    setMedia({ file, blob: null, type: type as "image" | "video", url });
    setStep("edit");
  };

  const handleFileChange = (file: File, type: 'photo' | 'video') => {
    const url = URL.createObjectURL(file);
    setMedia({ file, blob: null, type, url });
    setStep(type === 'video' ? 'edit' : 'edit');
  };

  const clearMedia = () => {
    if (media?.url) URL.revokeObjectURL(media.url);
    setMedia(null);
    if (step === "tiktok-mode" && contentType === 'video') {
      startCamera();
    }
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
    setStep("tiktok-mode");
    setDuration(0);
    setContent('');
    if (contentType === 'video') {
      startCamera();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <motion.div
      className="flex flex-col min-h-[calc(100vh-8rem)]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {step === "tiktok-mode" && (
          <motion.div
            key="tiktok-mode"
            className="fixed inset-0 bg-black z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center p-4 bg-black bg-opacity-50 z-10">
              <button 
                onClick={() => setContentType('text')}
                className={`px-4 py-2 rounded-full ${contentType === 'text' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
              >
                Text
              </button>
              <button 
                onClick={() => setContentType('photo')}
                className={`px-4 py-2 rounded-full ${contentType === 'photo' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
              >
                Photo
              </button>
              <button 
                onClick={() => setContentType('video')}
                className={`px-4 py-2 rounded-full ${contentType === 'video' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
              >
                Video
              </button>
              <button 
                type="button" 
                onClick={() => media ? setStep('edit') : {}}
                disabled={!media}
                className={`px-6 py-2 rounded-full ${media ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                Next
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden">
              {contentType === 'video' && (
                <div className="relative w-full h-full">
                  {!media?.url ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {/* Recording Controls Overlay */}
                      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                        <div className="flex items-center space-x-8">
                          <button 
                            onClick={() => setShowMusicPicker(!showMusicPicker)}
                            className="p-3 rounded-full bg-black bg-opacity-30"
                          >
                            <Music className="h-6 w-6 text-white" />
                          </button>
                          
                          <button
                            onMouseDown={startRecording}
                            onMouseUp={stopRecording}
                            onTouchStart={startRecording}
                            onTouchEnd={stopRecording}
                            className={`w-20 h-20 rounded-full flex items-center justify-center ${
                              recording 
                                ? 'bg-red-500 animate-pulse' 
                                : 'border-4 border-white'
                            }`}
                          >
                            {recording && (
                              <span className="text-white font-bold">{formatTime(duration)}</span>
                            )}
                          </button>
                          
                          <button className="p-3 rounded-full bg-black bg-opacity-30">
                            <Camera className="h-6 w-6 text-white" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={media.url}
                        controls
                        className="w-full h-full object-contain"
                      />
                      <button 
                        onClick={clearMedia}
                        className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full"
                      >
                        <X className="h-6 w-6 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {contentType === 'photo' && (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  {media?.url ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={media.url} 
                        alt="Preview" 
                        className="w-full h-full object-contain" 
                      />
                      <button 
                        onClick={clearMedia}
                        className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full"
                      >
                        <X className="h-6 w-6 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <div className="mb-6">
                        <Camera className="h-16 w-16 text-white mx-auto" />
                      </div>
                      <MediaUploader onMediaSelect={(file, type) => handleFileChange(file, 'photo')} />
                    </div>
                  )}
                </div>
              )}

              {contentType === 'text' && (
                <div className="p-4 h-full flex flex-col">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's happening?"
                    className="w-full flex-1 p-4 text-white bg-transparent text-lg resize-none placeholder-gray-400 focus:outline-none"
                    autoFocus
                  />
                  
                  <div className="mt-4 flex space-x-4">
                    <button className="p-2 rounded-full bg-gray-800">
                      <Smile className="h-6 w-6 text-white" />
                    </button>
                    <button className="p-2 rounded-full bg-gray-800">
                      <Mic className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </div>
              )}

              {/* Music Picker Overlay */}
              {showMusicPicker && (
                <div className="absolute inset-0 bg-black bg-opacity-90 z-20 p-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Add Music</h3>
                    <button 
                      onClick={() => setShowMusicPicker(false)}
                      className="text-gray-400"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {musicLibrary.map((track) => (
                      <div 
                        key={track.id}
                        className={`p-4 rounded-lg cursor-pointer ${
                          selectedMusic === track.id 
                            ? 'bg-pink-500' 
                            : 'bg-gray-800'
                        }`}
                        onClick={() => setSelectedMusic(track.id)}
                      >
                        <div className="font-medium text-white">{track.title}</div>
                        <div className="text-sm text-gray-300">{track.artist} • {track.duration}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="p-4 bg-black bg-opacity-70">
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => setStep("select")}
                  className="px-4 py-2 bg-gray-700 text-white rounded-full"
                >
                  More Options
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "select" && (
          <motion.div
            key="select"
            className="flex-1 flex flex-col px-6 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="text-center mb-8">
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-neon mx-auto mb-4 flex items-center justify-center neon-glow"
                animate={{ boxShadow: ["0 0 20px hsl(185 100% 50% / 0.5)", "0 0 40px hsl(185 100% 50% / 0.8)", "0 0 20px hsl(185 100% 50% / 0.5)"] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Video className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Create Content</h2>
              <p className="text-muted-foreground">Share your moments and earn AC</p>
            </div>

            <MediaUploader onMediaSelect={handleMediaSelect} />

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <motion.button
              className="w-full py-4 rounded-2xl bg-secondary/10 border border-secondary/30 flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep("record")}
            >
              <Camera className="w-6 h-6 text-secondary" />
              <span className="font-semibold text-secondary">Record Video</span>
            </motion.button>

            <div className="mt-auto pt-6">
              <div className="glass-card rounded-xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">AC</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Earn while you create</p>
                  <p className="text-sm text-muted-foreground">Get Attention Credits when others watch and engage with your content</p>
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
