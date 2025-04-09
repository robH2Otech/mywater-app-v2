
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImpactPeriodToggle } from "./ImpactPeriodToggle";
import { ImpactDetails } from "./ImpactDetails";
import { MoneySavingsCalculator } from "./MoneySavingsCalculator";
import { useImpactCalculations, ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";
import { ImpactSettings } from "./ImpactSettings";
import { formatMetricValue } from "@/utils/formatUnitVolume";
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
    bottlesSaved, 
    waterSaved, 
    plasticSaved, 
    co2Saved,
    moneySaved,
    equivalents
  } = useImpactCalculations(period, config);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-6 w-full">
        <TabsTrigger value="environmental">Environment</TabsTrigger>
        <TabsTrigger value="financial">Money</TabsTrigger>
        <TabsTrigger value="equivalents">CO2 Reduction</TabsTrigger>
        <TabsTrigger value="settings">My Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="environmental" className="space-y-6">
        <ImpactPeriodToggle 
          period={period} 
          setPeriod={setPeriod} 
          includeAllTime={true} 
        />
        
        <div className="text-sm text-center text-gray-400 mb-2">
          <p>
            Using MYWATER instead of plastic bottles has already saved:
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Based on {config.bottleSize}L bottles at €{config.bottleCost?.toFixed(2)} each
          </p>
        </div>

        <ImpactDetails details={impactDetails} />
      </TabsContent>
      
      <TabsContent value="financial">
        <div className="space-y-4">
          <h3 className="font-medium text-center mb-4">
            Financial Impact
          </h3>
          
          <ImpactPeriodToggle 
            period={period} 
            setPeriod={setPeriod} 
            includeAllTime={true} 
          />

          <div className="p-4 bg-spotify-dark rounded-lg text-center mb-4">
            <h4 className="text-md font-medium text-gray-200 mb-1">Total Money Saved</h4>
            <p className="text-3xl font-bold text-mywater-blue">€{moneySaved.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-400 mt-2">Based on {config.bottleSize}L bottles at €{config.bottleCost?.toFixed(2)} each</p>
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
          plasticSaved={plasticSaved}
          bottlesSaved={bottlesSaved}
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
