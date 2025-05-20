
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { AnomaliesCard } from "./AnomaliesCard";
import { MaintenancePredictionCard } from "./MaintenancePredictionCard";
import { RiskAssessmentCard } from "./RiskAssessmentCard";
import { usePredictiveAnalytics } from "@/hooks/analytics/usePredictiveAnalytics";

export function PredictiveMaintenanceDashboard() {
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  
  // Fetch available units
  const { data: units = [], isLoading: isUnitsLoading } = useQuery({
    queryKey: ["units-for-predictive"],
    queryFn: async () => {
      const unitsCollection = collection(db, "units");
      const snapshot = await getDocs(unitsCollection);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.id,
      }));
    },
  });
  
  // Use the predictive analytics hook
  const { 
    anomalies, 
    maintenancePrediction,
    anomalyScore,
    riskAssessment,
    isLoading 
  } = usePredictiveAnalytics(selectedUnitId);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-white">Predictive Maintenance & Anomaly Detection</h2>
        <p className="text-gray-300 mb-4">
          AI-powered analytics to predict maintenance needs and detect anomalies in your water systems
        </p>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg mb-6">
          <label htmlFor="unit-select" className="block text-sm font-medium text-gray-200 mb-2">
            Select Unit
          </label>
          <Select 
            disabled={isUnitsLoading} 
            value={selectedUnitId} 
            onValueChange={(value) => setSelectedUnitId(value)}
          >
            <SelectTrigger id="unit-select" className="bg-white/10 border-gray-600 text-white">
              <SelectValue placeholder="Select a unit to analyze" />
            </SelectTrigger>
            <SelectContent>
              {units.map(unit => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedUnitId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MaintenancePredictionCard 
            prediction={maintenancePrediction} 
            isLoading={isLoading} 
          />
          <RiskAssessmentCard
            anomalyScore={anomalyScore}
            riskLevel={riskAssessment}
            unit={units.find(u => u.id === selectedUnitId)}
            isLoading={isLoading}
          />
          <div className="md:col-span-2">
            <AnomaliesCard anomalies={anomalies || []} isLoading={isLoading} />
          </div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-xl p-8 text-center">
          <h3 className="text-xl text-gray-300 font-medium mb-2">Select a Unit to Begin Analysis</h3>
          <p className="text-gray-400">Choose a water system to view its predictive maintenance data and anomaly analysis</p>
        </div>
      )}
    </div>
  );
}
