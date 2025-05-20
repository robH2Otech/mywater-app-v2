
import { Card } from "@/components/ui/card";
import { CircleCheck, AlertTriangle, AlertCircle } from "lucide-react";

interface RiskAssessmentCardProps {
  anomalyScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  unit: { id: string; name: string } | undefined;
  isLoading: boolean;
}

export function RiskAssessmentCard({ anomalyScore, riskLevel, unit, isLoading }: RiskAssessmentCardProps) {
  if (isLoading) {
    return (
      <Card className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">System Risk Assessment</h3>
        </div>
        <div className="bg-gray-200 animate-pulse h-32 rounded"></div>
      </Card>
    );
  }
  
  const riskColorMap = {
    low: "bg-green-100 text-green-800 border-green-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    high: "bg-red-100 text-red-800 border-red-200"
  };
  
  const iconMap = {
    low: <CircleCheck className="h-8 w-8 text-green-500" />,
    medium: <AlertTriangle className="h-8 w-8 text-amber-500" />,
    high: <AlertCircle className="h-8 w-8 text-red-500" />
  };
  
  const riskTitle = {
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk"
  };
  
  const riskDescription = {
    low: "System is operating normally with no significant anomalies detected",
    medium: "Some unusual patterns detected, monitoring recommended",
    high: "Multiple anomalies detected, immediate attention recommended"
  };
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">System Risk Assessment</h3>
      
      <div className={`p-4 rounded-md border ${riskColorMap[riskLevel]}`}>
        <div className="flex items-center">
          <div className="mr-4">{iconMap[riskLevel]}</div>
          <div>
            <h4 className="font-medium text-lg">{riskTitle[riskLevel]}</h4>
            <p className="text-sm mt-1">{riskDescription[riskLevel]}</p>
            {unit && <p className="text-xs mt-2 font-medium">{unit.name}</p>}
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-current border-opacity-20">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Anomaly Score</span>
            <div className="bg-white bg-opacity-50 px-2 py-1 rounded text-sm font-semibold">
              {anomalyScore}/100
            </div>
          </div>
          
          <div className="mt-2 w-full bg-white bg-opacity-25 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                riskLevel === 'high' ? 'bg-red-500' : 
                riskLevel === 'medium' ? 'bg-amber-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${anomalyScore}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
