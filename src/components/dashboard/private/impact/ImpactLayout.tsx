
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, Coins, Recycle, Waves } from "lucide-react";
import { TabContentItem } from "@/components/dashboard/private/TabContentItem";
import { ImpactPeriodToggle } from "@/components/dashboard/private/impact/ImpactPeriodToggle";
import { ImpactSettings } from "@/components/dashboard/private/impact/ImpactSettings";
import { useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";
import { EnvironmentTab } from "./tabs/EnvironmentTab";
import { MoneyTab } from "./tabs/MoneyTab";
import { CO2Tab } from "./tabs/CO2Tab";
import { PlasticTab } from "./tabs/PlasticTab";

export function ImpactLayout() {
  // State for managing tabs and impact calculation configurations
  const [activeTab, setActiveTab] = useState("environmental");
  const [period, setPeriod] = useState<"day" | "month" | "year" | "all-time">("year");
  const [config, setConfig] = useState({
    bottleSize: 0.5,  // Default to 0.5L bottles
    bottleCost: 1.10, // Default to €1.10 per bottle
    userType: 'home' as const
  });
  
  // Impact calculations
  const { 
    bottlesSaved, 
    waterSaved, 
    plasticSaved, 
    co2Saved, 
    moneySaved
  } = useImpactCalculations(period, config);

  // Handle configuration changes
  const handleConfigChange = (newConfig: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <div className="space-y-4">
      {/* Main Tabs */}
      <Tabs
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex justify-center mb-4">
          <TabsList className="bg-spotify-dark">
            <TabsTrigger value="environmental" className="data-[state=active]:bg-green-700/50">
              <Leaf className="h-4 w-4 mr-1.5" />
              Environment
            </TabsTrigger>
            <TabsTrigger value="money" className="data-[state=active]:bg-amber-700/50">
              <Coins className="h-4 w-4 mr-1.5" />
              Money
            </TabsTrigger>
            <TabsTrigger value="co2" className="data-[state=active]:bg-blue-700/50">
              <Recycle className="h-4 w-4 mr-1.5" />
              CO₂ Emissions
            </TabsTrigger>
            <TabsTrigger value="plastic" className="data-[state=active]:bg-emerald-700/50">
              <Waves className="h-4 w-4 mr-1.5" />
              Plastic Reduction
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Environment Tab */}
        <TabContentItem value="environmental">
          <EnvironmentTab 
            period={period}
            setPeriod={setPeriod}
            bottlesSaved={bottlesSaved}
            waterSaved={waterSaved}
            plasticSaved={plasticSaved}
            co2Saved={co2Saved}
            moneySaved={moneySaved}
          />
        </TabContentItem>
        
        {/* Money Tab */}
        <TabContentItem value="money">
          <MoneyTab
            period={period}
            setPeriod={setPeriod}
            config={config}
          />
        </TabContentItem>
        
        {/* CO2 Emissions Tab */}
        <TabContentItem value="co2">
          <CO2Tab
            period={period}
            setPeriod={setPeriod}
            co2Saved={co2Saved}
          />
        </TabContentItem>
        
        {/* Plastic Reduction Tab */}
        <TabContentItem value="plastic">
          <PlasticTab
            period={period}
            setPeriod={setPeriod}
            plasticSaved={plasticSaved}
            bottlesSaved={bottlesSaved}
          />
        </TabContentItem>
      </Tabs>
      
      {/* Settings Section - Always visible */}
      <div className="mt-6">
        <ImpactSettings 
          currentConfig={config}
          onConfigChange={handleConfigChange}
        />
      </div>
    </div>
  );
}
