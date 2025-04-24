
import { formatHumanReadableTimestamp } from "@/utils/measurements/formatUtils";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface SampleDataGeneratorProps {
  unitId: string;
}

// This component is no longer needed since we're using real Firebase data
export function SampleDataGenerator({ unitId }: SampleDataGeneratorProps) {
  // Return null since we're not using sample data anymore
  return null;
}
