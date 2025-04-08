
import { Button } from "@/components/ui/button";

interface ImpactPeriodToggleProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (value: "day" | "month" | "year" | "all-time") => void;
  includeAllTime?: boolean;
}

export function ImpactPeriodToggle({ 
  period, 
  setPeriod, 
  includeAllTime = false 
}: ImpactPeriodToggleProps) {
  const getButtonVariant = (value: string) => {
    return period === value ? "default" : "outline";
  };

  const getButtonClass = (value: string) => {
    return period === value ? "bg-mywater-blue hover:bg-mywater-blue/90" : "";
  };

  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex rounded-md shadow-sm">
        <Button
          variant={getButtonVariant("day")}
          onClick={() => setPeriod("day")}
          className={`rounded-l-md rounded-r-none ${getButtonClass("day")}`}
        >
          Daily
        </Button>
        <Button
          variant={getButtonVariant("month")}
          onClick={() => setPeriod("month")}
          className={`rounded-none border-x-0 ${getButtonClass("month")}`}
        >
          Monthly
        </Button>
        <Button
          variant={getButtonVariant("year")}
          onClick={() => setPeriod("year")}
          className={`${includeAllTime ? 'rounded-none border-r-0' : 'rounded-r-md'} ${getButtonClass("year")}`}
        >
          Yearly
        </Button>
        
        {includeAllTime && (
          <Button
            variant={getButtonVariant("all-time")}
            onClick={() => setPeriod("all-time")}
            className={`rounded-r-md rounded-l-none ${getButtonClass("all-time")}`}
          >
            All Time
          </Button>
        )}
      </div>
    </div>
  );
}
