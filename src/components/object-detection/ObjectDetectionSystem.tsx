import { useState, useCallback } from "react";
import { ObjectDetectionCanvas } from "./ObjectDetectionCanvas";
import { DetectionStats } from "./DetectionStats";
import { ControlPanel } from "./ControlPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
  timestamp?: number;
}

export const ObjectDetectionSystem = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [fps, setFps] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [lastDetectionCount, setLastDetectionCount] = useState(0);

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
    
    // Trigger sparkle animation for new detections
    if (newDetections.length > lastDetectionCount) {
      // Optional: Add sound or visual effect here
      setLastDetectionCount(newDetections.length);
    } else if (newDetections.length < lastDetectionCount) {
      setLastDetectionCount(newDetections.length);
    }
    
    setDetections(detectionsWithTimestamp);
    setFps(currentFps);
  }, [lastDetectionCount]);

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
    <>
      <AnimatePresence>
        {showWelcome && (
          <WelcomeScreen onStart={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="container flex h-16 items-center justify-between px-4">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="relative"
              >
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                  <span className="text-2xl">🤖</span>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-4 h-4 text-accent" />
                </motion.div>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
                  Lovable Object Detector
                </h1>
                <p className="text-xs text-muted-foreground">Your AI Vision Buddy</p>
              </div>
            </motion.div>
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
            <p className="text-muted-foreground text-lg flex items-center justify-center gap-2 flex-wrap">
              <span>✨ AI-powered vision using TensorFlow.js</span>
              <span className="hidden sm:inline">•</span>
              <span>Real-time object detection magic 🎯</span>
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
              <div className="gradient-card p-6 rounded-2xl border border-border shadow-card hover-lift">
                <div className="flex items-center gap-2 mb-4">
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    📹
                  </motion.span>
                  <h2 className="text-xl font-semibold text-foreground">Live Video Feed</h2>
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-auto flex items-center gap-2 text-sm text-primary"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span>Live</span>
                    </motion.div>
                  )}
                </div>
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
                <div className="flex items-center gap-2 mb-4">
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    📊
                  </motion.span>
                  <h2 className="text-xl font-semibold text-foreground">Detection Analytics</h2>
                </div>
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
            <div className="gradient-card p-6 rounded-2xl border border-border text-center hover-lift">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="flex items-center justify-center gap-2 mb-3"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-muted-foreground text-sm">
                  Powered by TensorFlow.js • COCO-SSD Model • Real-time Computer Vision
                </p>
                <Sparkles className="w-4 h-4 text-accent" />
              </motion.div>
              <p className="text-muted-foreground text-xs mb-2">
                Built with ❤️ using React, TypeScript, Tailwind CSS & Framer Motion
              </p>
              <p className="text-xs text-primary/60">Made to be Lovable ✨</p>
            </div>
          </motion.footer>
        </div>
      </div>
    </>
  );
};