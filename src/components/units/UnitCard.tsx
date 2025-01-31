import { Check, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface UnitCardProps {
  id: string;
  name: string;
  status: string;
  location?: string | null;
  total_volume?: number | null;
  next_maintenance?: string | null;
}

export const UnitCard = ({
  id,
  name,
  status,
  location,
  total_volume,
  next_maintenance,
}: UnitCardProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Check className="h-5 w-5 text-spotify-green" />;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Link to={`/units/${id}`} className="block">
      <Card className="p-6 glass hover:bg-spotify-accent/40 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{name}</h3>
            {location && <p className="text-gray-400 text-sm">{location}</p>}
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium capitalize`}>
              {status}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-400">
            Volume: {total_volume ? `${total_volume} m³` : "N/A"}
          </p>
          <p className="text-sm text-gray-400">
            Next Maintenance: {formatDate(next_maintenance)}
          </p>
        </div>
      </Card>
    </Link>
  );
};