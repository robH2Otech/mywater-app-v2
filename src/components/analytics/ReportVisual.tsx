
import { UnitData } from "@/types/analytics";
import { NoDataDisplay } from "./reports/NoDataDisplay";
import { ReportActions } from "./reports/ReportActions";
import { ReportSummary } from "./reports/ReportSummary";
import { ReportTable } from "./reports/ReportTable";
import { UnitStatusCard } from "./reports/UnitStatusCard";
import { ReportChart } from "./reports/ReportChart";
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
    return <NoDataDisplay />;
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
