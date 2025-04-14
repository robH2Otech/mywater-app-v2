
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { calculateBottlesSaved, calculateCO2Reduction, calculatePlasticReduction } from "@/utils/formatUnitVolume";
import { Leaf, Car, Smartphone, Tree } from "lucide-react";

interface CO2ImpactProps {
  period: "day" | "month" | "year" | "all-time";
  config: {
    bottleSize: number;
    bottleCost: number;
    dailyIntake: number;
  };
}

export function CO2Impact({ period, config }: CO2ImpactProps) {
  // Calculate period multiplier
  const periodMultiplier = useMemo(() => {
    switch (period) {
      case "day": return 1;
      case "month": return 30;
      case "year": return 365;
      case "all-time": return 365 * 2; // Assume 2 years for all-time
      default: return 1;
    }
  }, [period]);

  // Calculate base water consumption
  const waterConsumedLiters = config.dailyIntake * periodMultiplier;
  
  // Calculate metrics
  const bottlesSaved = calculateBottlesSaved(waterConsumedLiters, config.bottleSize);
  const co2Saved = calculateCO2Reduction(bottlesSaved, config.bottleSize * 321); // 321g CO2 per liter
  const plasticSaved = calculatePlasticReduction(bottlesSaved, config.bottleSize * 40); // 40g plastic per liter
  
  // Calculate equivalents
  const carKilometers = co2Saved * 6; // 6km per kg of CO2
  const smartphoneCharges = co2Saved * 225; // 225 charges per kg of CO2
  const treeDays = co2Saved * 10; // 10 days of oxygen per kg of CO2

  return (
    <div className="space-y-6">
      <div className="text-center text-gray-400 mb-4">
        <p>Your environmental impact so far:</p>
      </div>
      
      <div className="p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg text-center">
        <Leaf className="h-8 w-8 mb-2 mx-auto text-emerald-400" />
        <h3 className="text-lg font-medium text-gray-200 mb-1">CO₂ Emissions Reduced</h3>
        <p className="text-3xl font-bold text-emerald-400">
          {co2Saved.toFixed(1)} kg
        </p>
        <p className="text-xs text-gray-400 mt-2">
          From {bottlesSaved.toFixed(0)} plastic bottles not produced
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-b from-spotify-darker to-slate-900">
          <div className="flex flex-col items-center">
            <Car className="h-8 w-8 mb-2 text-blue-400" />
            <p className="text-2xl font-bold">{Math.round(carKilometers)} km</p>
            <p className="text-xs text-center text-gray-400 mt-2">
              Equivalent to the emissions from driving a car this distance
            </p>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-b from-spotify-darker to-slate-900">
          <div className="flex flex-col items-center">
            <Smartphone className="h-8 w-8 mb-2 text-purple-400" />
            <p className="text-2xl font-bold">{Math.round(smartphoneCharges)}</p>
            <p className="text-xs text-center text-gray-400 mt-2">
              Smartphone charges equivalent
            </p>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-b from-spotify-darker to-slate-900">
          <div className="flex flex-col items-center">
            <Tree className="h-8 w-8 mb-2 text-green-400" />
            <p className="text-2xl font-bold">{Math.round(treeDays / 365)} trees</p>
            <p className="text-xs text-center text-gray-400 mt-2">
              Equivalent to oxygen produced by these trees for a year
            </p>
          </div>
        </Card>
      </div>
      
      <div className="p-4 mt-4 bg-gray-800/50 rounded-lg">
        <h3 className="text-md font-medium mb-2">Did you know?</h3>
        <p className="text-sm text-gray-400">
          A single 0.5L plastic water bottle produces about 160.5g of CO₂ during its lifecycle. 
          By using your MYWATER system, you've prevented {bottlesSaved.toFixed(0)} bottles from 
          entering circulation, saving a total of {co2Saved.toFixed(1)}kg of CO₂ emissions.
        </p>
      </div>
    </div>
  );
}
