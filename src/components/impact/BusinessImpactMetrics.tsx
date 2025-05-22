
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessImpact } from "@/hooks/impact/useBusinessImpact";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";

interface BusinessImpactMetricsProps {
  period: "day" | "month" | "year" | "all-time";
}

export function BusinessImpactMetrics({ period }: BusinessImpactMetricsProps) {
  const { isLoading, performanceData, locationData, unitsComparison } = useBusinessImpact(period);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array(2).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Performance Trends
            <Badge variant="outline">By Month</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer
              config={{
                performance: { label: "Performance", color: "#3b82f6" },
                target: { label: "Target", color: "#10b981" },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="performance"
                    stroke="var(--color-performance)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="var(--color-target)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Unit Comparison
            <Badge variant="outline">Top Units</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer
              config={{
                bottles: { label: "Bottles", color: "#10b981" },
                co2: { label: "CO₂", color: "#0ea5e9" },
                plastic: { label: "Plastic", color: "#8b5cf6" }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={unitsComparison}
                  layout="vertical"
                  margin={{ left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill="var(--color-bottles)" 
                    name="Impact Score"
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Performance by Location
            <Badge variant="outline">Efficiency Analysis</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ChartContainer
              config={{
                efficiency: { label: "Efficiency", color: "#3b82f6" },
                impact: { label: "Impact", color: "#10b981" }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="location" 
                    tick={{ fill: '#94a3b8' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    tick={{ fill: '#94a3b8' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Legend />
                  <Bar 
                    dataKey="efficiency" 
                    fill="var(--color-efficiency)" 
                    name="Efficiency" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    dataKey="impact" 
                    fill="var(--color-impact)" 
                    name="Environmental Impact" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
