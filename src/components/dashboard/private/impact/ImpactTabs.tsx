
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImpactPeriodToggle } from "./ImpactPeriodToggle";
import { ImpactDetails } from "./ImpactDetails";
import { MoneySavingsCalculator } from "./MoneySavingsCalculator";
import { useImpactCalculations, ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";
import { ImpactSettings } from "./ImpactSettings";

interface ImpactTabsProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (value: "day" | "month" | "year" | "all-time") => void;
  config: Partial<ImpactConfig>;
  onConfigChange: (config: Partial<ImpactConfig>) => void;
}

export function ImpactTabs({ period, setPeriod, config, onConfigChange }: ImpactTabsProps) {
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
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="overview">Environmental Impact</TabsTrigger>
        <TabsTrigger value="details">Detailed Impact</TabsTrigger>
        <TabsTrigger value="savings">Financial Impact</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
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
      </TabsContent>
      
      <TabsContent value="details">
        <div className="space-y-4">
          <h3 className="font-medium text-center mb-4">
            Detailed Environmental Impact
          </h3>
          
          <ImpactDetails details={impactDetails} />
          
          <div className="text-center text-sm text-gray-400">
            <p>Data based on average consumption patterns and industry standards.</p>
            <p className="mt-1">Keep using MYWATER to increase your positive impact!</p>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="savings">
        <MoneySavingsCalculator 
          baseBottlePrice={config.bottleCost || 1.1}
          baseDailyConsumption={config.dailyIntake || 2}
          baseBottleSize={config.bottleSize || 0.5}
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
