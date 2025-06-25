
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, TrendingUp, MapPin } from "lucide-react";
import { generateMultiLocationData } from "@/utils/businessUvcCalculations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface MultiLocationComparisonProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  period: "day" | "month" | "year" | "all-time";
}

export function MultiLocationComparison({ selectedLocation, onLocationChange, period }: MultiLocationComparisonProps) {
  const locationData = generateMultiLocationData(6);

  const chartData = locationData.map(location => ({
    name: location.location.replace(' ', '\n'),
    waterProcessed: location.metrics.waterProcessed,
    energySaved: location.metrics.energySaved,
    costSavings: location.costSavings.totalCostSavings,
    efficiency: location.efficiency
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Multi-Location Performance</h3>
          <p className="text-gray-400">Compare performance across different facilities</p>
        </div>
        <Select value={selectedLocation} onValueChange={onLocationChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locationData.map(location => (
              <SelectItem key={location.location} value={location.location}>
                {location.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-spotify-darker to-spotify-dark border-spotify-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Building2 className="h-5 w-5" />
              Water Processing by Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  waterProcessed: { label: "Water Processed (m³)", color: "#3b82f6" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name"
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="waterProcessed" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-spotify-darker to-spotify-dark border-spotify-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5" />
              Cost Savings by Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer
                config={{
                  costSavings: { label: "Cost Savings (€)", color: "#10b981" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name"
                      tick={{ fill: '#9ca3af', fontSize: 10 }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#6b7280' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="costSavings" 
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-spotify-darker to-spotify-dark border-spotify-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MapPin className="h-5 w-5" />
            Location Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locationData.map((location, index) => (
              <div key={location.location} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="font-medium text-white mb-2">{location.location}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Water Processed:</span>
                    <span className="text-blue-400">{location.metrics.waterProcessed.toFixed(1)} m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Energy Saved:</span>
                    <span className="text-yellow-400">{location.metrics.energySaved.toFixed(1)} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost Savings:</span>
                    <span className="text-green-400">€{location.costSavings.totalCostSavings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Efficiency:</span>
                    <span className="text-purple-400">{location.efficiency.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
