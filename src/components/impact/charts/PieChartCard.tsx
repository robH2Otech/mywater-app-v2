
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface PieChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface PieChartCardProps {
  title: string;
  description?: string;
  data: PieChartData[];
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export function PieChartCard({ 
  title, 
  description, 
  data, 
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80
}: PieChartCardProps) {
  const config = data.reduce((acc, item) => {
    acc[item.name.toLowerCase().replace(' ', '')] = {
      label: item.name,
      color: item.color
    };
    return acc;
  }, {} as any);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-gray-400">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="h-2.5 w-2.5 rounded-full" 
                                  style={{ backgroundColor: data.color }}
                                />
                                <span className="font-medium">{data.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-muted-foreground">Value:</span>
                              <span className="font-mono font-medium">{data.value.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-muted-foreground">Percentage:</span>
                              <span className="font-mono font-medium">{data.percentage}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {showLegend && (
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-white text-sm">{value}</span>}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
