
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

// Sample purifier models - this would come from a database in production
const PURIFIER_MODELS = [
  "MYWATER Home Basic",
  "MYWATER Home Plus",
  "MYWATER Home Premium",
  "MYWATER Under-Sink Basic",
  "MYWATER Under-Sink Advanced",
  "MYWATER Countertop Standard",
  "MYWATER Countertop Premium"
];

interface PurifierModelSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function PurifierModelSelect({ value, onChange }: PurifierModelSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">Water Purifier Model</label>
      <Select value={value} onValueChange={onChange} required>
        <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
          <SelectValue placeholder="Select your purifier model" />
        </SelectTrigger>
        <SelectContent className="bg-spotify-darker border-spotify-accent">
          {PURIFIER_MODELS.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
