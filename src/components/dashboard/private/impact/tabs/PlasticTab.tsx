
import { ImpactPeriodToggle } from "../ImpactPeriodToggle";

interface PlasticTabProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (value: "day" | "month" | "year" | "all-time") => void;
  plasticSaved: number;
  bottlesSaved: number;
}

export function PlasticTab({ period, setPeriod, plasticSaved, bottlesSaved }: PlasticTabProps) {
  // Format numbers with proper decimal places
  const formatWeight = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  const formatBottles = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Plastic Waste Reduction</h3>
        <p className="text-sm text-gray-400">
          See how much plastic waste you've prevented
        </p>
      </div>
      
      {/* Period Toggle */}
      <ImpactPeriodToggle 
        period={period} 
        setPeriod={setPeriod} 
        includeAllTime={true} 
      />
      
      <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/20">
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-green-300">{formatWeight(plasticSaved)} kg</h3>
          <p className="text-gray-400">Plastic waste prevented</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{formatBottles(bottlesSaved)}</p>
            <p className="text-xs text-gray-400">Plastic bottles</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold">{formatWeight(plasticSaved * 20)} g</p>
            <p className="text-xs text-gray-400">Plastic per bottle</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium">Equivalent to recycling:</p>
          <ul className="text-sm text-gray-400 list-disc list-inside space-y-1">
            <li>{Math.round(plasticSaved * 25)} plastic bags</li>
            <li>{Math.round(plasticSaved * 4)} plastic food containers</li>
            <li>{Math.round(plasticSaved / 0.025)} plastic straws</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-spotify-dark p-4 rounded-lg">
        <h4 className="font-medium mb-2">Plastic Degradation Time</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Plastic Bottle</span>
              <span className="text-sm font-medium">450 years</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "90%" }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Plastic Bag</span>
              <span className="text-sm font-medium">20 years</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "40%" }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">MYWATER Filter</span>
              <span className="text-sm font-medium">5 years</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "10%" }}></div>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-center mt-3 text-gray-400">
          MYWATER filters are partially biodegradable and recyclable
        </p>
      </div>
    </div>
  );
}
