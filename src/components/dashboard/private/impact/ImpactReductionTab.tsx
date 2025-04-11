
import { ImpactConfig, useImpactCalculations } from "@/hooks/dashboard/useImpactCalculations";
import { ImpactPeriodToggle } from "./ImpactPeriodToggle";
import { ReductionEquivalents } from "./ReductionEquivalents";

interface ImpactReductionTabProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (period: "day" | "month" | "year" | "all-time") => void;
  config: Partial<ImpactConfig>;
}

export function ImpactReductionTab({ 
  period, 
  setPeriod, 
  config 
}: ImpactReductionTabProps) {
  const { co2Saved, plasticSaved, bottlesSaved } = useImpactCalculations(period, config);

  return (
    <div className="space-y-4">
      <h3 className="text-center font-medium">Your Environmental Impact Equivalents</h3>
      
      {/* Period Toggle */}
      <ImpactPeriodToggle 
        period={period} 
        setPeriod={setPeriod} 
        includeAllTime={true} 
      />
      
      <ReductionEquivalents 
        co2Saved={co2Saved}
        plasticSaved={plasticSaved}
        bottlesSaved={bottlesSaved}
        period={period}
      />
    </div>
  );
}
