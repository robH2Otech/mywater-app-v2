
import { useState, useEffect } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";

interface CartridgeVisualizationProps {
  percentage: number;
  height?: number;
}

export const CartridgeVisualization: React.FC<CartridgeVisualizationProps> = ({ 
  percentage,
  height = 400
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const isMobile = useIsMobile();
  
  // Calculate the remaining percentage (what's left in the cartridge)
  const remainingPercentage = Math.max(0, Math.min(100 - percentage, 100));
  
  // Animation effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [percentage]);

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Cartridge Lifespan</h3>
        <p className="text-sm text-gray-400">Remaining capacity</p>
      </div>
      
      <div 
        style={{ height: isMobile ? '300px' : `${height}px` }} 
        className="relative w-44 flex items-center justify-center mx-auto"
      >
        {/* Container - cylindrical shape for cartridge */}
        <div className="absolute inset-0 border-2 border-blue-500/30 rounded-2xl opacity-25"></div>
        
        {/* Filled part (red) - represents used percentage */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-red-500/60 transition-all duration-1000 ease-out rounded-b-xl"
          style={{ 
            height: `${animatedPercentage}%`,
            width: '80%',
            marginLeft: '10%'
          }}
        />
        
        {/* Remaining part (blue) - represents remaining percentage */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-blue-500/60 transition-all duration-1000 ease-out rounded-t-xl"
          style={{ 
            height: `${remainingPercentage}%`,
            bottom: `${animatedPercentage}%`,
            width: '80%',
            marginLeft: '10%'
          }}
        />
        
        {/* Bubbles effect (for blue water) */}
        {remainingPercentage > 10 && Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-blue-300/60 animate-bubble"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              left: `${Math.random() * 30 + 35}%`,
              bottom: `${Math.random() * remainingPercentage + animatedPercentage}%`,
              animation: `bubble ${Math.random() * 5 + 3}s infinite ease-in-out ${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
        
        {/* Percentage indicator */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-black/70 px-4 py-2 rounded-full">
            <p className="text-2xl font-bold text-white">{remainingPercentage.toFixed(0)}%</p>
            <p className="text-xs text-center text-gray-300">remaining</p>
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
            transform: translateY(-${Math.random() * 20 + 10}px) scale(${Math.random() * 0.5 + 0.8});
            opacity: 0.8;
          }
        }
        .animate-bubble {
          animation: bubble 4s infinite ease-in-out;
        }
      `}} />
    </div>
  );
};
