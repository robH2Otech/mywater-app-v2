
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
    <Card className={`text-center ${compactMode ? 'p-2' : 'p-3'} h-full ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-0 h-full">
        <Icon className={`${compactMode ? 'h-6 w-6 mb-1' : 'h-8 w-8 mb-2'} ${iconColor}`} />
        <div className={`${compactMode ? 'text-lg md:text-xl' : 'text-2xl sm:text-3xl'} font-bold ${compactMode ? 'mb-0.5' : 'mb-1'} ${valueClassName}`}>
          {value}
        </div>
        <div className={`${compactMode ? 'text-2xs sm:text-xs' : 'text-xs sm:text-sm'} text-gray-400 ${titleClassName}`}>
          {title}
        </div>
      </CardContent>
    </Card>
  );
}
