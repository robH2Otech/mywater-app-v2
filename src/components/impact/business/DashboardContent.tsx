
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { UVCMetricsCards } from "./UVCMetricsCards";
import { SystemEfficiencyChart } from "./SystemEfficiencyChart";
import { MaintenanceTracker } from "./MaintenanceTracker";
import { MultiLocationComparison } from "./MultiLocationComparison";
import { ESGReportGenerator } from "./ESGReportGenerator";
import { UVCBusinessMetrics, calculateCostSavings } from "@/utils/businessUvcCalculations";

interface DashboardContentProps {
  businessMetrics: UVCBusinessMetrics;
  costSavings: ReturnType<typeof calculateCostSavings>;
  period: "day" | "month" | "year" | "all-time";
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  realDataAvailable: boolean;
}

export function DashboardContent({ 
  businessMetrics, 
  costSavings, 
  period, 
  selectedLocation, 
  onLocationChange, 
  realDataAvailable 
}: DashboardContentProps) {
  return (
    <>
      <TabsContent value="overview" className="mt-6">
        <div className="space-y-6">
          <UVCMetricsCards 
            businessMetrics={businessMetrics}
            costSavings={costSavings}
            period={period}
            realDataAvailable={realDataAvailable}
          />
          <SystemEfficiencyChart 
            metrics={businessMetrics}
            period={period}
          />
        </div>
      </TabsContent>

      <TabsContent value="efficiency" className="mt-6">
        <SystemEfficiencyChart 
          metrics={businessMetrics}
          period={period}
          detailed={true}
        />
      </TabsContent>

      <TabsContent value="maintenance" className="mt-6">
        <MaintenanceTracker 
          metrics={businessMetrics}
          period={period}
        />
      </TabsContent>

      <TabsContent value="locations" className="mt-6">
        <MultiLocationComparison 
          selectedLocation={selectedLocation}
          onLocationChange={onLocationChange}
          period={period}
        />
      </TabsContent>

      <TabsContent value="reports" className="mt-6">
        <ESGReportGenerator 
          businessMetrics={businessMetrics}
          costSavings={costSavings}
          period={period}
        />
      </TabsContent>
    </>
  );
}
