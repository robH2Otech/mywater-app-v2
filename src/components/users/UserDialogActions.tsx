
import { Button } from "@/components/ui/button";
import { UserActionButtons } from "./UserActionButtons";

interface UserDialogActionsProps {
  hasWritePermission: boolean;
  shouldShowSaveButton: boolean;
  isSubmitting: boolean;
  isMobile: boolean;
  onAction: (action: 'email' | 'report' | 'reminder' | 'invoice') => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function UserDialogActions({
  hasWritePermission,
  shouldShowSaveButton,
  isSubmitting,
  isMobile,
  onAction,
  onClose,
  onSubmit
}: UserDialogActionsProps) {
  return (
    <div className="shrink-0 border-t border-spotify-accent bg-spotify-darker">
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'} px-6 py-4`}>
        <div className={`${isMobile ? 'order-2' : ''}`}>
          {hasWritePermission && (
            <UserActionButtons onAction={onAction} />
          )}
        </div>
        <div className={`flex gap-2 ${isMobile ? 'order-1 justify-center' : ''}`}>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none"
            disabled={isSubmitting}
          >
            Close
          </Button>
          {shouldShowSaveButton && (
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-mywater-blue hover:bg-mywater-blue/90"
            >
              {isSubmitting ? "Updating..." : "Save Changes"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
