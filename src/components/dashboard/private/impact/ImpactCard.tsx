
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ImpactCardProps {
  title: string;
  value: string | number;
  subtext?: string; // Added subtext property as optional
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
  subtext,
  icon: Icon,
  iconColor = "text-mywater-blue",
  className = "",
  valueClassName = "",
  titleClassName = "",
  compactMode = false,
}: ImpactCardProps) {
  return (
    <Card className={`text-center ${compactMode ? 'p-1.5' : 'p-2'} h-full ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-0 h-full">
        <Icon className={`${compactMode ? 'h-4 w-4 mb-0.5' : 'h-6 w-6 mb-1'} ${iconColor}`} />
        <div className={`${compactMode ? 'text-base md:text-lg' : 'text-lg sm:text-xl'} font-bold ${compactMode ? 'mb-0.5' : 'mb-1'} ${valueClassName}`}>
          {value}
        </div>
        <div className={`${compactMode ? 'text-2xs sm:text-xs' : 'text-xs'} text-gray-400 ${titleClassName}`}>
          {subtext || title}
        </div>
      </CardContent>
    </Card>
  );
}
