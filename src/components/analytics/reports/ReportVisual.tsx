
import { UnitData } from "@/types/analytics";
import { ReportChart } from "./ReportChart";
import { ReportSummary } from "./ReportSummary";
import { ReportTable } from "./ReportTable";
import { UnitStatusCard } from "./UnitStatusCard";
import { ReportActions } from "./ReportActions";
import { getDateRangeForReportType } from "@/utils/reportGenerator";

interface ReportVisualProps {
  unit: UnitData;
  reportType: string;
  metrics: {
    totalVolume: number;
    avgVolume: number;
    maxVolume: number;
    avgTemperature: number;
    totalUvcHours: number;
    dailyData: any[];
  };
}

export function ReportVisual({ unit, reportType, metrics }: ReportVisualProps) {
  const { startDate, endDate } = getDateRangeForReportType(reportType);
  
  // If no data available
  if (!metrics.dailyData.length) {
    return (
      <div className="p-6 text-center bg-spotify-darker rounded-lg">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
          <p className="text-gray-400 mb-4">
            There is no measurement data available for the selected period.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <ReportActions 
        unit={unit} 
        reportType={reportType} 
        metrics={metrics} 
        startDate={startDate}
        endDate={endDate}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportSummary metrics={metrics} startDate={startDate} endDate={endDate} />
        <UnitStatusCard unit={unit} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportChart 
          data={metrics.dailyData} 
          title="Daily Water Volume" 
          type="volume" 
        />
        
        <ReportChart 
          data={metrics.dailyData} 
          title="Temperature Trends" 
          type="temperature" 
        />
        
        <ReportChart 
          data={metrics.dailyData} 
          title="UVC Hours" 
          type="uvc" 
        />
      </div>
      
      <ReportTable data={metrics.dailyData} />
    </div>
  );
}
