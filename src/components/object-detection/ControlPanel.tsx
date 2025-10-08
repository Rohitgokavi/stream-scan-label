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
        <Card className="gradient-card border-border hover-lift">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎮</span>
              <CardTitle className="text-lg">Camera Controls</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onToggleCamera}
                variant={isActive ? "destructive" : "default"}
                className="w-full h-12 text-base font-semibold transition-bounce shadow-glow hover:shadow-xl ripple"
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
                    Start Detection ✨
                  </>
                )}
              </Button>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-2">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={onCaptureImage}
                  disabled={!isActive}
                  variant="secondary"
                  className="h-10 w-full transition-bounce ripple"
                  size="default"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture 📸
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  onClick={handleImageUpload}
                  variant="outline"
                  className="h-10 w-full transition-bounce ripple"
                  size="default"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload 🖼️
                </Button>
              </motion.div>
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
          <Card className="gradient-card border-border hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📷</span>
                  <span>Captures ({capturedImages.length})</span>
                </div>
                {capturedImages.length > 1 && (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      onClick={handleDownloadAll}
                      variant="outline"
                      size="sm"
                      className="text-xs ripple"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      All
                    </Button>
                  </motion.div>
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
                    whileHover={{ scale: 1.02, x: 4 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-2 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:shadow-soft transition-all duration-300"
                  >
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      src={imageData}
                      alt={`Capture ${index + 1}`}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-primary/30 shadow-soft cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        📸 Capture {index + 1}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        onClick={() => handleDownloadImage(imageData, index)}
                        variant="ghost"
                        size="sm"
                        className="shrink-0 ripple"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </motion.div>
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
        <Card className="gradient-card border-border hover-lift">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <CardTitle className="text-lg">Quick Guide</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <motion.div 
              whileHover={{ x: 4 }}
              className="flex items-start gap-3"
            >
              <span className="text-lg shrink-0">✨</span>
              <div>Click "Start Detection" to begin the magic</div>
            </motion.div>
            <motion.div 
              whileHover={{ x: 4 }}
              className="flex items-start gap-3"
            >
              <span className="text-lg shrink-0">📸</span>
              <div>Upload an image or use your webcam</div>
            </motion.div>
            <motion.div 
              whileHover={{ x: 4 }}
              className="flex items-start gap-3"
            >
              <span className="text-lg shrink-0">🎯</span>
              <div>Watch objects get detected with emoji labels</div>
            </motion.div>
            <motion.div 
              whileHover={{ x: 4 }}
              className="flex items-start gap-3"
            >
              <span className="text-lg shrink-0">💾</span>
              <div>Capture & save your favorite moments</div>
            </motion.div>
            <motion.div 
              whileHover={{ x: 4 }}
              className="flex items-start gap-3"
            >
              <span className="text-lg shrink-0">🌗</span>
              <div>Toggle theme for comfy viewing</div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};