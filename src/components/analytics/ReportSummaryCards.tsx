
import { Card } from "@/components/ui/card";
import { UnitData } from "@/types/analytics";
import { format } from "date-fns";

interface ReportSummaryCardsProps {
  unit: UnitData;
  metrics: {
    totalVolume: number;
    avgVolume: number;
    maxVolume: number;
    avgTemperature: number;
    totalUvcHours: number;
    dailyData: any[];
  };
  startDate: Date;
  endDate: Date;
}

export function ReportSummaryCards({ unit, metrics, startDate, endDate }: ReportSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      
      <Card className="p-4 bg-spotify-darker border-spotify-accent">
        <h3 className="text-lg font-semibold mb-4">Unit Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Unit Status</p>
            <p className={`text-lg font-medium ${
              unit.status === 'active' ? 'text-green-400' :
              unit.status === 'warning' ? 'text-yellow-400' :
              unit.status === 'urgent' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {unit.status || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">UVC Status</p>
            <p className={`text-lg font-medium ${
              unit.uvc_status === 'active' ? 'text-green-400' :
              unit.uvc_status === 'warning' ? 'text-yellow-400' :
              unit.uvc_status === 'urgent' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {unit.uvc_status || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Last Maintenance</p>
            <p className="text-sm">
              {unit.last_maintenance ? new Date(unit.last_maintenance).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Next Maintenance</p>
            <p className="text-sm">
              {unit.next_maintenance ? new Date(unit.next_maintenance).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
