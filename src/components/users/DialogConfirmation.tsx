
import { Dispatch, SetStateAction } from "react";

interface DialogConfirmationProps {
  hasChanges: boolean;
  onOpenChange: (open: boolean) => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  newOpen: boolean;
}

export function useDialogConfirmation({
  hasChanges,
  onOpenChange,
  newOpen
}: Omit<DialogConfirmationProps, "setOpen">) {
  const handleOpenChange = (newOpenState: boolean) => {
    if (!newOpenState && hasChanges) {
      // Confirm before closing with unsaved changes
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(newOpenState);
    }
  };

  return { handleOpenChange };
}
