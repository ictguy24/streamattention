import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, Square, Circle, RefreshCw, X, Check, Clock } from "lucide-react";

interface VideoRecorderProps {
  onRecordComplete: (blob: Blob) => void;
  onClose: () => void;
}

const VideoRecorder = ({ onRecordComplete, onClose }: VideoRecorderProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      setIsPreviewing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = URL.createObjectURL(blob);
        videoRef.current.loop = true;
        videoRef.current.play();
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopCamera();
    }
  };

  const retake = () => {
    setIsPreviewing(false);
    setRecordedBlob(null);
    setRecordingTime(0);
    startCamera();
  };

  const confirmRecording = () => {
    if (recordedBlob) {
      onRecordComplete(recordedBlob);
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Video Preview */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted={!isPreviewing}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/90 backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <span className="text-white font-medium">{formatTime(recordingTime)}</span>
          </div>
        )}

        {/* Timer for preview */}
        {isPreviewing && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-background/70 backdrop-blur-sm">
            <Clock className="w-4 h-4 text-foreground" />
            <span className="text-foreground font-medium">{formatTime(recordingTime)}</span>
          </div>
        )}

        {/* Close Button */}
        <motion.button
          className="absolute top-4 left-4 p-3 rounded-full bg-background/50 backdrop-blur-sm"
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
        >
          <X className="w-6 h-6 text-foreground" />
        </motion.button>

        {/* Flip Camera */}
        {!isPreviewing && (
          <motion.button
            className="absolute top-4 right-4 p-3 rounded-full bg-background/50 backdrop-blur-sm"
            whileTap={{ scale: 0.9 }}
            onClick={toggleCamera}
          >
            <RefreshCw className="w-6 h-6 text-foreground" />
          </motion.button>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-background/90 backdrop-blur-xl safe-area-bottom">
        {isPreviewing ? (
          <div className="flex items-center justify-center gap-8">
            <motion.button
              className="p-4 rounded-full bg-muted"
              whileTap={{ scale: 0.9 }}
              onClick={retake}
            >
              <RefreshCw className="w-8 h-8 text-foreground" />
            </motion.button>
            <motion.button
              className="p-5 rounded-full bg-primary neon-glow"
              whileTap={{ scale: 0.9 }}
              onClick={confirmRecording}
            >
              <Check className="w-10 h-10 text-primary-foreground" />
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <motion.button
              className={`p-2 rounded-full ${
                isRecording ? "bg-destructive" : "bg-foreground"
              }`}
              whileTap={{ scale: 0.9 }}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <Square className="w-12 h-12 text-white" fill="currentColor" />
              ) : (
                <Circle className="w-16 h-16 text-background" />
              )}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VideoRecorder;
