import { motion } from "framer-motion";
import { Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="text-center space-y-6 p-8 max-w-md"
      >
        {/* Animated Robot/Camera Icon */}
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="inline-block"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
            />
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-glow">
              <Camera className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
        </motion.div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold gradient-primary bg-clip-text text-transparent"
          >
            Hello! 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-foreground font-medium"
          >
            I'm your Object Buddy
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground"
          >
            Let's explore the world together! I can detect and identify objects in real-time using AI magic ✨
          </motion.p>
        </div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-2 text-sm text-muted-foreground"
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Real-time object detection</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Capture & save moments</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Fun emoji labels & animations</span>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="relative overflow-hidden group shadow-glow hover:shadow-xl transition-all duration-300"
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
            <span className="relative flex items-center gap-2">
              Let's Get Started! 🚀
            </span>
          </Button>
        </motion.div>

        {/* Floating Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/40 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};
