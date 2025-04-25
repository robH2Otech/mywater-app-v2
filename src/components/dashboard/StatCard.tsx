
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
  // Format the value properly depending on its type
  const formattedValue = () => {
    // First check if it's a DROP unit volume (in L)
    if (typeof value === 'string' && value.toLowerCase().includes('l') && !value.toLowerCase().includes('m')) {
      // It's a volume in liters, just ensure it's properly formatted
      const numericPart = value.replace(/[^0-9.]/g, '');
      const numericValue = parseFloat(numericPart);
      
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        return `${numericValue.toLocaleString()}L`;
      }
      return value;
    }
    
    // If it's already a string with "m³" notation, just ensure it's properly formatted
    if (typeof value === 'string' && value.includes('m')) {
      // Clean up the string and remove duplicate m³
      const numericPart = value.replace(/[^0-9.]/g, '');
      const numericValue = parseFloat(numericPart);
      
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        return `${formatTotalVolume(numericValue)}m³`;
      }
      // Remove any duplicate "m³" and return with single unit
      return value.replace(/m³{2,}/g, 'm³');
    }
    
    // If it's a number (volume), format it properly with thousands separators
    if (typeof value === 'number') {
      // First check if it's a reasonable number
      if (isNaN(value) || !isFinite(value) || value > 1000000) {
        console.warn(`Unreasonably large volume detected: ${value}, capping display value`);
        return `${formatTotalVolume(Math.min(value, 1000000))}m³`;
      }
      return `${formatTotalVolume(value)}m³`;
    }
    
    // Default case, return as is
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

