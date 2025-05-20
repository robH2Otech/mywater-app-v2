
import React from 'react';
import { AnomalyDetection } from '@/types/ml';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Activity, AlertCircle, Check, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnomaliesListProps {
  anomalies: AnomalyDetection[];
  onUpdateStatus?: (id: string, status: string) => Promise<void>;
}

export function AnomaliesList({ anomalies, onUpdateStatus }: AnomaliesListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            <AlertCircle className="h-3 w-3 mr-1" /> New
          </Badge>
        );
      case 'reviewing':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <Clock className="h-3 w-3 mr-1" /> Reviewing
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            <Check className="h-3 w-3 mr-1" /> Confirmed
          </Badge>
        );
      case 'false_positive':
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-500">
            <X className="h-3 w-3 mr-1" /> False Positive
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            <Check className="h-3 w-3 mr-1" /> Resolved
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">Unknown</Badge>
        );
    }
  };

  if (!anomalies || anomalies.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No anomalies detected.</p>
    );
  }

  return (
    <div className="space-y-3">
      {anomalies.map((anomaly, index) => (
        <Card key={anomaly.id || index} className={`overflow-hidden border-l-4 border-${anomaly.severity === 'high' ? 'red' : anomaly.severity === 'medium' ? 'amber' : 'blue'}-500`}>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium flex items-center">
                  <Activity className="mr-2 h-4 w-4" />
                  {anomaly.type} Anomaly
                </h4>
                
                <div className="mt-1 flex items-center space-x-3">
                  <span className="text-sm">
                    <Clock className="inline h-3 w-3 mr-1 opacity-70" />
                    {format(new Date(anomaly.detectionDate), 'MMM d, yyyy')}
                  </span>
                  
                  {getStatusBadge(anomaly.status)}
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  Deviation: {anomaly.deviationPercentage.toFixed(1)}% {' '}
                  (Expected: {anomaly.expectedValue.toFixed(1)}, Actual: {anomaly.value.toFixed(1)})
                </p>
              </div>

              {onUpdateStatus && anomaly.status !== 'resolved' && (
                <div className="flex space-x-2">
                  {anomaly.status === 'new' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onUpdateStatus(anomaly.id, 'reviewing')}
                    >
                      Review
                    </Button>
                  )}
                  
                  {['new', 'reviewing'].includes(anomaly.status) && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-500 border-red-500 hover:bg-red-500/10"
                        onClick={() => onUpdateStatus(anomaly.id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-gray-500 border-gray-500 hover:bg-gray-500/10"
                        onClick={() => onUpdateStatus(anomaly.id, 'false_positive')}
                      >
                        False Positive
                      </Button>
                    </>
                  )}
                  
                  {['confirmed', 'reviewing'].includes(anomaly.status) && (
                    <Button
                      size="sm" 
                      variant="outline"
                      className="text-green-500 border-green-500 hover:bg-green-500/10"
                      onClick={() => onUpdateStatus(anomaly.id, 'resolved')}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              )}
              
              {anomaly.notes && (
                <p className="text-sm text-muted-foreground max-w-sm mt-2">{anomaly.notes}</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
