
import { useState } from "react";
import { UnitData } from "@/types/analytics";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, AlertTriangle, Database } from "lucide-react";
import { UnitMeasurements } from "@/components/units/UnitMeasurements";
import { MLUnitAnalytics } from "@/components/units/MLUnitAnalytics";

interface UnitMlDetailsProps {
  unit: UnitData;
  className?: string;
}

export function UnitMlDetails({ unit, className = "" }: UnitMlDetailsProps) {
  const [activeTab, setActiveTab] = useState("measurements");
  const [measurements, setMeasurements] = useState<any[]>([]);
  
  // Simple check to decide if we have enough data for ML
  // Convert total_volume to number to ensure proper comparison
  const totalVolume = typeof unit.total_volume === 'string' 
    ? parseFloat(unit.total_volume) 
    : (unit.total_volume || 0);
  
  const hasEnoughData = totalVolume > 100;
  
  // Function to receive measurements from UnitMeasurements component
  const handleMeasurementsLoaded = (loadedMeasurements: any[]) => {
    setMeasurements(loadedMeasurements);
  };
  
  return (
    <Card className={`border-spotify-accent bg-spotify-darker overflow-hidden ${className}`}>
      <Tabs 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full bg-spotify-dark border-b border-spotify-accent rounded-none px-4">
          <TabsTrigger value="measurements" className="data-[state=active]:bg-mywater-blue">
            <Database className="h-4 w-4 mr-2" />
            Measurements
          </TabsTrigger>
          <TabsTrigger 
            value="ml-analytics" 
            className="data-[state=active]:bg-mywater-blue"
            disabled={!hasEnoughData}
          >
            <Activity className="h-4 w-4 mr-2" />
            ML Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="measurements" className="p-0 m-0">
          <UnitMeasurements unitId={unit.id} onMeasurementsLoaded={handleMeasurementsLoaded} />
        </TabsContent>
        
        <TabsContent value="ml-analytics" className="p-4 m-0">
          {hasEnoughData ? (
            <MLUnitAnalytics unit={unit} measurements={measurements} />
          ) : (
            <div className="p-8 text-center">
              <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Not Enough Data</h3>
              <p className="text-gray-400">
                This unit doesn't have enough measurement data for ML analysis.
                More data is needed before predictions can be generated.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
