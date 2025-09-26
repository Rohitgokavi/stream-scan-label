import { useState, useCallback } from "react";
import { ObjectDetectionCanvas } from "./ObjectDetectionCanvas";
import { DetectionStats } from "./DetectionStats";
import { ControlPanel } from "./ControlPanel";

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
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
    setDetections(newDetections);
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            Real-Time Object Detection
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered computer vision system using TensorFlow.js COCO-SSD
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Feed */}
          <div className="lg:col-span-2">
            <div className="gradient-card p-6 rounded-lg border border-border shadow-card">
              <h2 className="text-xl font-semibold mb-4 text-foreground">Live Video Feed</h2>
              <ObjectDetectionCanvas
                isActive={isActive}
                onDetection={handleDetection}
                onCapture={handleImageCaptured}
              />
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
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
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-muted-foreground text-sm">
          <p>
            Powered by TensorFlow.js • COCO-SSD Model • Real-time Computer Vision
          </p>
        </div>
      </div>
    </div>
  );
};