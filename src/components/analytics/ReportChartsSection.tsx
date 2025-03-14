
import { ReportChart } from "./ReportChart";

interface ReportChartsSectionProps {
  dailyData: any[];
}

export function ReportChartsSection({ dailyData }: ReportChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ReportChart 
        data={dailyData} 
        title="Daily Water Volume" 
        type="volume" 
      />
      
      <ReportChart 
        data={dailyData} 
        title="Temperature Trends" 
        type="temperature" 
      />
      
      <ReportChart 
        data={dailyData} 
        title="UVC Hours" 
        type="uvc" 
      />
    </div>
  );
}
