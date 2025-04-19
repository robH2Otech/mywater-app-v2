
import { Loader2 } from "lucide-react";

export function UVCDialogLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Loader2 className="h-8 w-8 text-spotify-accent animate-spin" />
      <p className="text-gray-400">Loading UVC data...</p>
    </div>
  );
}
