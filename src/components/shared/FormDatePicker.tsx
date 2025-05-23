
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface FormDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label: string;
}

export function FormDatePicker({ value, onChange, label }: FormDatePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-spotify-darker border-spotify-accent hover:bg-spotify-darker hover:border-spotify-accent-hover text-white",
              !value && "text-gray-400"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0 bg-spotify-darker border-spotify-accent z-[100]"
          align="start"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={onChange}
            className="bg-spotify-darker text-white rounded-md border-spotify-accent pointer-events-auto"
            disabled={(date) => date < new Date("1900-01-01")}
            captionLayout="dropdown-buttons"
            fromYear={1900}
            toYear={2030}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
