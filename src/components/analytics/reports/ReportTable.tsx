
import { Card } from "@/components/ui/card";

interface ReportTableProps {
  data: {
    date: string;
    volume: number;
    avgTemperature: number;
    uvcHours: number;
  }[];
}

export function ReportTable({ data }: ReportTableProps) {
  return (
    <Card className="p-4 bg-spotify-darker border-spotify-accent">
      <h3 className="text-lg font-semibold mb-4">Daily Measurements</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg. Temperature</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">UVC Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((day, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-spotify-dark' : 'bg-spotify-darker'}>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {new Date(day.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {day.volume.toFixed(2)} m³
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {day.avgTemperature.toFixed(2)} °C
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">
                  {day.uvcHours.toFixed(2)} hours
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
