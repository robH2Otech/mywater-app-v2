
import { UnitData } from "@/types/analytics";

export interface ReportMetrics {
  totalVolume: number;
  avgVolume: number;
  maxVolume: number;
  avgTemperature: number;
  totalUvcHours: number;
  dailyData: any[];
}

// Fix for TypeScript integration with jsPDF-AutoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    } | undefined;
  }
}
