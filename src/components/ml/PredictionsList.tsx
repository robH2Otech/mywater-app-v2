
import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Timer, 
  AlertCircle, 
  Wrench,
  ThermometerSun,
  BarChart,
  Activity
} from "lucide-react";
import { MaintenancePrediction } from "@/types/ml";
import { format, formatDistanceToNow } from "date-fns";

interface PredictionsListProps {
  predictions: MaintenancePrediction[];
  className?: string;
}

export function PredictionsList({ predictions, className = "" }: PredictionsListProps) {
  // If there are no predictions
  if (!predictions || predictions.length === 0) {
    return (
      <Card className={`p-6 bg-spotify-darker border-spotify-accent ${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <BarChart className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-1">No Predictions Available</h3>
          <p className="text-gray-400 text-center max-w-md">
            There isn't enough data yet to generate maintenance predictions for this unit.
            Continue collecting measurements to enable predictive maintenance.
          </p>
        </div>
      </Card>
    );
  }

  // Get the appropriate icon for maintenance type
  const getMaintenanceIcon = (type: string) => {
    switch (type) {
      case 'filter_change':
        return <Wrench className="h-5 w-5 text-blue-400" />;
      case 'uvc_replacement':
        return <ThermometerSun className="h-5 w-5 text-yellow-400" />;
      case 'general_service':
        return <Activity className="h-5 w-5 text-green-400" />;
      default:
        return <Wrench className="h-5 w-5 text-blue-400" />;
    }
  };

  // Get priority styling
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high': 
        return 'bg-red-900/30 text-red-300 border-red-700';
      case 'medium':
        return 'bg-yellow-900/30 text-yellow-300 border-yellow-700';
      case 'low':
        return 'bg-green-900/30 text-green-300 border-green-700';
      default:
        return 'bg-blue-900/30 text-blue-300 border-blue-700';
    }
  };

  // Format maintenance type for display
  const formatMaintenanceType = (type: string) => {
    switch (type) {
      case 'filter_change': return 'Filter Change';
      case 'uvc_replacement': return 'UVC Replacement';
      case 'general_service': return 'General Service';
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Card className={`p-4 bg-spotify-darker border-spotify-accent ${className}`}>
      <h3 className="text-lg font-semibold mb-4 px-2">Maintenance Predictions</h3>
      
      <div className="space-y-3">
        {predictions.map(prediction => (
          <Card key={prediction.id} className="p-3 bg-spotify-dark border-spotify-accent hover:border-mywater-blue">
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                {getMaintenanceIcon(prediction.maintenanceType)}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <h4 className="text-md font-medium">
                    {formatMaintenanceType(prediction.maintenanceType)}
                  </h4>
                  
                  <Badge className={`${getPriorityStyle(prediction.priority)} capitalize`}>
                    {prediction.priority} Priority
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {format(new Date(prediction.predictedDate), "PPP")} 
                    <span className="text-xs ml-1">
                      ({formatDistanceToNow(new Date(prediction.predictedDate), { addSuffix: true })})
                    </span>
                  </span>
                </div>

                <div className="flex items-center text-xs text-gray-500">
                  <Timer className="h-3 w-3 mr-1" />
                  <span>
                    {prediction.estimatedDaysRemaining} days remaining
                  </span>
                  
                  <div className="mx-2 h-1 w-1 rounded-full bg-gray-600" />
                  
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <span>
                    {Math.round(prediction.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
