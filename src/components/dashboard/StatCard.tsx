
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { formatTotalVolume } from "@/utils/measurements/unitVolumeUtils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  link: string;
  iconColor?: string;
  subValue?: string;
  subValueColor?: string;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  link,
  iconColor = "text-mywater-blue",
  subValue,
  subValueColor = "text-mywater-blue",
}: StatCardProps) => {
  const formattedValue = () => {
    // Handle string values with 'L' units (liters)
    if (typeof value === 'string' && value.toLowerCase().includes('l') && !value.toLowerCase().includes('m')) {
      const numericPart = value.replace(/[^0-9.]/g, '');
      const numericValue = parseFloat(numericPart);
      
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        return `${numericValue.toLocaleString()}L`;
      }
      return value;
    }
    
    // Handle string values that already contain 'm³'
    if (typeof value === 'string' && value.includes('m')) {
      // First remove any duplicate m³ units
      const cleanValue = value.replace(/m³m³/g, 'm³');
      
      // Check if the value still needs formatting
      if (cleanValue !== value) {
        return cleanValue;
      }
      
      // Extract just the numeric part for formatting
      const numericPart = cleanValue.replace(/[^0-9.]/g, '');
      const numericValue = parseFloat(numericPart);
      
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        // Ensure we don't add another m³ if it already has one
        return `${formatTotalVolume(numericValue)}`;
      }
      
      return cleanValue;
    }
    
    // Handle numeric values
    if (typeof value === 'number') {
      if (isNaN(value) || !isFinite(value) || value > 1000000) {
        console.warn(`Unreasonably large volume detected: ${value}, capping display value`);
        return `${formatTotalVolume(Math.min(value, 1000000))}`;
      }
      return `${formatTotalVolume(value)}`;
    }
    
    return value;
  };
    
  return (
    <Link to={link} className="block">
      <Card className="p-6 glass hover:bg-spotify-accent/40 transition-colors h-[140px] flex items-center">
        <div className="w-full">
          <div className="flex items-center gap-2 mb-3">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <p className="text-sm text-gray-400">{title}</p>
          </div>
          
          <div className="pl-1">
            <p className="text-4xl font-bold">{formattedValue()}</p>
            {subValue && (
              <p className={`text-sm ${subValueColor} mt-1`}>{subValue}</p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
