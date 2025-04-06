
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImpactPeriodToggle } from "./ImpactPeriodToggle";
import { ImpactDetails } from "./ImpactDetails";
import { MoneySavingsCalculator } from "./MoneySavingsCalculator";
import { useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";

interface ImpactTabsProps {
  period: "day" | "month" | "year";
  setPeriod: (value: "day" | "month" | "year") => void;
}

export function ImpactTabs({ period, setPeriod }: ImpactTabsProps) {
  const { 
    impactDetails,
    bottlesSaved, 
    waterSaved, 
    plasticSaved, 
    co2Saved
  } = useImpactCalculations(period);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="overview">Environmental Impact</TabsTrigger>
        <TabsTrigger value="details">Detailed Impact</TabsTrigger>
        <TabsTrigger value="savings">Drink more, save more</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        <ImpactPeriodToggle period={period} setPeriod={setPeriod} />
        
        <div className="text-sm text-center text-gray-400 mb-2">
          <p>
            Using MYWATER instead of plastic bottles has already saved:
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
        <MoneySavingsCalculator />
      </TabsContent>
    </Tabs>
  );
}
