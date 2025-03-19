
import { Button } from "@/components/ui/button";

interface UVCDialogActionsProps {
  onCancel: () => void;
  onSave: () => void;
}

export function UVCDialogActions({ onCancel, onSave }: UVCDialogActionsProps) {
  return (
    <div className="flex justify-end gap-4 mt-6">
      <Button
        onClick={onCancel}
        variant="outline"
        className="bg-spotify-accent hover:bg-spotify-accent-hover text-white"
      >
        Cancel
      </Button>
      <Button
        onClick={onSave}
        className="bg-primary hover:bg-primary/90 text-white"
      >
        Save Changes
      </Button>
    </div>
  );
}
