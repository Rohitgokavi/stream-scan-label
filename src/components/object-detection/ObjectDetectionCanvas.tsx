import { useEffect, useRef, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { toast } from "sonner";
import { getObjectEmoji } from "@/utils/objectEmojis";

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

interface ObjectDetectionCanvasProps {
  isActive: boolean;
  onDetection: (detections: Detection[], fps: number) => void;
  onCapture: (imageData: string) => void;
}

export const ObjectDetectionCanvas = ({ 
  isActive, 
  onDetection, 
  onCapture 
}: ObjectDetectionCanvasProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const animationFrameRef = useRef<number>();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);
  const fpsRef = useRef(0);

  // Initialize TensorFlow.js and load model
  useEffect(() => {
    const initializeModel = async () => {
      try {
        await tf.ready();
        toast("Loading AI model...");
        const model = await cocoSsd.load();
        modelRef.current = model;
        setIsModelLoaded(true);
        toast("AI model loaded successfully!");
      } catch (err) {
        const errorMsg = "Failed to load AI model";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error(err);
      }
    };

    initializeModel();
    
    return () => {
      if (modelRef.current) {
        modelRef.current = null;
      }
    };
  }, []);

  // Setup webcam
  const setupWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && canvasRef.current) {
            const { videoWidth, videoHeight } = videoRef.current;
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
          }
        };
        
        toast("Camera connected successfully!");
      }
    } catch (err) {
      const errorMsg = "Failed to access webcam";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error(err);
    }
  }, []);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  // Draw bounding boxes and labels with emojis
  const drawDetections = useCallback((ctx: CanvasRenderingContext2D, detections: Detection[]) => {
    detections.forEach((detection) => {
      const [x, y, width, height] = detection.bbox;
      const { class: className, score } = detection;
      
      // Set stroke style based on confidence with softer colors
      const confidence = score;
      let strokeColor: string;
      if (confidence > 0.7) strokeColor = "hsl(150, 70%, 60%)"; // Soft green
      else if (confidence > 0.5) strokeColor = "hsl(40, 90%, 60%)"; // Soft yellow
      else strokeColor = "hsl(10, 85%, 65%)"; // Soft red
      
      // Draw rounded bounding box
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.setLineDash([]);
      
      // Draw with rounded corners
      const radius = 8;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      
      // Add glow effect
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Get emoji for object
      const emoji = getObjectEmoji(className);
      
      // Draw label background with rounded corners
      const label = `${emoji} ${className} ${(confidence * 100).toFixed(0)}%`;
      ctx.font = "bold 15px Inter, sans-serif";
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width + 20;
      const textHeight = 28;
      const labelRadius = 10;
      
      // Draw rounded label background
      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.moveTo(x + labelRadius, y - textHeight);
      ctx.lineTo(x + textWidth - labelRadius, y - textHeight);
      ctx.quadraticCurveTo(x + textWidth, y - textHeight, x + textWidth, y - textHeight + labelRadius);
      ctx.lineTo(x + textWidth, y - labelRadius);
      ctx.quadraticCurveTo(x + textWidth, y, x + textWidth - labelRadius, y);
      ctx.lineTo(x + labelRadius, y);
      ctx.quadraticCurveTo(x, y, x, y - labelRadius);
      ctx.lineTo(x, y - textHeight + labelRadius);
      ctx.quadraticCurveTo(x, y - textHeight, x + labelRadius, y - textHeight);
      ctx.closePath();
      ctx.fill();
      
      // Add shadow to label
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      
      // Draw label text
      ctx.fillStyle = "hsl(250, 24%, 9%)";
      ctx.fillText(label, x + 10, y - 9);
    });
  }, []);

  // Main detection loop
  const detectObjects = useCallback(async () => {
    if (!isActive || !isModelLoaded || !modelRef.current || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectObjects);
      return;
    }

    try {
      // Clear canvas and draw video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Perform object detection
      const predictions = await modelRef.current.detect(video);
      
      // Convert predictions to our Detection format
      const detections: Detection[] = predictions.map(prediction => ({
        bbox: prediction.bbox,
        class: prediction.class,
        score: prediction.score
      }));
      
      // Draw detections
      drawDetections(ctx, detections);
      
      // Calculate FPS
      frameCountRef.current++;
      const now = performance.now();
      if (now - lastTimeRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }
      
      // Notify parent component
      onDetection(detections, fpsRef.current);
      
    } catch (err) {
      console.error("Detection error:", err);
    }
    
    animationFrameRef.current = requestAnimationFrame(detectObjects);
  }, [isActive, isModelLoaded, onDetection, drawDetections]);

  // Handle capture image
  const handleCapture = useCallback(() => {
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL("image/png");
      onCapture(imageData);
      toast("Image captured!");
    }
  }, [onCapture]);

  // Start/stop detection based on isActive
  useEffect(() => {
    if (isActive && isModelLoaded) {
      setupWebcam();
      detectObjects();
    } else {
      stopWebcam();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, isModelLoaded, setupWebcam, stopWebcam, detectObjects]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  // Handle uploaded image
  const processUploadedImage = useCallback(async (imageData: string) => {
    if (!modelRef.current || !canvasRef.current || !imageRef.current) return;
    
    setUploadedImage(imageData);
    imageRef.current.src = imageData;
    
    imageRef.current.onload = async () => {
      if (!canvasRef.current || !imageRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      canvas.width = imageRef.current.width;
      canvas.height = imageRef.current.height;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imageRef.current, 0, 0);
      
      try {
        const predictions = await modelRef.current!.detect(imageRef.current);
        const detections: Detection[] = predictions.map(prediction => ({
          bbox: prediction.bbox,
          class: prediction.class,
          score: prediction.score
        }));
        
        drawDetections(ctx, detections);
        onDetection(detections, 0);
      } catch (err) {
        console.error("Detection error:", err);
      }
    };
  }, [onDetection, drawDetections]);

  // Expose capture function to parent
  useEffect(() => {
    (window as any).captureImage = handleCapture;
    (window as any).processUploadedImage = processUploadedImage;
  }, [handleCapture, processUploadedImage]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 gradient-card rounded-lg border border-border">
        <div className="text-center">
          <div className="text-destructive text-lg font-semibold mb-2">Error</div>
          <div className="text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />
      <img
        ref={imageRef}
        className="hidden"
        alt="Uploaded for detection"
      />
      <canvas
        ref={canvasRef}
        className="w-full h-auto gradient-card rounded-lg border border-border shadow-card"
        style={{ maxHeight: "480px" }}
      />
      {!isModelLoaded && (
        <div className="absolute inset-0 flex items-center justify-center gradient-card rounded-lg border border-border">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-foreground font-semibold">Loading AI Model...</div>
            <div className="text-muted-foreground text-sm">This may take a moment</div>
          </div>
        </div>
      )}
    </div>
  );
};