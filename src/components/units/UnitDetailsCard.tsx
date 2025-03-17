
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { UnitData } from "@/types/analytics";
import { useIsMobile } from "@/hooks/use-mobile";

interface UnitDetailsCardProps {
  unit: UnitData;
}

export const UnitDetailsCard = ({ unit }: UnitDetailsCardProps) => {
  const isMobile = useIsMobile();
  
  const formatDate = (date: string | null) => {
    if (!date) return "Not available";
    try {
      return format(new Date(date), isMobile ? "MMM d, yyyy" : "PPP");
    } catch (err) {
      console.error("Invalid date format:", date, err);
      return "Invalid date";
    }
  };

  // Format volume with thousands separators and fixed decimal places
  const formatVolume = (volume: number | string | undefined | null) => {
    if (volume === undefined || volume === null) return "0";
    const numericVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
    if (isNaN(numericVolume)) return "0";
    return numericVolume.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <Card className="bg-spotify-darker border-spotify-accent p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Unit Name</label>
          <Input
            value={unit?.name || ""}
            readOnly
            className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Maintenance Contact</label>
          <Input
            value={unit?.contact_name || "Not specified"}
            readOnly
            className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Location</label>
          <Input
            value={unit?.location || "Not specified"}
            readOnly
            className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Email</label>
          <Input
            value={unit?.contact_email || "Not specified"}
            readOnly
            className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Total Volume (m³)</label>
          <Input
            value={formatVolume(unit?.total_volume)}
            readOnly
            className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Phone</label>
          <Input
            value={unit?.contact_phone || "Not specified"}
            readOnly
            className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Status</label>
          <Input
            value={unit?.status || ""}
            readOnly
            className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Next Maintenance</label>
          <Input
            value={formatDate(unit?.next_maintenance || null)}
            readOnly
            className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Setup Date</label>
          <Input
            value={formatDate(unit?.setup_date || null)}
            readOnly
            className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">UVC Hours</label>
          <Input
            value={unit?.uvc_hours ? formatVolume(unit.uvc_hours) : "Not specified"}
            readOnly
            className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">EID</label>
          <Input
            value={unit?.eid || "Not specified"}
            readOnly
            className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">ICCID</label>
          <Input
            value={unit?.iccid || "Not specified"}
            readOnly
            className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
          />
        </div>

        {unit?.notes && (
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label className="text-sm text-gray-400">Notes</label>
            <Input
              value={unit.notes}
              readOnly
              className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
