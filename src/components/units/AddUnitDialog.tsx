
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AddUnitDialogContent } from "./AddUnitDialogContent";
import { useAddUnitForm } from "@/hooks/units/useAddUnitForm";

export function AddUnitDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { formData, setFormData, isSubmitting, handleSubmit } = useAddUnitForm(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-spotify-darker border-spotify-accent overflow-hidden">
        <AddUnitDialogContent
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
