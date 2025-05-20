
import { useEffect, useState } from "react";
import { UnitData } from "@/types/analytics";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, AlertTriangle, Calendar, Database } from "lucide-react";
import { UnitMeasurements } from "@/components/units/UnitMeasurements";
import { MLUnitAnalytics } from "@/components/units/MLUnitAnalytics";

interface UnitMlDetailsProps {
  unit: UnitData;
}

export function UnitMlDetails({ unit }: UnitMlDetailsProps) {
  const [activeTab, setActiveTab] = useState("measurements");
  
  // Simple check to decide if we have enough data for ML
  const hasEnoughData = unit.total_volume > 100;
  
  return (
    <Card className="border-spotify-accent bg-spotify-darker overflow-hidden">
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
          <UnitMeasurements unitId={unit.id} />
        </TabsContent>
        
        <TabsContent value="ml-analytics" className="p-4 m-0">
          {hasEnoughData ? (
            <MLUnitAnalytics unit={unit} />
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
