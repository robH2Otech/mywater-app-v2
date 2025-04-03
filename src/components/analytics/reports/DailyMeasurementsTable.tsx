
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatVolumeByUnitType } from "@/utils/measurements/formatUtils";

interface DailyData {
  date: string;
  volume: number;
  avgTemperature: number;
  uvcHours: number;
}

interface DailyMeasurementsTableProps {
  dailyData: DailyData[];
  unitType?: string;
}

export function DailyMeasurementsTable({ dailyData, unitType = 'uvc' }: DailyMeasurementsTableProps) {
  const isMobile = useIsMobile();
  const isUVCUnit = unitType === 'uvc';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isMobile 
      ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : date.toLocaleDateString();
  };

  const formatVolume = (volume: number) => {
    // Format volume based on unit type
    if (isUVCUnit) {
      // For UVC units, convert to liters for display
      return `${Math.round(volume * 1000)} L`;
    } else {
      // For DROP and Office units, already in liters
      return `${Math.round(volume)} L`;
    }
  };

  return (
    <Card className="p-4 bg-spotify-darker border-spotify-accent">
      <h3 className="text-lg font-semibold mb-4">Daily Measurements</h3>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Volume (L)</th>
              <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{isMobile ? "Temp" : "Avg. Temperature"}</th>
              <th className="px-2 md:px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">UVC Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {dailyData.map((day, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-spotify-dark' : 'bg-spotify-darker'}>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap text-xs md:text-sm">
                  {formatDate(day.date)}
                </td>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap text-xs md:text-sm">
                  {formatVolume(day.volume)}
                </td>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap text-xs md:text-sm">
                  {day.avgTemperature.toFixed(1)} °C
                </td>
                <td className="px-2 md:px-4 py-2 whitespace-nowrap text-xs md:text-sm">
                  {day.uvcHours.toFixed(1)} h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

