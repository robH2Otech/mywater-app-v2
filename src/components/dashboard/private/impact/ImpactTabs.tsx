
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImpactPeriodToggle } from "./ImpactPeriodToggle";
import { ImpactDetails } from "./ImpactDetails";
import { MoneySavingsCalculator } from "./MoneySavingsCalculator";
import { useImpactCalculations, ImpactConfig } from "@/hooks/dashboard/useImpactCalculations";
import { ImpactSettings } from "./ImpactSettings";
import { ReductionEquivalents } from "./ReductionEquivalents";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useUserPreferences, UserPreferences } from "@/hooks/dashboard/useUserPreferences";
import { useToast } from "@/hooks/use-toast";

interface ImpactTabsProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (value: "day" | "month" | "year" | "all-time") => void;
  config: {
    bottleSize: number;
    bottleCost: number;
    userType: "home";
  };
  onConfigChange: (config: Partial<UserPreferences>) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  preferences?: UserPreferences; // Make preferences optional
}

export function ImpactTabs({ period, setPeriod, config, onConfigChange, activeTab, setActiveTab, preferences }: ImpactTabsProps) {
  const { savePreferences, isSaving } = useUserPreferences();
  const { toast } = useToast();
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
  
  const handleSave = async () => {
    try {
      await savePreferences({
        bottleSize: config.bottleSize,
        bottleCost: config.bottleCost,
      });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-3 w-full bg-spotify-dark">
        <TabsTrigger value="environmental" className="text-sm md:text-base">Environment</TabsTrigger>
        <TabsTrigger value="financial" className="text-sm md:text-base">Money</TabsTrigger>
        <TabsTrigger value="equivalents" className="text-sm md:text-base">CO₂ Emissions</TabsTrigger>
      </TabsList>
      
      <TabsContent value="environmental" className="space-y-2">
        <ImpactPeriodToggle 
          period={period} 
          setPeriod={setPeriod} 
          includeAllTime={true} 
        />
      </TabsContent>
      
      <TabsContent value="financial">
        <div className="space-y-4">
          <h3 className={`font-medium text-center mb-1 text-sm md:text-base`}>
            Financial Impact Settings
          </h3>

          <div className="grid gap-4 p-4 bg-spotify-dark/50 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bottle Size</label>
              <Select
                value={config.bottleSize.toString()}
                onValueChange={(value) => onConfigChange({ bottleSize: parseFloat(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bottle size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5L Bottle</SelectItem>
                  <SelectItem value="1.0">1.0L Bottle</SelectItem>
                  <SelectItem value="1.5">1.5L Bottle</SelectItem>
                  <SelectItem value="2.0">2.0L Bottle</SelectItem>
                  <SelectItem value="3.0">3.0L Bottle</SelectItem>
                  <SelectItem value="5.0">5.0L Bottle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bottle Cost (€)</label>
              <Select
                value={config.bottleCost.toString()}
                onValueChange={(value) => onConfigChange({ bottleCost: parseFloat(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bottle cost" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.8">€0.80</SelectItem>
                  <SelectItem value="1.0">€1.00</SelectItem>
                  <SelectItem value="1.1">€1.10</SelectItem>
                  <SelectItem value="1.5">€1.50</SelectItem>
                  <SelectItem value="2.0">€2.00</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>

          <div className="p-4 bg-spotify-dark rounded-lg text-center">
            <h4 className="text-sm font-medium text-gray-200 mb-1">Total Money Saved</h4>
            <p className="text-2xl font-bold text-mywater-blue">
              €{(moneySaved).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Based on {config.bottleSize}L bottles at €{config.bottleCost.toFixed(2)} each
            </p>
          </div>
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
    </Tabs>
  );
}
