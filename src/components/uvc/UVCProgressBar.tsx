
import { Progress } from "@/components/ui/progress";
import { calculateUVCLifePercentage, MAX_UVC_HOURS } from "@/utils/uvcStatusUtils";

interface UVCProgressBarProps {
  hours: number | string;
}

export function UVCProgressBar({ hours }: UVCProgressBarProps) {
  const numericHours = typeof hours === 'string' ? parseFloat(hours) : hours;
  const percentage = calculateUVCLifePercentage(numericHours);
  
  const getStatusColor = () => {
    if (percentage < 67) return "bg-mywater-blue";
    if (percentage < 93) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const hoursRemaining = MAX_UVC_HOURS - numericHours;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">UVC Bulb Usage</span>
        <span className="text-white">
          {Math.round(numericHours).toLocaleString()} / {MAX_UVC_HOURS.toLocaleString()} hours
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2.5" 
        indicatorClassName={getStatusColor()}
      />
      
      <p className="text-sm text-gray-400">
        Remaining: <span className="text-white">{Math.round(hoursRemaining).toLocaleString()} hours</span>
      </p>
    </div>
  );
}
