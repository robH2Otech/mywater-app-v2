
import { useState, useEffect } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

interface CartridgeVisualizationProps {
  percentage: number;
  height?: number;
  compact?: boolean;
}

export const CartridgeVisualization: React.FC<CartridgeVisualizationProps> = ({ 
  percentage,
  height = 240,
  compact = false
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const isMobile = useIsMobile();
  
  const remainingPercentage = Math.max(0, Math.min(100 - percentage, 100));
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex flex-col h-full w-full"
    >
      <div className="text-center mb-4">
        <h3 className="text-xl font-medium bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">
          Cartridge Lifespan
        </h3>
        <p className="text-sm text-blue-400/80">Remaining capacity</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div 
          style={{ 
            height: compact ? '160px' : isMobile ? '200px' : `${height}px`, 
            maxHeight: compact ? '160px' : '240px',
            width: '100%',
            maxWidth: '280px'
          }} 
          className="relative mx-auto"
        >
          {/* Glass container effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-blue-900/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl shadow-lg"></div>
          
          {/* Base container */}
          <div className="absolute inset-0 border border-blue-500/30 rounded-2xl"></div>
          
          {/* Filled part (red) with improved gradient */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-600/70 to-red-500/50 transition-all duration-1000 ease-out rounded-b-xl"
            animate={{ height: `${animatedPercentage}%` }}
            transition={{ 
              type: "spring", 
              stiffness: 50, 
              damping: 20 
            }}
            style={{ 
              width: '92%',
              marginLeft: '4%'
            }}
          />
          
          {/* Remaining part (blue) with improved gradient */}
          <motion.div 
            className="absolute left-0 right-0 bg-gradient-to-t from-blue-500/60 to-cyan-400/40 transition-all duration-1000 ease-out rounded-t-xl"
            animate={{ 
              height: `${remainingPercentage}%`,
              bottom: `${animatedPercentage}%`
            }}
            transition={{ 
              type: "spring", 
              stiffness: 50, 
              damping: 20 
            }}
            style={{ 
              width: '92%',
              marginLeft: '4%'
            }}
          />
          
          {/* Enhanced bubbles - more dynamic and varied */}
          {remainingPercentage > 10 && Array.from({ length: 6 }).map((_, i) => (
            <motion.div 
              key={i}
              className="absolute rounded-full bg-blue-300/70"
              animate={{
                y: [0, -15, 0],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
              style={{
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                left: `${Math.random() * 70 + 15}%`,
                bottom: `${Math.random() * remainingPercentage + animatedPercentage + 5}%`,
              }}
            />
          ))}
          
          {/* Improved percentage indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-slate-900/90 to-blue-900/80 px-4 py-2 rounded-full border border-blue-400/20 shadow-lg"
            >
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-100 to-cyan-200 bg-clip-text text-transparent">
                {remainingPercentage.toFixed(0)}%
              </p>
              <p className="text-xs text-center text-blue-400/80">remaining capacity</p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
