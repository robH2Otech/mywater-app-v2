
import React, { useState } from "react";
import { BusinessLayout } from "@/components/layout/BusinessLayout";
import { PageHeader } from "@/components/shared/PageHeader";
import { BusinessImpactTabs } from "@/components/impact/BusinessImpactTabs";
import { Card } from "@/components/ui/card";
import { Leaf, BarChart, Clock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const ImpactOverview = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock function for downloading reports
  const handleDownloadReport = () => {
    setIsLoading(true);
    // Simulate download process
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Impact Overview"
            description="Track environmental impact and operational efficiency across your units."
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
        
        <Separator />
        
        <Card className="p-6">
          <BusinessImpactTabs />
        </Card>
      </div>
    </BusinessLayout>
  );
};

export default ImpactOverview;
