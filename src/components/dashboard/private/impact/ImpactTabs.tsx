
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImpactPeriodToggle } from "./ImpactPeriodToggle";
import { ImpactDetails } from "./ImpactDetails";
import { MoneySavingsCalculator } from "./MoneySavingsCalculator";
import { useImpactCalculations, ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";
import { ImpactSettings } from "./ImpactSettings";
import { formatMetricValue } from "@/utils/formatUnitVolume";
import { ReductionEquivalents } from "./ReductionEquivalents";
import { useIsMobile } from "@/hooks/use-mobile";

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
  
  const isMobile = useIsMobile();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-4 w-full">
        <TabsTrigger value="environmental" className="text-xs md:text-sm">Environment</TabsTrigger>
        <TabsTrigger value="financial" className="text-xs md:text-sm">Money</TabsTrigger>
        <TabsTrigger value="equivalents" className="text-xs md:text-sm">CO2 Reduction</TabsTrigger>
        <TabsTrigger value="settings" className="text-xs md:text-sm">My Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="environmental" className="space-y-4">
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
        <div className="space-y-3">
          <h3 className={`font-medium text-center mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Financial Impact
          </h3>
          
          <ImpactPeriodToggle 
            period={period} 
            setPeriod={setPeriod} 
            includeAllTime={true} 
          />

          <div className="p-3 bg-spotify-dark rounded-lg text-center mb-3">
            <h4 className="text-sm font-medium text-gray-200 mb-1">Total Money Saved</h4>
            <p className="text-2xl font-bold text-mywater-blue">€{moneySaved.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-400 mt-1">Based on {config.bottleSize}L bottles at €{config.bottleCost?.toFixed(2)} each</p>
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
