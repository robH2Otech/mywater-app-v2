
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCounterCard } from "../charts/AnimatedCounterCard";
import { Droplets, Leaf, Zap, Recycle } from "lucide-react";
import { motion } from "framer-motion";

interface RealTimeDashboardProps {
  realTimeCounters: {
    bottlesToday: number;
    co2Today: number;
    energyToday: number;
  };
}

export function RealTimeDashboard({ realTimeCounters }: RealTimeDashboardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-gradient-to-r from-green-900/20 via-emerald-900/20 to-teal-900/20 border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-30"></div>
            </div>
            Live Environmental Impact
          </CardTitle>
          <CardDescription className="text-gray-300">
            Real-time impact tracking updated every few seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimatedCounterCard
              title="Bottles Saved Today"
              value={realTimeCounters.bottlesToday}
              unit="bottles"
              icon={Droplets}
              iconColor="text-blue-400"
            />
            
            <AnimatedCounterCard
              title="CO₂ Reduced Today"
              value={realTimeCounters.co2Today}
              unit="kg"
              icon={Leaf}
              iconColor="text-green-400"
            />
            
            <AnimatedCounterCard
              title="Energy Saved Today"
              value={realTimeCounters.energyToday}
              unit="kWh"
              icon={Zap}
              iconColor="text-yellow-400"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white">Impact Rate</CardTitle>
            <CardDescription className="text-gray-400">
              Environmental impact per hour
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Bottles/Hour</span>
                <span className="font-bold text-blue-400">
                  {Math.round(realTimeCounters.bottlesToday / 24)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">CO₂ Reduction/Hour</span>
                <span className="font-bold text-green-400">
                  {(realTimeCounters.co2Today / 24).toFixed(2)} kg
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Energy Savings/Hour</span>
                <span className="font-bold text-yellow-400">
                  {(realTimeCounters.energyToday / 24).toFixed(2)} kWh
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Environmental Score</CardTitle>
            <CardDescription className="text-gray-400">
              Overall environmental performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#374151"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40 * 0.89} ${2 * Math.PI * 40}`}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: `0 ${2 * Math.PI * 40}` }}
                    animate={{ strokeDasharray: `${2 * Math.PI * 40 * 0.89} ${2 * Math.PI * 40}` }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-400">89</span>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-400 mt-2">Excellent Performance</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
