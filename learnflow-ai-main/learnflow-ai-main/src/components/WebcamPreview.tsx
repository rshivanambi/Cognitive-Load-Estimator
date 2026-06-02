import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';
import { Button } from '@/components/ui/button';
import { EmotionScores } from '@/lib/ai-logic';

interface Props {
  onFrame?: () => void;
  onEmotions?: (emotions: EmotionScores) => void;
}

export default function WebcamPreview({ onFrame, onEmotions }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);

  // Load models on first activation
  useEffect(() => {
    if (active && !modelsLoaded && !loadingModels) {
      setLoadingModels(true);
      const loadModels = async () => {
        try {
          const MODEL_URL = '/models';
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          ]);
          setModelsLoaded(true);
          setLoadingModels(false);
        } catch (err) {
          console.error('Error loading face-api models:', err);
          setError(true);
          setLoadingModels(false);
        }
      };
      loadModels();
    }
  }, [active, modelsLoaded, loadingModels]);

  useEffect(() => {
    if (!active || !modelsLoaded) return;
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 240, frameRate: 15 } 
        });
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        setError(true);
      }
    };

    startCamera();

    // Emotion detection loop
    detectionInterval.current = setInterval(async () => {
      onFrame?.();
      
      if (videoRef.current && videoRef.current.readyState === 4) {
        try {
          const detections = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          if (detections && onEmotions) {
            onEmotions(detections.expressions as any);
          }
        } catch (err) {
          console.error("Detection error:", err);
        }
      }
    }, 1000); // Check every second to balance performance

    return () => {
      if (detectionInterval.current) clearInterval(detectionInterval.current);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active, modelsLoaded, onFrame, onEmotions]);

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b">
        <span className="text-sm font-semibold flex items-center gap-2">
          <Camera className="w-4 h-4" /> Webcam Monitor
        </span>
        <div className="flex items-center gap-2">
          {loadingModels && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Loading AI
            </span>
          )}
          <Button
            size="sm"
            variant={active ? 'destructive' : 'default'}
            className={!active ? 'gradient-primary text-primary-foreground border-0' : ''}
            onClick={() => {
              setActive(!active);
              setError(false);
            }}
          >
            {active ? <CameraOff className="w-3.5 h-3.5 mr-1" /> : <Camera className="w-3.5 h-3.5 mr-1" />}
            {active ? 'Stop' : 'Start'}
          </Button>
        </div>
      </div>
      <div className="aspect-video bg-foreground/5 flex items-center justify-center relative">
        {active && !error ? (
          <>
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!modelsLoaded && (
               <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4">
                 <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                 <p className="text-xs font-medium">Initializing AI Emotion Tracking...</p>
               </div>
            )}
          </>
        ) : error ? (
          <p className="text-sm text-muted-foreground">Camera or AI unavailable</p>
        ) : (
          <div className="text-center text-muted-foreground">
            <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs px-4">Enable webcam for real-time cognitive load detection</p>
          </div>
        )}
        {active && modelsLoaded && !error && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-foreground/70 text-background text-xs px-2 py-1 rounded-full">
            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse-glow" />
            AI ACTIVE
          </div>
        )}
      </div>
    </div>
  );
}
