
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface UserDialogHeaderProps {
  hasChanges: boolean;
}

export function UserDialogHeader({ hasChanges }: UserDialogHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
        User Details
        {hasChanges && (
          <span className="text-sm text-yellow-400 font-normal ml-2">
            (Unsaved changes)
          </span>
        )}
      </DialogTitle>
    </DialogHeader>
  );
}
