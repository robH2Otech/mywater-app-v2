
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ImpactCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
  valueClassName?: string;
  titleClassName?: string;
  compactMode?: boolean;
}

export function ImpactCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-mywater-blue",
  className = "",
  valueClassName = "",
  titleClassName = "",
  compactMode = false,
}: ImpactCardProps) {
  return (
    <Card className={`text-center ${compactMode ? 'p-1.5' : 'p-2.5'} h-full ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-0 h-full">
        <Icon className={`${compactMode ? 'h-5 w-5 mb-0.5' : 'h-7 w-7 mb-1.5'} ${iconColor}`} />
        <div className={`${compactMode ? 'text-lg md:text-xl' : 'text-xl sm:text-2xl'} font-bold ${compactMode ? 'mb-0.5' : 'mb-1'} ${valueClassName}`}>
          {value}
        </div>
        <div className={`${compactMode ? 'text-2xs sm:text-xs' : 'text-xs sm:text-sm'} text-gray-400 ${titleClassName}`}>
          {title}
        </div>
      </CardContent>
    </Card>
  );
}
