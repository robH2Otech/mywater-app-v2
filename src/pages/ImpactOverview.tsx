
import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { BusinessImpactTabs } from "@/components/impact/BusinessImpactTabs";
import { Card } from "@/components/ui/card";
import { Leaf, BarChart, Clock, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EnvironmentalKPIs } from "@/components/impact/EnvironmentalKPIs";

const ImpactOverview = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  
  // Mock function for downloading reports
  const handleDownloadReport = () => {
    setIsLoading(true);
    // Simulate download process
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Environmental Impact Overview"
          description="Track environmental impact and operational efficiency across your units with scientific data backing."
          icon={Leaf}
        />
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleDownloadReport}
          disabled={isLoading}
        >
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </Button>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Scientific Data-Based Calculations</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              All environmental impact calculations are based on peer-reviewed scientific research:
              <br />• CO₂: 321g per liter of bottled water • Plastic: 40g per liter
              <br />• Energy: 1.55 kWh per liter • Water waste: 2.33L per liter produced
            </p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Environmental Impact Metrics</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time environmental impact based on your MYWATER system usage
          </p>
        </div>
        
        <EnvironmentalKPIs period={period} showExtended={true} />
      </Card>
      
      <Card className="p-6">
        <BusinessImpactTabs />
      </Card>
    </div>
  );
};

export default ImpactOverview;
