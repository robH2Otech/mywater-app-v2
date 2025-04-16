
import { Button } from "@/components/ui/button";

interface PeriodToggleProps {
  period: "week" | "month" | "year" | "all-time";
  setPeriod: (value: "week" | "month" | "year" | "all-time") => void;
}

export function PeriodToggle({ period, setPeriod }: PeriodToggleProps) {
  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex bg-black rounded-md">
        <Button
          variant="ghost"
          onClick={() => setPeriod("week")}
          className={`rounded-md px-4 py-2 ${
            period === "week" 
              ? "bg-cyan-600 text-white" 
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
          size="sm"
        >
          Weekly
        </Button>
        <Button
          variant="ghost"
          onClick={() => setPeriod("month")}
          className={`rounded-md px-4 py-2 ${
            period === "month" 
              ? "bg-cyan-600 text-white" 
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
          size="sm"
        >
          Monthly
        </Button>
        <Button
          variant="ghost"
          onClick={() => setPeriod("year")}
          className={`rounded-md px-4 py-2 ${
            period === "year" 
              ? "bg-cyan-600 text-white" 
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
          size="sm"
        >
          Yearly
        </Button>
        <Button
          variant="ghost"
          onClick={() => setPeriod("all-time")}
          className={`rounded-md px-4 py-2 ${
            period === "all-time" 
              ? "bg-cyan-600 text-white" 
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
          size="sm"
        >
          All Time
        </Button>
      </div>
    </div>
  );
}
