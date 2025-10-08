import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
  timestamp?: number;
}

interface DetectionStatsProps {
  detections: Detection[];
  fps: number;
  isActive: boolean;
}

export const DetectionStats = ({ detections, fps, isActive }: DetectionStatsProps) => {
  // Group detections by class and count them
  const classStats = detections.reduce((acc, detection) => {
    const className = detection.class;
    if (!acc[className]) {
      acc[className] = { count: 0, maxConfidence: 0 };
    }
    acc[className].count++;
    acc[className].maxConfidence = Math.max(acc[className].maxConfidence, detection.score);
    return acc;
  }, {} as Record<string, { count: number; maxConfidence: number }>);

  const totalObjects = detections.length;
  const uniqueClasses = Object.keys(classStats).length;
  const avgConfidence = detections.length > 0 
    ? detections.reduce((sum, d) => sum + d.score, 0) / detections.length 
    : 0;

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence > 0.7) return "default"; // Uses primary color (green-ish)
    if (confidence > 0.5) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="gradient-card border-border">
            <CardContent className="p-4">
              <motion.div 
                key={totalObjects}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary"
              >
                {totalObjects}
              </motion.div>
              <div className="text-sm text-muted-foreground">Objects Detected</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="gradient-card border-border">
            <CardContent className="p-4">
              <motion.div 
                key={uniqueClasses}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary"
              >
                {uniqueClasses}
              </motion.div>
              <div className="text-sm text-muted-foreground">Unique Classes</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="gradient-card border-border">
            <CardContent className="p-4">
              <motion.div 
                key={fps}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary"
              >
                {fps}
              </motion.div>
              <div className="text-sm text-muted-foreground">FPS</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="gradient-card border-border">
            <CardContent className="p-4">
              <motion.div 
                key={avgConfidence}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-primary"
              >
                {avgConfidence > 0 ? `${(avgConfidence * 100).toFixed(0)}%` : '0%'}
              </motion.div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Status */}
      <Card className="gradient-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            System Status
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary animate-pulse' : 'bg-muted'}`}></div>
            <span className="text-muted-foreground">
              {isActive ? 'Real-time detection running' : 'Detection stopped'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Detection Details */}
      <AnimatePresence>
        {totalObjects > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="gradient-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Current Detections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  <AnimatePresence>
                    {Object.entries(classStats)
                      .sort(([,a], [,b]) => b.count - a.count)
                      .map(([className, stats], index) => (
                      <motion.div 
                        key={className}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/50 hover:bg-secondary/30 transition-smooth"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium capitalize text-foreground">
                            {className.replace(/_/g, ' ')}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {stats.count} detected
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getConfidenceBadgeVariant(stats.maxConfidence)} className="text-xs">
                            {(stats.maxConfidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Detections State */}
      {totalObjects === 0 && isActive && (
        <Card className="gradient-card border-border">
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground">
              No objects detected in the current frame
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Move objects into the camera view to start detection
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};