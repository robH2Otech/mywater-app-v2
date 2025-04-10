
import { useState, useEffect } from 'react';

interface CartridgeVisualizationProps {
  percentage: number;
  height?: number;
}

export const CartridgeVisualization: React.FC<CartridgeVisualizationProps> = ({ 
  percentage,
  height = 400
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  
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
    <div className="relative flex flex-col items-center justify-center h-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Cartridge Lifespan</h3>
        <p className="text-sm text-gray-400">Remaining capacity</p>
      </div>
      
      <div style={{ height: `${height}px` }} className="relative w-44 flex items-center justify-center">
        {/* Container with filter image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="/lovable-uploads/f2f80940-5fa8-45b6-a3dd-78b6282cf10e.png" 
            alt="Water Filter Cartridge"
            className="h-full object-contain z-10"
          />
        </div>
        
        {/* Filled part (red) - represents used percentage */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-red-500/60 transition-all duration-1000 ease-out rounded-b-lg"
          style={{ 
            height: `${animatedPercentage}%`,
          }}
        />
        
        {/* Remaining part (blue) - represents remaining percentage */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-blue-500/60 transition-all duration-1000 ease-out"
          style={{ 
            height: `${remainingPercentage}%`,
            bottom: `${animatedPercentage}%`
          }}
        />
        
        {/* Percentage indicator */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-black/70 px-3 py-1.5 rounded-full">
            <p className="text-xl font-bold text-white">{remainingPercentage}%</p>
            <p className="text-xs text-center text-gray-300">remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
};
