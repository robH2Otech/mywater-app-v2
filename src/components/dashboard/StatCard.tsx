
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

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
  return (
    <Link to={link} className="block">
      <Card className="p-6 glass hover:bg-spotify-accent/40 transition-colors h-[140px] flex items-center">
        <div className="flex justify-between items-center w-full">
          <div>
            <p className="text-sm text-gray-400">{title}</p>
            <div className="flex items-center">
              <p className="text-4xl font-bold mt-2">{value}</p>
              {value.toString().includes('m') && <sup className="text-lg">3</sup>}
            </div>
            {subValue && (
              <p className={`text-sm ${subValueColor} mt-1`}>{subValue}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
      </Card>
    </Link>
  );
};
