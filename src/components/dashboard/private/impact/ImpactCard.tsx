
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
  iconColor = "text-cyan-400",
  className = "",
  valueClassName = "",
  titleClassName = "",
  compactMode = false,
}: ImpactCardProps) {
  return (
    <Card className={`text-center ${compactMode ? 'p-1.5' : 'p-2'} h-full bg-gradient-to-br from-blue-600/30 to-cyan-600/30 hover:from-blue-600/40 hover:to-cyan-600/40 transition-all duration-300 border-cyan-500/30 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-0 h-full">
        <Icon className={`${compactMode ? 'h-4 w-4 mb-0.5' : 'h-6 w-6 mb-1'} ${iconColor}`} />
        <div className={`${compactMode ? 'text-base md:text-lg' : 'text-lg sm:text-xl'} font-bold ${compactMode ? 'mb-0.5' : 'mb-1'} text-white ${valueClassName}`}>
          {value}
        </div>
        <div className={`${compactMode ? 'text-2xs sm:text-xs' : 'text-xs'} text-gray-300 ${titleClassName}`}>
          {title}
        </div>
      </CardContent>
    </Card>
  );
}
