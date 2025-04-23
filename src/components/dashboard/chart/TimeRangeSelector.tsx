
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { TimeRange } from "@/hooks/chart/useWaterUsageData";

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export const TimeRangeSelector = ({ value, onChange }: TimeRangeSelectorProps) => {
  const { t } = useLanguage();

  return (
    <Select
      value={value}
      onValueChange={(value: TimeRange) => onChange(value)}
    >
      <SelectTrigger className="w-[180px] bg-spotify-darker border-spotify-accent">
        <SelectValue placeholder={t("chart.select.timerange")} />
      </SelectTrigger>
      <SelectContent className="bg-spotify-darker border-spotify-accent">
        <SelectItem value="24h">Last 24 hours</SelectItem>
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="30d">Last 30 days</SelectItem>
        <SelectItem value="6m">Last 6 months</SelectItem>
      </SelectContent>
    </Select>
  );
};
