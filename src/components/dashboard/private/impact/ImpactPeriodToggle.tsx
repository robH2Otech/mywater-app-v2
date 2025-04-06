
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ImpactPeriodToggleProps {
  period: "day" | "month" | "year";
  setPeriod: (value: "day" | "month" | "year") => void;
}

export function ImpactPeriodToggle({ period, setPeriod }: ImpactPeriodToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={period}
      onValueChange={(value) => {
        if (value) setPeriod(value as "day" | "month" | "year");
      }}
      className="justify-center mb-6"
    >
      <ToggleGroupItem value="day" className="px-3 py-1">
        Daily
      </ToggleGroupItem>
      <ToggleGroupItem value="month" className="px-3 py-1">
        Monthly
      </ToggleGroupItem>
      <ToggleGroupItem value="year" className="px-3 py-1">
        Yearly
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
