
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Building2 } from "lucide-react";
import { useBusinessImpact } from "@/hooks/impact/useBusinessImpact";
import { ImpactCard } from "../dashboard/private/impact/ImpactCard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface BusinessImpactMetricsProps {
  period: "day" | "month" | "year" | "all-time";
}

export function BusinessImpactMetrics({ period }: BusinessImpactMetricsProps) {
  const { isLoading, impactData, performanceData, locationData, unitsComparison } = useBusinessImpact(period);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Calculate business metrics
  const totalCostSavings = impactData.bottlesSaved * 1.2; // €1.20 per bottle saved
  const estimatedROI = ((totalCostSavings * 12) / 5000) * 100; // Assuming €5000 investment
  const averageEfficiency = locationData.reduce((sum, loc) => sum + loc.efficiency, 0) / locationData.length;
  
  return (
    <div className="space-y-6">
      {/* Key Business Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ImpactCard 
          title="Cost Savings" 
          value={`€${totalCostSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} 
          icon={DollarSign}
          iconColor="text-green-400"
        />
        
        <ImpactCard 
          title="System Efficiency" 
          value={`${averageEfficiency.toFixed(1)}%`} 
          icon={TrendingUp}
          iconColor="text-blue-400"
        />
        
        <ImpactCard 
          title="Active Locations" 
          value={locationData.length.toString()} 
          icon={Building2}
          iconColor="text-purple-400"
        />
        
        <ImpactCard 
          title="ROI Estimate" 
          value={`${estimatedROI.toFixed(1)}%`} 
          icon={Users}
          iconColor="text-amber-400"
        />
      </div>
      
      {/* Performance Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trends
          </CardTitle>
          <CardDescription>
            System performance metrics over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer 
              config={{
                performance: { label: "Performance %", color: "#10b981" },
                target: { label: "Target %", color: "#6b7280" }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name"
                    tick={{ fill: '#9ca3af' }}
                    axisLine={{ stroke: '#6b7280' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af' }}
                    axisLine={{ stroke: '#6b7280' }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="var(--color-performance)" 
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="var(--color-target)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Location Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Location Performance</CardTitle>
            <CardDescription>
              Efficiency and impact by location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {locationData.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{location.location}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Efficiency: </span>
                      <span className="font-medium text-blue-400">{location.efficiency}%</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Impact: </span>
                      <span className="font-medium text-green-400">{location.impact}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Units</CardTitle>
            <CardDescription>
              Units ranked by performance score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer 
                config={{
                  value: { label: "Performance Score", color: "#3b82f6" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitsComparison} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      type="number"
                      tick={{ fill: '#9ca3af' }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category"
                      tick={{ fill: '#9ca3af' }}
                      axisLine={{ stroke: '#6b7280' }}
                      width={100}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="value" 
                      fill="var(--color-value)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
