
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImpactEnvironmentTab } from "./ImpactEnvironmentTab";
import { ImpactFinancialTab } from "./ImpactFinancialTab";
import { ImpactReductionTab } from "./ImpactReductionTab";
import { ImpactSettings } from "./ImpactSettings";
import { ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";

interface ImpactLayoutProps {
  userName: string;
}

export function ImpactLayout({ userName }: ImpactLayoutProps) {
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  const [config, setConfig] = useState<Partial<ImpactConfig>>({
    bottleSize: 0.5,  // Default to 0.5L bottles
    bottleCost: 1.10, // Default to €1.10 per bottle
    userType: 'home' as const  // Type assertion to 'home' literal type
  });
  
  const [activeTab, setActiveTab] = useState("environmental");

  const handleConfigChange = (newConfig: Partial<ImpactConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {userName ? `${userName}'s` : 'Your'} Impact Calculator
        </h2>
        <p className="text-gray-400 mt-1">
          See how MYWATER system helps you save
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4 w-full bg-spotify-dark">
          <TabsTrigger value="environmental" className="py-2">Environment</TabsTrigger>
          <TabsTrigger value="financial" className="py-2">Money</TabsTrigger>
          <TabsTrigger value="equivalents" className="py-2">CO₂ Reduction</TabsTrigger>
          <TabsTrigger value="settings" className="py-2">My Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="environmental" className="mt-0">
          <ImpactEnvironmentTab 
            period={period}
            setPeriod={setPeriod}
            config={config}
          />
        </TabsContent>
        
        <TabsContent value="financial" className="mt-0">
          <ImpactFinancialTab 
            period={period}
            setPeriod={setPeriod}
            config={config}
          />
        </TabsContent>
        
        <TabsContent value="equivalents" className="mt-0">
          <ImpactReductionTab 
            period={period}
            setPeriod={setPeriod}
            config={config}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-0">
          <ImpactSettings 
            currentConfig={config}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
