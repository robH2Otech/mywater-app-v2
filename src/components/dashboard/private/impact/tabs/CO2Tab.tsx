
import { ImpactPeriodToggle } from "../ImpactPeriodToggle";

interface CO2TabProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (value: "day" | "month" | "year" | "all-time") => void;
  co2Saved: number;
}

export function CO2Tab({ period, setPeriod, co2Saved }: CO2TabProps) {
  // Format numbers with proper decimal places
  const formatWeight = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">CO₂ Emissions Reduction</h3>
        <p className="text-sm text-gray-400">
          Track your contribution to reducing carbon emissions
        </p>
      </div>
      
      {/* Period Toggle */}
      <ImpactPeriodToggle 
        period={period} 
        setPeriod={setPeriod} 
        includeAllTime={true} 
      />
      
      <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-blue-300">{formatWeight(co2Saved)} kg</h3>
          <p className="text-gray-400">CO₂ emissions prevented</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Production</span>
            <span className="text-sm font-medium">{formatWeight(co2Saved * 0.6)} kg</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "60%" }}></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Transport</span>
            <span className="text-sm font-medium">{formatWeight(co2Saved * 0.3)} kg</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "30%" }}></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Disposal</span>
            <span className="text-sm font-medium">{formatWeight(co2Saved * 0.1)} kg</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "10%" }}></div>
          </div>
        </div>
      </div>
      
      <div className="bg-spotify-dark p-4 rounded-lg">
        <h4 className="font-medium mb-2">CO₂ Emissions Comparison</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border border-gray-700 rounded-lg text-center">
            <p className="text-xs text-gray-400">MYWATER (1L)</p>
            <p className="text-lg font-bold text-green-400">0.003 kg</p>
            <p className="text-xs text-gray-500">CO₂ emissions</p>
          </div>
          
          <div className="p-3 border border-gray-700 rounded-lg text-center">
            <p className="text-xs text-gray-400">Bottled Water (1L)</p>
            <p className="text-lg font-bold text-red-400">0.321 kg</p>
            <p className="text-xs text-gray-500">CO₂ emissions</p>
          </div>
        </div>
        
        <p className="text-xs text-center mt-3 text-gray-400">
          MYWATER reduces CO₂ emissions by over 99% compared to bottled water
        </p>
      </div>
    </div>
  );
}
