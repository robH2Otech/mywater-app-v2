
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { UVCBusinessMetrics } from "@/utils/businessUvcCalculations";
import { TrendingUp, Activity, Zap } from "lucide-react";

interface SystemEfficiencyChartProps {
  metrics: UVCBusinessMetrics;
  period: "day" | "month" | "year" | "all-time";
  detailed?: boolean;
}

export function SystemEfficiencyChart({ metrics, period, detailed = false }: SystemEfficiencyChartProps) {
  // Generate mock time series data based on period
  const generateTimeSeriesData = () => {
    const dataPoints = period === "day" ? 24 : period === "month" ? 30 : period === "year" ? 12 : 24;
    const timeLabel = period === "day" ? "hour" : period === "month" ? "day" : period === "year" ? "month" : "period";
    
    return Array.from({ length: dataPoints }, (_, i) => {
      const baseEfficiency = metrics.maintenanceEfficiency;
      const variance = 10; // ±10% variance
      const efficiency = Math.max(0, Math.min(100, baseEfficiency + (Math.random() - 0.5) * variance));
      
      const baseWaterFlow = metrics.waterProcessed / dataPoints;
      const waterFlow = baseWaterFlow + (Math.random() - 0.5) * baseWaterFlow * 0.3;
      
      const baseEnergy = metrics.energySaved / dataPoints;
      const energySaved = baseEnergy + (Math.random() - 0.5) * baseEnergy * 0.2;
      
      return {
        name: `${timeLabel === "hour" ? i : i + 1}${timeLabel === "hour" ? ":00" : ""}`,
        efficiency: Math.round(efficiency * 10) / 10,
        waterFlow: Math.round(waterFlow * 10) / 10,
        energySaved: Math.round(energySaved * 10) / 10,
        target: 95, // Target efficiency
        uptime: Math.max(70, Math.min(100, metrics.systemUptime + (Math.random() - 0.5) * 15))
      };
    });
  };

  const data = generateTimeSeriesData();

  if (detailed) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Trend */}
        <Card className="bg-gradient-to-br from-spotify-darker to-spotify-dark border-spotify-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5" />
              System Efficiency Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  efficiency: { label: "Efficiency %", color: "#10b981" },
                  target: { label: "Target %", color: "#6b7280" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <YAxis 
                      domain={[60, 100]}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="var(--color-efficiency)" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#10b981" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="var(--color-target)" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Water Flow Rate */}  
        <Card className="bg-gradient-to-br from-spotify-darker to-spotify-dark border-spotify-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5" />
              Water Flow Rate (m³)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  waterFlow: { label: "Flow Rate m³", color: "#3b82f6" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area 
                      type="monotone" 
                      dataKey="waterFlow" 
                      stroke="#3b82f6" 
                      fill="url(#waterGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Energy Savings */}
        <Card className="bg-gradient-to-br from-spotify-darker to-spotify-dark border-spotify-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="h-5 w-5" />
              Energy Savings (kWh)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  energySaved: { label: "Energy Saved kWh", color: "#f59e0b" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="energySaved" 
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* System Uptime */}
        <Card className="bg-gradient-to-br from-spotify-darker to-spotify-dark border-spotify-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5" />
              System Uptime %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  uptime: { label: "Uptime %", color: "#8b5cf6" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <YAxis 
                      domain={[70, 100]}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="uptime" 
                      stroke="var(--color-uptime)" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#8b5cf6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Simple overview chart
  return (
    <Card className="bg-gradient-to-br from-spotify-darker to-spotify-dark border-spotify-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <TrendingUp className="h-5 w-5" />
          System Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer
            config={{
              efficiency: { label: "Efficiency %", color: "#10b981" },
              uptime: { label: "Uptime %", color: "#3b82f6" },
              target: { label: "Target", color: "#6b7280" }
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#6b7280' }}
                />
                <YAxis 
                  domain={[60, 100]}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={{ stroke: '#6b7280' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="var(--color-efficiency)" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="uptime" 
                  stroke="var(--color-uptime)" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="var(--color-target)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
