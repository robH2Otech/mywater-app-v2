
import React from 'react';
import { AnomalyDetection } from '@/types/ml';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface AnomaliesListProps {
  anomalies: AnomalyDetection[];
  onUpdateStatus: (id: string, status: string) => Promise<void>;
}

export function AnomaliesList({ anomalies, onUpdateStatus }: AnomaliesListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      default:
        return 'bg-red-500/10 text-red-500 border-red-500/30';
    }
  };

  const handleStatusUpdate = async (anomaly: AnomalyDetection, newStatus: string) => {
    if (anomaly.id && onUpdateStatus) {
      await onUpdateStatus(anomaly.id, newStatus);
    }
  };

  // If no anomalies, show a message
  if (!anomalies || anomalies.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No anomalies detected in the data.</p>
    );
  }

  return (
    <div className="space-y-3">
      {anomalies.map((anomaly) => (
        <Card key={anomaly.id} className="overflow-hidden border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm flex items-center">
                  <AlertTriangle className="mr-1 h-4 w-4 text-red-500" /> 
                  {anomaly.type || 'Anomaly'} detected
                </h4>
                <p className="text-sm text-muted-foreground mt-1">{anomaly.description}</p>
                
                <div className="mt-2 flex items-center space-x-2">
                  <Badge variant="outline" className={getStatusBadgeClass(anomaly.status)}>
                    {getStatusIcon(anomaly.status)} 
                    <span className="ml-1">{anomaly.status || 'detected'}</span>
                  </Badge>
                  
                  {anomaly.detected_at && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(anomaly.detected_at), 'MMM d, yyyy HH:mm')}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {anomaly.status !== 'resolved' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleStatusUpdate(anomaly, 'resolved')}
                    className="text-xs h-7"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" /> Mark Resolved
                  </Button>
                )}
                
                {anomaly.status !== 'pending' && anomaly.status !== 'resolved' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleStatusUpdate(anomaly, 'pending')}
                    className="text-xs h-7"
                  >
                    <Clock className="h-3 w-3 mr-1" /> Mark Pending
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
