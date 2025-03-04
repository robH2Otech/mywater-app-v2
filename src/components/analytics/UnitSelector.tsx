
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useUnits } from "@/hooks/useUnits";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface UnitSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function UnitSelector({ value, onChange }: UnitSelectorProps) {
  const { data: units = [], isLoading, error } = useUnits();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <label className="text-sm text-gray-400">Select Unit</label>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load units. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">Select Unit</label>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
          <SelectValue placeholder="Select a unit" />
        </SelectTrigger>
        <SelectContent className="bg-spotify-darker border-spotify-accent">
          {units.map((unit) => (
            <SelectItem key={unit.id} value={unit.id}>
              {unit.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
