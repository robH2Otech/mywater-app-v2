
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface ReportSummaryCardProps {
  totalVolume: number;
  avgTemperature: number;
  totalUvcHours: number;
  startDate: Date;
  endDate: Date;
}

export function ReportSummaryCard({
  totalVolume,
  avgTemperature,
  totalUvcHours,
  startDate,
  endDate
}: ReportSummaryCardProps) {
  const isMobile = useIsMobile();

  // Format numbers with specific decimal places
  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  return (
    <Card className="p-4 bg-spotify-darker border-spotify-accent">
      <h3 className="text-lg font-semibold mb-4">Report Summary</h3>
      <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"}`}>
        <div>
          <p className="text-gray-400 text-sm">Total Volume</p>
          <p className="text-xl font-semibold">{formatNumber(totalVolume, 2)} m³</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Avg. Temperature</p>
          <p className="text-xl font-semibold">{formatNumber(avgTemperature, 1)} °C</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Total UVC Hours</p>
          <p className="text-xl font-semibold">{formatNumber(totalUvcHours, 1)} hours</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Date Range</p>
          <p className="text-sm font-medium">
            {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
          </p>
        </div>
      </div>
    </Card>
  );
}
