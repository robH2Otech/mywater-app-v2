
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ImpactPeriodToggleProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (value: "day" | "month" | "year" | "all-time") => void;
  includeAllTime?: boolean;
}

export function ImpactPeriodToggle({ 
  period, 
  setPeriod, 
  includeAllTime = true
}: ImpactPeriodToggleProps) {
  const isMobile = useIsMobile();
  
  const getButtonVariant = (value: string) => {
    return period === value ? "default" : "outline";
  };

  const getButtonClass = (value: string) => {
    return period === value ? "bg-mywater-blue hover:bg-mywater-blue/90" : "";
  };
  
  const getButtonLabel = (value: string) => {
    if (isMobile) {
      switch (value) {
        case 'day': return 'D';
        case 'month': return 'M';
        case 'year': return 'Y';
        case 'all-time': return 'All';
        default: return value;
      }
    } else {
      switch (value) {
        case 'day': return 'Daily';
        case 'month': return 'Monthly';
        case 'year': return 'Yearly';
        case 'all-time': return 'All Time';
        default: return value;
      }
    }
  };

  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex rounded-md shadow-sm">
        <Button
          variant={getButtonVariant("day")}
          onClick={() => setPeriod("day")}
          className={`rounded-l-md rounded-r-none ${getButtonClass("day")}`}
          size={isMobile ? "sm" : "default"}
        >
          {getButtonLabel("day")}
        </Button>
        <Button
          variant={getButtonVariant("month")}
          onClick={() => setPeriod("month")}
          className={`rounded-none border-x-0 ${getButtonClass("month")}`}
          size={isMobile ? "sm" : "default"}
        >
          {getButtonLabel("month")}
        </Button>
        <Button
          variant={getButtonVariant("year")}
          onClick={() => setPeriod("year")}
          className={`${includeAllTime ? 'rounded-none border-r-0' : 'rounded-r-md'} ${getButtonClass("year")}`}
          size={isMobile ? "sm" : "default"}
        >
          {getButtonLabel("year")}
        </Button>
        
        {includeAllTime && (
          <Button
            variant={getButtonVariant("all-time")}
            onClick={() => setPeriod("all-time")}
            className={`rounded-r-md rounded-l-none ${getButtonClass("all-time")}`}
            size={isMobile ? "sm" : "default"}
          >
            {getButtonLabel("all-time")}
          </Button>
        )}
      </div>
    </div>
  );
}
