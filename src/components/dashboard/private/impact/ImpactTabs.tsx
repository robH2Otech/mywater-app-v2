
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImpactDetails } from "./ImpactDetails";
import { MoneySavingsCalculator } from "./MoneySavingsCalculator";
import { useImpactCalculations, ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";
import { ImpactSettings } from "./ImpactSettings";
import { ReductionEquivalents } from "./ReductionEquivalents";

interface ImpactTabsProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (value: "day" | "month" | "year" | "all-time") => void;
  config: Partial<ImpactConfig>;
  onConfigChange: (config: Partial<ImpactConfig>) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function ImpactTabs({ 
  period, 
  setPeriod, 
  config, 
  onConfigChange,
  activeTab,
  setActiveTab
}: ImpactTabsProps) {
  const { 
    impactDetails,
    moneySaved,
    co2Saved,
    equivalents
  } = useImpactCalculations(period, config);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-3 w-full bg-spotify-dark">
        <TabsTrigger value="environmental">Environment</TabsTrigger>
        <TabsTrigger value="financial">Money</TabsTrigger>
        <TabsTrigger value="equivalents">CO₂ Reduction</TabsTrigger>
        <TabsTrigger value="settings">My Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="financial">
        <div className="space-y-2">
          <div className="p-4 bg-spotify-dark rounded-lg text-center mb-2">
            <h4 className="text-sm font-medium text-gray-200 mb-0.5">Total Money Saved</h4>
            <p className="text-2xl font-bold text-mywater-blue">€{moneySaved.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-400 mt-0.5">Based on {config.bottleSize}L bottles at €{config.bottleCost?.toFixed(2)} each</p>
          </div>
          
          <MoneySavingsCalculator 
            baseBottlePrice={config.bottleCost || 1.1}
            baseDailyConsumption={config.dailyIntake || 2}
            baseBottleSize={config.bottleSize || 0.5}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="equivalents">
        <ReductionEquivalents 
          co2Saved={co2Saved}
          plasticSaved={0} // This will be calculated inside the component
          bottlesSaved={0} // This will be calculated inside the component
          period={period}
        />
      </TabsContent>

      <TabsContent value="settings">
        <ImpactSettings 
          currentConfig={config}
          onConfigChange={onConfigChange}
        />
      </TabsContent>
    </Tabs>
  );
}
