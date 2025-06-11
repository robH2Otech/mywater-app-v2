
import { Button } from "@/components/ui/button";

interface UnitFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

export function UnitFormActions({ onCancel, isSubmitting }: UnitFormActionsProps) {
  return (
    <div className="flex justify-end gap-3 p-6 border-t border-spotify-accent bg-spotify-darker">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none min-w-[80px]"
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-mywater-blue hover:bg-mywater-blue/90 min-w-[100px]"
      >
        {isSubmitting ? "Saving..." : "Save Unit"}
      </Button>
    </div>
  );
}
