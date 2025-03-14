
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface ReportSummaryProps {
  metrics: {
    totalVolume: number;
    avgVolume: number;
    maxVolume: number;
    avgTemperature: number;
    totalUvcHours: number;
  };
  startDate: Date;
  endDate: Date;
}

export function ReportSummary({ metrics, startDate, endDate }: ReportSummaryProps) {
  return (
    <Card className="p-4 bg-spotify-darker border-spotify-accent">
      <h3 className="text-lg font-semibold mb-4">Report Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-400 text-sm">Total Volume</p>
          <p className="text-xl font-semibold">{metrics.totalVolume.toFixed(2)} units</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Avg. Temperature</p>
          <p className="text-xl font-semibold">{metrics.avgTemperature.toFixed(2)} °C</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Total UVC Hours</p>
          <p className="text-xl font-semibold">{metrics.totalUvcHours.toFixed(2)} hours</p>
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
