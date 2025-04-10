
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
    <Card className={`text-center ${compactMode ? 'p-1.5' : 'p-4'} h-full ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-0 h-full">
        <Icon className={`${compactMode ? 'h-6 w-6 mb-1' : 'h-8 w-8 mb-2'} ${iconColor}`} />
        <div className={`${compactMode ? 'text-base md:text-xl' : 'text-xl sm:text-2xl'} font-bold ${compactMode ? 'mb-1' : 'mb-2'} ${valueClassName}`}>
          {value}
        </div>
        <div className={`${compactMode ? 'text-xs' : 'text-sm'} text-gray-400 ${titleClassName}`}>
          {title}
        </div>
      </CardContent>
    </Card>
  );
}
