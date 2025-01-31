import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReportTypeSelector({ value, onChange }: ReportTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">Report Type</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
          <SelectValue placeholder="Select report type" />
        </SelectTrigger>
        <SelectContent className="bg-spotify-darker border-spotify-accent-hover">
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
          <SelectItem value="custom">Custom Date Range</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}