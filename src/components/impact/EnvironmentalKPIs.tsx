
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImpactCard } from "../dashboard/private/impact/ImpactCard";
import { BarChart2, Droplet, Leaf, Recycle, Zap, Waves } from "lucide-react";
import { useBusinessImpact } from "@/hooks/impact/useBusinessImpact";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { ScientificReferences } from "./ScientificReferences";

interface EnvironmentalKPIsProps {
  period: "day" | "month" | "year" | "all-time";
  showExtended?: boolean;
}

export function EnvironmentalKPIs({ period, showExtended = false }: EnvironmentalKPIsProps) {
  const { isLoading, impactData, chartData, totals } = useBusinessImpact(period);
  
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
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ImpactCard 
          title="Plastic Bottles Saved" 
          value={totals.bottlesSaved.toLocaleString()} 
          icon={Recycle}
          iconColor="text-green-400"
        />
        
        <ImpactCard 
          title="CO₂ Emissions Reduced" 
          value={`${totals.co2Saved.toFixed(1)} kg`} 
          icon={Leaf}
          iconColor="text-emerald-400"
        />
        
        <ImpactCard 
          title="Plastic Waste Avoided" 
          value={`${totals.plasticSaved.toFixed(1)} kg`} 
          icon={Recycle}
          iconColor="text-blue-400"
        />
        
        <ImpactCard 
          title="Energy Saved" 
          value={`${totals.energySaved?.toFixed(1) || '0'} kWh`} 
          icon={Zap}
          iconColor="text-yellow-400"
        />
        
        <ImpactCard 
          title="Water Waste Prevented" 
          value={`${totals.waterWastePrevented?.toFixed(1) || '0'} L`} 
          icon={Waves}
          iconColor="text-cyan-400"
        />
        
        {showExtended && (
          <ImpactCard 
            title="Car KM Equivalent" 
            value={`${totals.equivalents.carKilometers.toLocaleString()} km`} 
            icon={BarChart2}
            iconColor="text-amber-500"
          />
        )}
      </div>
      
      {chartData && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Environmental Impact Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ChartContainer 
                config={{
                  bottles: { label: "Bottles", color: "#10b981" },
                  co2: { label: "CO₂ (kg)", color: "#0ea5e9" },
                  plastic: { label: "Plastic (kg)", color: "#8b5cf6" },
                  energy: { label: "Energy (kWh)", color: "#f59e0b" },
                  waterWaste: { label: "Water Waste (L)", color: "#06b6d4" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
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
                    <Legend content={<ChartLegendContent />} />
                    <Bar 
                      dataKey="bottles" 
                      fill="var(--color-bottles)" 
                      name="Bottles Saved"
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="co2" 
                      fill="var(--color-co2)" 
                      name="CO₂ Reduced (kg)"
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="plastic" 
                      fill="var(--color-plastic)" 
                      name="Plastic Avoided (kg)"
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="energy" 
                      fill="var(--color-energy)" 
                      name="Energy Saved (kWh)"
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="waterWaste" 
                      fill="var(--color-waterWaste)" 
                      name="Water Waste Prevented (L)"
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      )}
      
      <ScientificReferences />
    </div>
  );
}
