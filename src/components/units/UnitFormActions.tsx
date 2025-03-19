
import { Button } from "@/components/ui/button";

interface UnitFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

export function UnitFormActions({ onCancel, isSubmitting }: UnitFormActionsProps) {
  return (
    <div className="flex justify-end gap-3 mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
