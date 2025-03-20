
import { MAX_UVC_HOURS, WARNING_THRESHOLD, URGENT_THRESHOLD } from "@/utils/uvcStatusUtils";

interface UVCProgressBarProps {
  hours: string | number;
}

export function UVCProgressBar({ hours }: UVCProgressBarProps) {
  const calculatePercentage = () => {
    const numericHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    return Math.min(Math.round((numericHours / MAX_UVC_HOURS) * 100), 100);
  };

  const getPercentageClass = () => {
    const percentage = calculatePercentage();
    const numericHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    
    if (numericHours >= URGENT_THRESHOLD) return "text-red-500";
    if (numericHours >= WARNING_THRESHOLD) return "text-yellow-500";
    return "text-mywater-blue";
  };

  const getProgressBarColor = () => {
    const numericHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    
    if (numericHours >= URGENT_THRESHOLD) return 'bg-red-500';
    if (numericHours >= WARNING_THRESHOLD) return 'bg-yellow-500';
    return 'bg-mywater-blue';
  };

  return (
    <div className="text-center mb-4">
      <div className="text-3xl font-bold flex justify-center items-end gap-2">
        <span className={getPercentageClass()}>{calculatePercentage()}%</span>
        <span className="text-lg text-gray-400">used</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
        <div 
          className={`h-2.5 rounded-full ${getProgressBarColor()}`}
          style={{ width: `${calculatePercentage()}%` }}
        ></div>
      </div>
      <div className="text-sm text-gray-400 mt-2">
        {Math.round(typeof hours === 'string' ? parseFloat(hours) : hours)} / {Math.round(MAX_UVC_HOURS)} hours
      </div>
    </div>
  );
}
