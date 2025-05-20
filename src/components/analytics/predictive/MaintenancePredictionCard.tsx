
import { Card } from "@/components/ui/card";
import { CalendarDays, Clock, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface MaintenancePredictionProps {
  prediction: {
    unitId: string;
    unitName: string;
    predictedMaintenanceDate: Date | null;
    currentValue: number;
    thresholdValue: number;
    rateOfChange: number;
    daysRemaining: number | null;
    confidence: 'low' | 'medium' | 'high';
  } | null;
  isLoading: boolean;
}

export function MaintenancePredictionCard({ prediction, isLoading }: MaintenancePredictionProps) {
  if (isLoading) {
    return (
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Maintenance Prediction</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-gray-200 animate-pulse h-16 rounded"></div>
          <div className="bg-gray-200 animate-pulse h-8 rounded"></div>
          <div className="bg-gray-200 animate-pulse h-6 rounded-full"></div>
        </div>
      </Card>
    );
  }
  
  if (!prediction || !prediction.predictedMaintenanceDate) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Maintenance Prediction</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Insufficient data for prediction</p>
          <p className="text-xs mt-1">More measurement history needed</p>
        </div>
      </Card>
    );
  }
  
  // Calculate usage percentage
  const usagePercentage = Math.min(
    100,
    Math.round((prediction.currentValue / prediction.thresholdValue) * 100)
  );
  
  const daysText = prediction.daysRemaining !== null
    ? prediction.daysRemaining < 0 
      ? 'Maintenance overdue' 
      : `${prediction.daysRemaining} days remaining`
    : 'Unable to predict';
  
  const confidenceLabel = {
    'low': 'Low confidence (limited data)',
    'medium': 'Medium confidence',
    'high': 'High confidence (extensive data)'
  }[prediction.confidence];
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <CalendarDays className="mr-2 h-5 w-5 text-blue-500" />
        Maintenance Prediction
      </h3>
      
      <div className="space-y-4">
        {prediction.predictedMaintenanceDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium">
                  {prediction.daysRemaining && prediction.daysRemaining <= 0
                    ? 'Maintenance needed now'
                    : `Maintenance needed in ${formatDistanceToNow(prediction.predictedMaintenanceDate)}`}
                </span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {prediction.predictedMaintenanceDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-gray-500" />
              <span>Current usage: {Math.round(prediction.currentValue)} / {prediction.thresholdValue}</span>
            </div>
            <span className="font-medium">{daysText}</span>
          </div>
          
          <Progress value={usagePercentage} className="h-2" 
            style={{
              backgroundColor: usagePercentage > 90 ? '#fee2e2' : '#f3f4f6',
              backgroundSize: `${usagePercentage}% 100%`,
              backgroundImage: `linear-gradient(to right, ${usagePercentage > 90 ? '#ef4444' : (usagePercentage > 70 ? '#f97316' : '#3b82f6')} 0%, ${usagePercentage > 90 ? '#ef4444' : (usagePercentage > 70 ? '#f97316' : '#3b82f6')} 100%)`,
            }}
          />
          
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-500">Rate: {prediction.rateOfChange.toFixed(2)} units/day</span>
            <span className="text-xs text-gray-500">{confidenceLabel}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
