import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square, Camera, Download } from "lucide-react";
import { toast } from "sonner";

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
          
          <Button
            onClick={onCaptureImage}
            disabled={!isActive}
            variant="secondary"
            className="w-full h-10 transition-smooth"
            size="default"
          >
            <Camera className="w-4 h-4 mr-2" />
            Capture Image
          </Button>
        </CardContent>
      </Card>

      {/* Captured Images */}
      {capturedImages.length > 0 && (
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
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20 border border-border/50"
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
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
            <div>Hold objects in front of your camera for detection</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
            <div>Use "Capture Image" to save detections</div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
            <div>Green boxes indicate high confidence detections</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};