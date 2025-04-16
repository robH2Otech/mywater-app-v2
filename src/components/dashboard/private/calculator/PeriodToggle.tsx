
import { Button } from "@/components/ui/button";

interface PeriodToggleProps {
  period: "day" | "month" | "year" | "all-time";
  setPeriod: (value: "day" | "month" | "year" | "all-time") => void;
}

export function PeriodToggle({ period, setPeriod }: PeriodToggleProps) {
  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex bg-black/50 rounded-lg shadow-inner">
        <Button
          variant="ghost"
          onClick={() => setPeriod("day")}
          className={`rounded-md px-4 py-2 ${
            period === "day" 
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md" 
              : "bg-transparent text-gray-400 hover:text-white"
          }`}
          size="sm"
        >
          Daily
        </Button>
        <Button
          variant="ghost"
          onClick={() => setPeriod("month")}
          className={`rounded-md px-4 py-2 ${
            period === "month" 
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md" 
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
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md" 
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
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md" 
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
