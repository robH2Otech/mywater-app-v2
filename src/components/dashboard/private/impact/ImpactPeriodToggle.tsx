
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface ImpactPeriodToggleProps {
  period: "week" | "month" | "year" | "all-time";
  setPeriod: (value: "week" | "month" | "year" | "all-time") => void;
  includeAllTime?: boolean;
}

export function ImpactPeriodToggle({ 
  period, 
  setPeriod, 
  includeAllTime = true
}: ImpactPeriodToggleProps) {
  const isMobile = useIsMobile();
  
  const periods = [
    { value: "week", label: "Weekly" },
    { value: "month", label: "Monthly" },
    { value: "year", label: "Yearly" }
  ];
  
  if (includeAllTime) {
    periods.push({ value: "all-time", label: "All Time" });
  }

  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex bg-black rounded-md">
        {periods.map((item) => (
          <Button
            key={item.value}
            variant="ghost"
            onClick={() => setPeriod(item.value as "week" | "month" | "year" | "all-time")}
            className={`rounded-md px-4 py-2 ${
              period === item.value 
                ? "bg-cyan-600 text-white" 
                : "bg-transparent text-gray-400 hover:text-white"
            }`}
            size="sm"
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
