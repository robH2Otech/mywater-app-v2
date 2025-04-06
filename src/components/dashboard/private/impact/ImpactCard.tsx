
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
}

export function ImpactCard({
  title,
  value,
  icon: Icon,
  iconColor = "text-mywater-blue",
  className = "",
  valueClassName = "",
  titleClassName = "",
}: ImpactCardProps) {
  return (
    <Card className={`text-center p-4 h-full ${className}`}>
      <CardContent className="flex flex-col items-center justify-center p-0 h-full">
        <Icon className={`h-8 w-8 mb-2 ${iconColor}`} />
        <div className={`text-2xl sm:text-3xl font-bold mb-1 ${valueClassName}`}>
          {value}
        </div>
        <div className={`text-xs sm:text-sm text-gray-400 ${titleClassName}`}>
          {title}
        </div>
      </CardContent>
    </Card>
  );
}
