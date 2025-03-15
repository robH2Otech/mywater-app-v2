
import { UnitData } from "@/types/analytics";
import { generatePDF } from "@/utils/pdfGenerator";
import { getDateRangeForReportType } from "@/utils/reportGenerator";
import { ReportSummary } from "./report-components/ReportSummary";
import { ReportActions } from "./report-components/ReportActions";
import { ReportCharts } from "./report-components/ReportCharts";
import { MeasurementsTable } from "./report-components/MeasurementsTable";
import { NoDataCard } from "./report-components/NoDataCard";

interface ReportVisualProps {
  unit: UnitData;
  reportType: string;
  reportId?: string;
  metrics: {
    totalVolume: number;
    avgVolume: number;
    maxVolume: number;
    avgTemperature: number;
    totalUvcHours: number;
    dailyData: any[];
  };
}

export function ReportVisual({ unit, reportType, metrics, reportId }: ReportVisualProps) {
  // If no data available, show the no data card
  if (!metrics.dailyData.length) {
    return <NoDataCard />;
  }
  
  const { startDate, endDate } = getDateRangeForReportType(reportType);
  
  return (
    <div className="space-y-6">
      <ReportActions 
        reportType={reportType} 
        unit={unit} 
        reportId={reportId} 
        metrics={metrics} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportSummary 
          metrics={metrics} 
          startDate={startDate} 
          endDate={endDate} 
        />
        
        <UnitStatusCard unit={unit} />
      </div>
      
      <ReportCharts dailyData={metrics.dailyData} />
      
      <MeasurementsTable dailyData={metrics.dailyData} />
    </div>
  );
}

// Move UnitStatusCard inline since it's only used in ReportVisual
function UnitStatusCard({ unit }: { unit: UnitData }) {
  return (
    <div className="p-4 bg-spotify-darker border-spotify-accent rounded-lg border">
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
    </div>
  );
}
