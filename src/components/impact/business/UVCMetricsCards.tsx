
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Zap, Euro, TrendingUp, Activity, Gauge } from "lucide-react";
import { UVCBusinessMetrics, calculateCostSavings } from "@/utils/businessUvcCalculations";
import { motion } from "framer-motion";

interface UVCMetricsCardsProps {
  businessMetrics: UVCBusinessMetrics;
  costSavings: ReturnType<typeof calculateCostSavings>;
  period: "day" | "month" | "year" | "all-time";
}

export function UVCMetricsCards({ businessMetrics, costSavings, period }: UVCMetricsCardsProps) {
  const cards = [
    {
      title: "Water Processed",
      value: `${businessMetrics.waterProcessed.toFixed(1)} m³`,
      subtitle: `${businessMetrics.operationalHours.toFixed(0)} operating hours`,
      icon: Droplets,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-900/20 to-cyan-900/20",
      borderColor: "border-blue-500/40"
    },
    {
      title: "Energy Saved",
      value: `${businessMetrics.energySaved.toFixed(1)} kWh`,
      subtitle: `€${costSavings.energyCostSavings.toFixed(2)} cost savings`,
      icon: Zap,
      color: "from-yellow-500 to-amber-500",
      bgColor: "from-yellow-900/20 to-amber-900/20",
      borderColor: "border-yellow-500/40"
    },
    {
      title: "Water Waste Prevented",
      value: `${businessMetrics.waterWastePrevented.toFixed(1)} m³`,
      subtitle: `€${costSavings.waterCostSavings.toFixed(2)} equivalent`,
      icon: Activity,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-900/20 to-emerald-900/20",
      borderColor: "border-green-500/40"
    },
    {
      title: "Total Cost Savings",
      value: `€${costSavings.totalCostSavings.toFixed(2)}`,
      subtitle: `Operational efficiency`,
      icon: Euro,
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-900/20 to-pink-900/20",
      borderColor: "border-purple-500/40"
    },
    {
      title: "System Uptime",
      value: `${businessMetrics.systemUptime.toFixed(1)}%`,
      subtitle: getUptimeStatus(businessMetrics.systemUptime),
      icon: Gauge,
      color: "from-indigo-500 to-blue-500",
      bgColor: "from-indigo-900/20 to-blue-900/20",
      borderColor: "border-indigo-500/40"
    },
    {
      title: "Maintenance Efficiency",
      value: `${businessMetrics.maintenanceEfficiency.toFixed(1)}%`,
      subtitle: getEfficiencyStatus(businessMetrics.maintenanceEfficiency),
      icon: TrendingUp,
      color: "from-teal-500 to-cyan-500",
      bgColor: "from-teal-900/20 to-cyan-900/20",
      borderColor: "border-teal-500/40"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`bg-gradient-to-br ${card.bgColor} border ${card.borderColor} hover:shadow-lg transition-all duration-300 hover:scale-105`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {card.value}
              </div>
              <p className="text-xs text-gray-400">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function getUptimeStatus(uptime: number): string {
  if (uptime >= 95) return "Excellent performance";
  if (uptime >= 85) return "Good performance";
  if (uptime >= 75) return "Average performance";
  return "Needs attention";
}

function getEfficiencyStatus(efficiency: number): string {
  if (efficiency >= 90) return "Optimal efficiency";
  if (efficiency >= 80) return "Good efficiency";
  if (efficiency >= 70) return "Fair efficiency";
  return "Maintenance required";
}
