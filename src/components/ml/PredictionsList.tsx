
import React from 'react';
import { MaintenancePrediction } from '@/types/ml';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Tool, AlertCircle } from 'lucide-react';
import { format, isBefore } from 'date-fns';

interface PredictionsListProps {
  predictions: MaintenancePrediction[];
}

export function PredictionsList({ predictions }: PredictionsListProps) {
  const getUrgencyColor = (date: Date | string) => {
    const predictionDate = new Date(date);
    const now = new Date();
    const inOneMonth = new Date();
    inOneMonth.setMonth(inOneMonth.getMonth() + 1);
    
    if (isBefore(predictionDate, now)) {
      return 'border-red-500 bg-red-500/10';
    } else if (isBefore(predictionDate, inOneMonth)) {
      return 'border-amber-500 bg-amber-500/10';
    } else {
      return 'border-green-500 bg-green-500/10';
    }
  };

  const getUrgencyBadge = (date: Date | string) => {
    const predictionDate = new Date(date);
    const now = new Date();
    const inOneMonth = new Date();
    inOneMonth.setMonth(inOneMonth.getMonth() + 1);
    
    if (isBefore(predictionDate, now)) {
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          <AlertCircle className="h-3 w-3 mr-1" /> Overdue
        </Badge>
      );
    } else if (isBefore(predictionDate, inOneMonth)) {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-500">
          <AlertCircle className="h-3 w-3 mr-1" /> Soon
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          <Calendar className="h-3 w-3 mr-1" /> Scheduled
        </Badge>
      );
    }
  };

  if (!predictions || predictions.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No maintenance predictions available.</p>
    );
  }

  return (
    <div className="space-y-3">
      {predictions.map((prediction, index) => (
        <Card 
          key={prediction.id || index} 
          className={`overflow-hidden border-l-4 ${getUrgencyColor(prediction.predicted_date)}`}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium flex items-center">
                  <Tool className="mr-2 h-4 w-4" />
                  {prediction.maintenance_type || 'Maintenance'} Required
                </h4>
                
                <div className="mt-1 flex items-center space-x-3">
                  {prediction.predicted_date && (
                    <span className="text-sm">
                      <Calendar className="inline h-3 w-3 mr-1 opacity-70" />
                      {format(new Date(prediction.predicted_date), 'MMM d, yyyy')}
                    </span>
                  )}
                  
                  {getUrgencyBadge(prediction.predicted_date)}
                </div>
                
                {prediction.confidence && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Confidence: {(prediction.confidence * 100).toFixed(0)}%
                  </p>
                )}
              </div>
              
              <div>
                {prediction.recommendation && (
                  <p className="text-sm text-muted-foreground max-w-xs text-right">
                    {prediction.recommendation}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
