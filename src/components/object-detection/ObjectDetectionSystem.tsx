import { useState, useCallback } from "react";
import { ObjectDetectionCanvas } from "./ObjectDetectionCanvas";
import { DetectionStats } from "./DetectionStats";
import { ControlPanel } from "./ControlPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
  timestamp?: number;
}

export const ObjectDetectionSystem = () => {
  const [isActive, setIsActive] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [fps, setFps] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const handleToggleCamera = useCallback(() => {
    setIsActive(prev => !prev);
    if (!isActive) {
      // Reset stats when starting
      setDetections([]);
      setFps(0);
    }
  }, [isActive]);

  const handleDetection = useCallback((newDetections: Detection[], currentFps: number) => {
    const detectionsWithTimestamp = newDetections.map(d => ({
      ...d,
      timestamp: Date.now()
    }));
    setDetections(detectionsWithTimestamp);
    setFps(currentFps);
  }, []);

  const handleCaptureImage = useCallback(() => {
    // Trigger capture from canvas component
    if (typeof (window as any).captureImage === 'function') {
      (window as any).captureImage();
    }
  }, []);

  const handleImageCaptured = useCallback((imageData: string) => {
    setCapturedImages(prev => [imageData, ...prev].slice(0, 10)); // Keep last 10 images
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-lg gradient-primary"
            />
            <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
              Real-Time Object Detector
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto p-4 mt-4">
        {/* Subtitle */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <p className="text-muted-foreground text-lg">
            AI-powered computer vision system using TensorFlow.js COCO-SSD
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Feed */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="gradient-card p-6 rounded-lg border border-border shadow-card">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Live Video Feed</h2>
              <ObjectDetectionCanvas
                isActive={isActive}
                onDetection={handleDetection}
                onCapture={handleImageCaptured}
              />
            </div>
          </motion.div>

          {/* Side Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Controls */}
            <ControlPanel
              isActive={isActive}
              onToggleCamera={handleToggleCamera}
              onCaptureImage={handleCaptureImage}
              capturedImages={capturedImages}
            />

            {/* Statistics */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-foreground">Detection Analytics</h2>
              <DetectionStats
                detections={detections}
                fps={fps}
                isActive={isActive}
              />
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pb-8"
        >
          <div className="gradient-card p-6 rounded-lg border border-border text-center">
            <p className="text-muted-foreground text-sm mb-2">
              Powered by TensorFlow.js • COCO-SSD Model • Real-time Computer Vision
            </p>
            <p className="text-muted-foreground text-xs">
              Built with React, TypeScript, Tailwind CSS & Framer Motion
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
};