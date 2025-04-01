
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { UserActionButtons } from "./UserActionButtons";

interface UserDialogFooterProps {
  onClose: () => void;
  onSave: () => void;
  hasChanges: boolean;
  isSaving: boolean;
  isEditable: boolean;
  onAction: (action: 'email' | 'report' | 'reminder' | 'invoice') => void;
}

export function UserDialogFooter({
  onClose,
  onSave,
  hasChanges,
  isSaving,
  isEditable,
  onAction
}: UserDialogFooterProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6">
      <UserActionButtons onAction={onAction} />
      
      <div className="flex gap-2 self-end">
        <Button
          variant="outline"
          onClick={onClose}
          className="bg-spotify-accent hover:bg-spotify-accent-hover"
        >
          <X size={16} className="mr-1" />
          Cancel
        </Button>
        
        {isEditable && (
          <Button
            onClick={onSave}
            className={`bg-spotify-green hover:bg-spotify-green/90 ${!hasChanges ? 'opacity-70' : ''}`}
            disabled={!hasChanges || isSaving}
          >
            <Save size={16} className="mr-1" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </div>
    </div>
  );
}
