
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface UVCDialogActionsProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function UVCDialogActions({ 
  onSave, 
  onCancel,
  isSaving = false
}: UVCDialogActionsProps) {
  return (
    <div className="flex gap-3 justify-end">
      <Button 
        type="button"
        variant="outline" 
        onClick={onCancel}
        className="border-spotify-accent text-spotify-accent hover:bg-spotify-accent/10"
      >
        <X className="h-4 w-4 mr-2" />
        Cancel
      </Button>
      <Button 
        type="button"
        onClick={onSave} 
        className="bg-spotify-accent hover:bg-spotify-accent-hover"
        disabled={isSaving}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
