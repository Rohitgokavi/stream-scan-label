import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square, Camera, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRef } from "react";

interface ControlPanelProps {
  isActive: boolean;
  onToggleCamera: () => void;
  onCaptureImage: () => void;
  capturedImages: string[];
}

export const ControlPanel = ({ 
  isActive, 
  onToggleCamera, 
  onCaptureImage,
  capturedImages
}: ControlPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        if (typeof (window as any).processUploadedImage === 'function') {
          (window as any).processUploadedImage(imageData);
        }
        toast("Image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDownloadImage = (imageData: string, index: number) => {
    const link = document.createElement('a');
    link.download = `detection_capture_${Date.now()}_${index}.png`;
    link.href = imageData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast("Image downloaded successfully!");
  };

  const handleDownloadAll = () => {
    capturedImages.forEach((imageData, index) => {
      setTimeout(() => {
        handleDownloadImage(imageData, index);
      }, index * 100); // Stagger downloads
    });
    if (capturedImages.length > 1) {
      toast(`Downloading ${capturedImages.length} images...`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="gradient-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Camera Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={onToggleCamera}
              variant={isActive ? "destructive" : "default"}
              className="w-full h-12 text-base font-semibold transition-smooth shadow-glow"
              size="lg"
            >
              {isActive ? (
                <>
                  <Square className="w-5 h-5 mr-2" />
                  Stop Detection
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Detection
                </>
              )}
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={onCaptureImage}
                disabled={!isActive}
                variant="secondary"
                className="h-10 transition-smooth"
                size="default"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
              
              <Button
                onClick={handleImageUpload}
                variant="outline"
                className="h-10 transition-smooth"
                size="default"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Captured Images */}
      {capturedImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="gradient-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Captured Images ({capturedImages.length})</span>
                {capturedImages.length > 1 && (
                  <Button
                    onClick={handleDownloadAll}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {capturedImages.map((imageData, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20 border border-border/50 hover:bg-secondary/30 transition-smooth"
                  >
                    <img
                      src={imageData}
                      alt={`Capture ${index + 1}`}
                      className="w-12 h-12 rounded object-cover border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        Capture {index + 1}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownloadImage(imageData, index)}
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="gradient-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
              <div>Click "Start Detection" to begin real-time object detection</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
              <div>Upload an image or use your webcam for detection</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
              <div>Use "Capture" to save detections with bounding boxes</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
              <div>Green boxes indicate high confidence detections</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
              <div>Toggle dark/light mode using the button in the header</div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};