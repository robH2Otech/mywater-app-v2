
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Leaf, Users, Building } from "lucide-react";
import { UVCBusinessMetrics, calculateCostSavings } from "@/utils/businessUvcCalculations";

interface ESGReportGeneratorProps {
  businessMetrics: UVCBusinessMetrics;
  costSavings: ReturnType<typeof calculateCostSavings>;
  period: "day" | "month" | "year" | "all-time";
}

export function ESGReportGenerator({ businessMetrics, costSavings, period }: ESGReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    
    // In a real app, this would generate and download a PDF
    console.log(`Generating ${reportType} report for ${period} period`);
  };

  const reportTypes = [
    {
      id: "esg-summary",
      title: "ESG Impact Summary",
      description: "Comprehensive environmental, social, and governance impact report",
      icon: Leaf,
      color: "from-green-500 to-emerald-500",
      metrics: [
        `${businessMetrics.waterProcessed.toFixed(1)} m³ water processed`,
        `${businessMetrics.energySaved.toFixed(1)} kWh energy saved`,
        `€${costSavings.totalCostSavings.toFixed(2)} cost savings`
      ]
    },
    {
      id: "operational-report",
      title: "Operational Performance",
      description: "Detailed system performance and efficiency metrics",
      icon: Building,
      color: "from-blue-500 to-cyan-500",
      metrics: [
        `${businessMetrics.systemUptime.toFixed(1)}% system uptime`,
        `${businessMetrics.maintenanceEfficiency.toFixed(1)}% maintenance efficiency`,
        `${businessMetrics.operationalHours.toFixed(0)} operating hours`
      ]
    },
    {
      id: "compliance-report",
      title: "Compliance & Certification",
      description: "Regulatory compliance and certification documentation",
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      metrics: [
        "ISO 14001 Environmental Standards",
        "Water Quality Compliance",
        "Energy Efficiency Certification"
      ]
    },
    {
      id: "stakeholder-report",
      title: "Stakeholder Impact",
      description: "Impact report for investors, customers, and employees",
      icon: Users,
      color: "from-amber-500 to-orange-500",
      metrics: [
        "Environmental footprint reduction",
        "Corporate sustainability goals",
        "Community impact assessment"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">ESG & Compliance Reports</h3>
        <p className="text-gray-400">Generate comprehensive reports for stakeholders and compliance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => (
          <Card key={report.id} className="bg-gradient-to-br from-spotify-darker to-spotify-dark border-spotify-accent/30 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${report.color}`}>
                  <report.icon className="h-5 w-5 text-white" />
                </div>
                {report.title}
              </CardTitle>
              <p className="text-gray-400 text-sm">{report.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                {report.metrics.map((metric, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-spotify-accent rounded-full"></div>
                    <span className="text-sm text-gray-300">{metric}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {period.toUpperCase()} PERIOD
                </Badge>
                <Button
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={isGenerating}
                  className={`bg-gradient-to-r ${report.color} hover:opacity-90 transition-opacity`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? "Generating..." : "Download PDF"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats Summary */}
      <Card className="bg-gradient-to-br from-spotify-darker to-spotify-dark border-spotify-accent/30">
        <CardHeader>
          <CardTitle className="text-white">Report Summary Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{businessMetrics.waterProcessed.toFixed(0)}</div>
              <div className="text-sm text-gray-400">m³ Water Processed</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{businessMetrics.energySaved.toFixed(0)}</div>
              <div className="text-sm text-gray-400">kWh Energy Saved</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">€{costSavings.totalCostSavings.toFixed(0)}</div>
              <div className="text-sm text-gray-400">Total Savings</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">{businessMetrics.maintenanceEfficiency.toFixed(0)}%</div>
              <div className="text-sm text-gray-400">Efficiency</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
