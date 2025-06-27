
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, Thermometer, Droplets, Zap, AlertTriangle } from "lucide-react";
import { useUnits } from "@/hooks/useUnits";
import { motion } from "framer-motion";

interface LiveSystemStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LiveSystemStatusDialog({ open, onOpenChange }: LiveSystemStatusDialogProps) {
  const { data: units = [], isLoading } = useUnits();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'online':
        return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'maintenance':
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'offline':
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'online':
        return <Activity className="h-4 w-4" />;
      case 'maintenance':
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'offline':
      case 'error':
        return <Wifi className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-spotify-darker border-spotify-accent">
          <DialogHeader>
            <DialogTitle className="text-white">Live System Status</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-spotify-darker border-spotify-accent">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-400" />
            Live System Status - {units.length} Unit{units.length !== 1 ? 's' : ''} Connected
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {units.length === 0 ? (
            <Card className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-700">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Units Connected</h3>
                <p className="text-gray-400">Connect your MYWATER units to see real-time status</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {units.map((unit, index) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-r from-spotify-dark to-spotify-darker border-spotify-accent/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                          {getStatusIcon(unit.status)}
                          {unit.name || `Unit ${unit.id}`}
                        </CardTitle>
                        <Badge className={getStatusColor(unit.status)}>
                          {unit.status || 'Unknown'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Droplets className="h-4 w-4 text-blue-400" />
                          <div>
                            <div className="text-sm text-gray-400">Total Volume</div>
                            <div className="text-white font-semibold">
                              {unit.total_volume ? `${Number(unit.total_volume).toFixed(1)} m³` : 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-orange-400" />
                          <div>
                            <div className="text-sm text-gray-400">Temperature</div>
                            <div className="text-white font-semibold">22.5°C</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <div>
                            <div className="text-sm text-gray-400">UVC Status</div>
                            <div className="text-white font-semibold">Active</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4 text-green-400" />
                          <div>
                            <div className="text-sm text-gray-400">Connection</div>
                            <div className="text-white font-semibold">Strong</div>
                          </div>
                        </div>
                      </div>
                      
                      {unit.location && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <div className="text-sm text-gray-400">Location</div>
                          <div className="text-white">{unit.location}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
