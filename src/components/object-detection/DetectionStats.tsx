import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{totalObjects}</div>
            <div className="text-sm text-muted-foreground">Objects Detected</div>
          </CardContent>
        </Card>
        
        <Card className="gradient-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{uniqueClasses}</div>
            <div className="text-sm text-muted-foreground">Unique Classes</div>
          </CardContent>
        </Card>
        
        <Card className="gradient-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{fps}</div>
            <div className="text-sm text-muted-foreground">FPS</div>
          </CardContent>
        </Card>
        
        <Card className="gradient-card border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {avgConfidence > 0 ? `${(avgConfidence * 100).toFixed(0)}%` : '0%'}
            </div>
            <div className="text-sm text-muted-foreground">Avg Confidence</div>
          </CardContent>
        </Card>
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
      {totalObjects > 0 && (
        <Card className="gradient-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Current Detections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(classStats)
                .sort(([,a], [,b]) => b.count - a.count)
                .map(([className, stats]) => (
                <div key={className} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium capitalize text-foreground">
                      {className.replace(/_/g, ' ')}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stats.count} detected
                    </Badge>
                  </div>
                  <Badge variant={getConfidenceBadgeVariant(stats.maxConfidence)} className="text-xs">
                    {(stats.maxConfidence * 100).toFixed(0)}% max
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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