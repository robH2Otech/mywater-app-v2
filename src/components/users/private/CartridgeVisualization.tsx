
import { useState, useEffect } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

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
    <div className="relative flex flex-col h-full w-full">
      <div className="text-center mb-2">
        <h3 className="text-lg font-medium">Cartridge Lifespan</h3>
        <p className="text-sm text-gray-400">Remaining capacity</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div 
          style={{ 
            height: compact ? '160px' : isMobile ? '200px' : `${height}px`, 
            maxHeight: compact ? '160px' : '240px',
            width: '100%', // Changed from fixed width to full width
            maxWidth: '280px' // Added maxWidth to prevent too wide cartridge
          }} 
          className="relative mx-auto"
        >
          {/* Container */}
          <div className="absolute inset-0 border-2 border-blue-500/30 rounded-2xl opacity-25"></div>
          
          {/* Filled part (red) */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-red-500/60 transition-all duration-1000 ease-out rounded-b-xl"
            style={{ 
              height: `${animatedPercentage}%`,
              width: '90%', // Increased from 80% to 90%
              marginLeft: '5%' // Adjusted margin to center (was 10%)
            }}
          />
          
          {/* Remaining part (blue) */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-blue-500/60 transition-all duration-1000 ease-out rounded-t-xl"
            style={{ 
              height: `${remainingPercentage}%`,
              bottom: `${animatedPercentage}%`,
              width: '90%', // Increased from 80% to 90%
              marginLeft: '5%' // Adjusted margin to center (was 10%)
            }}
          />
          
          {/* Bubbles */}
          {remainingPercentage > 10 && Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-blue-300/60 animate-bubble"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 30 + 35}%`,
                bottom: `${Math.random() * remainingPercentage + animatedPercentage}%`,
                animation: `bubble ${Math.random() * 3 + 2}s infinite ease-in-out ${Math.random() * 2}s`,
                opacity: Math.random() * 0.5 + 0.2,
              }}
            />
          ))}
          
          {/* Percentage indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/70 px-2.5 py-1 rounded-full">
              <p className="text-lg font-bold text-white">{remainingPercentage.toFixed(0)}%</p>
              <p className="text-2xs text-center text-gray-300">remaining</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bubble {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-${Math.random() * 10 + 5}px) scale(${Math.random() * 0.3 + 0.8});
            opacity: 0.8;
          }
        }
        .animate-bubble {
          animation: bubble 3s infinite ease-in-out;
        }
      `}} />
    </div>
  );
};

