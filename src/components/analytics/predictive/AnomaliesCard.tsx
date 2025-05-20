
import { Card } from "@/components/ui/card";
import { CircleAlert, AlertTriangle } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { format } from "date-fns";

interface AnomalyCardProps {
  anomalies: Array<{
    isAnomaly: boolean;
    type: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
    value: number;
    message: string;
  }>;
  isLoading: boolean;
}

export function AnomaliesCard({ anomalies, isLoading }: AnomalyCardProps) {
  if (isLoading) {
    return (
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Detected Anomalies</h3>
          <div className="bg-gray-200 animate-pulse h-6 w-16 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="bg-gray-200 animate-pulse h-12 rounded"></div>
          <div className="bg-gray-200 animate-pulse h-12 rounded"></div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <CircleAlert className="mr-2 h-5 w-5 text-amber-500" />
          Detected Anomalies
        </h3>
        <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded-md">
          {anomalies.length} found
        </span>
      </div>
      
      {anomalies.length > 0 ? (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {anomalies.map((anomaly, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-md flex items-start ${
                anomaly.severity === 'high' ? 'bg-red-50 border border-red-200' : 
                anomaly.severity === 'medium' ? 'bg-amber-50 border border-amber-200' : 
                'bg-blue-50 border border-blue-200'
              }`}
            >
              <AlertTriangle className={`h-5 w-5 mt-0.5 mr-2 ${
                anomaly.severity === 'high' ? 'text-red-500' : 
                anomaly.severity === 'medium' ? 'text-amber-500' : 
                'text-blue-500'
              }`} />
              <div>
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm">{anomaly.message}</p>
                  <Tooltip content={new Date(anomaly.timestamp).toLocaleString()}>
                    <span className="text-xs text-gray-500 ml-2">
                      {format(new Date(anomaly.timestamp), 'MMM d, HH:mm')}
                    </span>
                  </Tooltip>
                </div>
                <p className="text-xs mt-1 text-gray-600">
                  {anomaly.type.includes('volume') ? 'Volume anomaly' : 'Temperature anomaly'} •
                  {' '}{anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)} severity
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No anomalies detected</p>
          <p className="text-xs mt-1">System is operating within normal parameters</p>
        </div>
      )}
    </Card>
  );
}
