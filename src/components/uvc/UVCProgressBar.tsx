
import { MAX_UVC_HOURS } from "@/utils/uvcStatusUtils";

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
    if (percentage > 90) return "text-red-500";
    if (percentage > 80) return "text-yellow-500";
    return "text-mywater-blue";
  };

  return (
    <div className="text-center mb-4">
      <div className="text-3xl font-bold flex justify-center items-end gap-2">
        <span className={getPercentageClass()}>{calculatePercentage()}%</span>
        <span className="text-lg text-gray-400">used</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
        <div 
          className={`h-2.5 rounded-full ${
            calculatePercentage() > 90 ? 'bg-red-500' : 
            calculatePercentage() > 80 ? 'bg-yellow-500' : 
            'bg-mywater-blue'
          }`}
          style={{ width: `${calculatePercentage()}%` }}
        ></div>
      </div>
      <div className="text-sm text-gray-400 mt-2">
        {typeof hours === 'string' ? hours : hours.toString()} / {MAX_UVC_HOURS.toLocaleString()} hours
      </div>
    </div>
  );
}
