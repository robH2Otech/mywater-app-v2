
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Wrench, Zap, Filter } from "lucide-react";
import { UVCBusinessMetrics } from "@/utils/businessUvcCalculations";
import { motion } from "framer-motion";

interface MaintenanceTrackerProps {
  metrics: UVCBusinessMetrics;
  period: "day" | "month" | "year" | "all-time";
}

export function MaintenanceTracker({ metrics, period }: MaintenanceTrackerProps) {
  // Mock maintenance data - in real app this would come from database
  const maintenanceItems = [
    {
      id: "uvc-lamp",
      name: "UVC Lamp Replacement",
      type: "critical",
      currentHours: 8760, // 1 year
      maxHours: 9000,
      lastMaintenance: "2024-06-01",
      nextMaintenance: "2024-12-01",
      status: "warning",
      efficiency: 92
    },
    {
      id: "pre-filter",
      name: "Pre-Filter Cartridge",
      type: "routine",
      currentHours: 2160, // 3 months
      maxHours: 2880, // 4 months
      lastMaintenance: "2024-09-01",
      nextMaintenance: "2025-01-01",
      status: "good",
      efficiency: 98
    },
    {
      id: "carbon-filter",
      name: "Carbon Filter",
      type: "routine",
      currentHours: 4320, // 6 months
      maxHours: 4380, // 6 months
      lastMaintenance: "2024-06-25",
      nextMaintenance: "2024-12-25",
      status: "urgent",
      efficiency: 85
    },
    {
      id: "system-calibration",
      name: "System Calibration",
      type: "preventive",
      currentHours: 720, // 1 month
      maxHours: 2160, // 3 months
      lastMaintenance: "2024-11-01",
      nextMaintenance: "2025-02-01",
      status: "good",
      efficiency: 100
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-400 bg-green-900/20 border-green-400";
      case "warning": return "text-yellow-400 bg-yellow-900/20 border-yellow-400";
      case "urgent": return "text-red-400 bg-red-900/20 border-red-400";
      default: return "text-gray-400 bg-gray-900/20 border-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good": return <CheckCircle className="h-4 w-4" />;
      case "warning": return <Clock className="h-4 w-4" />;
      case "urgent": return <AlertTriangle className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "critical": return <Zap className="h-5 w-5 text-red-400" />;
      case "routine": return <Filter className="h-5 w-5 text-blue-400" />;
      case "preventive": return <Wrench className="h-5 w-5 text-green-400" />;
      default: return <Wrench className="h-5 w-5 text-gray-400" />;
    }
  };

  const urgentItems = maintenanceItems.filter(item => item.status === "urgent").length;
  const warningItems = maintenanceItems.filter(item => item.status === "warning").length;

  return (
    <div className="space-y-6">
      {/* Maintenance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Urgent Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{urgentItems}</div>
              <p className="text-xs text-red-300">Requires immediate attention</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-500/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-300 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Due Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{warningItems}</div>
              <p className="text-xs text-yellow-300">Schedule maintenance</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Overall Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{metrics.maintenanceEfficiency.toFixed(1)}%</div>
              <p className="text-xs text-green-300">System performance</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Maintenance Items List */}
      <Card className="bg-gradient-to-br from-spotify-darker to-spotify-dark border-spotify-accent/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white/10">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{item.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-gray-400">
                        Last: {new Date(item.lastMaintenance).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        Next: {new Date(item.nextMaintenance).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right min-w-[120px]">
                    <div className="text-sm text-gray-300 mb-1">
                      {item.currentHours.toLocaleString()} / {item.maxHours.toLocaleString()} hrs
                    </div>
                    <Progress 
                      value={(item.currentHours / item.maxHours) * 100} 
                      className="w-full h-2"
                    />
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <div className="text-sm text-white font-medium">
                      {item.efficiency}%
                    </div>
                    <div className="text-xs text-gray-400">efficiency</div>
                  </div>

                  <Badge className={`${getStatusColor(item.status)} border flex items-center gap-1`}>
                    {getStatusIcon(item.status)}
                    {item.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
