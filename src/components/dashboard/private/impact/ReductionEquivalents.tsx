
import { Bike, Car, Leaf, Factory } from "lucide-react";

interface ReductionEquivalentsProps {
  co2Saved: number;
  plasticSaved: number;
  bottlesSaved: number;
  period: "day" | "month" | "year" | "all-time";
}

export function ReductionEquivalents({
  co2Saved,
  plasticSaved,
  bottlesSaved,
  period
}: ReductionEquivalentsProps) {
  const formatNumber = (num: number) => {
    if (num < 1) return num.toFixed(2);
    if (num < 10) return num.toFixed(1);
    return Math.round(num).toLocaleString();
  };
  
  const periodLabel = period === "day" 
    ? "daily" 
    : period === "month" 
      ? "monthly" 
      : period === "all-time"
        ? "lifetime"
        : "yearly";
  
  // Calculate equivalents based on CO2 saved
  const carKm = co2Saved / 0.14; // 140g CO2 per km in average car
  const treeDays = co2Saved / 0.022; // 22g CO2 per day absorbed by one tree
  const phoneCharges = co2Saved * 400; // 2.5g CO2 per full phone charge
  
  return (
    <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/20">
      <h3 className="text-lg font-medium mb-4 text-center">Environmental Equivalents</h3>
      <p className="text-sm text-gray-400 mb-4 text-center">
        Your {periodLabel} environmental impact is equivalent to:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center bg-spotify-dark/60 p-3 rounded-lg">
          <div className="mr-4 bg-green-900/40 p-2 rounded-full">
            <Car className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-300">{formatNumber(carKm)} km</p>
            <p className="text-xs text-gray-400">Not driven in a car</p>
          </div>
        </div>
        
        <div className="flex items-center bg-spotify-dark/60 p-3 rounded-lg">
          <div className="mr-4 bg-green-900/40 p-2 rounded-full">
            <Leaf className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-300">{formatNumber(treeDays)} days</p>
            <p className="text-xs text-gray-400">Of one tree absorbing CO₂</p>
          </div>
        </div>
        
        <div className="flex items-center bg-spotify-dark/60 p-3 rounded-lg">
          <div className="mr-4 bg-green-900/40 p-2 rounded-full">
            <Factory className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-300">{formatNumber(bottlesSaved)} bottles</p>
            <p className="text-xs text-gray-400">Not manufactured</p>
          </div>
        </div>
        
        <div className="sm:col-span-2 md:col-span-3">
          <div className="text-center py-2 px-4 bg-green-900/20 rounded-lg text-sm">
            <p className="text-gray-300">You've saved enough energy to charge a smartphone {formatNumber(phoneCharges)} times!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
