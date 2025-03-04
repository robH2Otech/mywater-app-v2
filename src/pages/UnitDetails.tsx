
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

export const UnitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: unit, isLoading } = useQuery({
    queryKey: ["unit", id],
    queryFn: async () => {
      if (!id) throw new Error("Unit ID is required");
      
      const unitDocRef = doc(db, "units", id);
      const unitSnapshot = await getDoc(unitDocRef);
      
      if (!unitSnapshot.exists()) {
        throw new Error("Unit not found");
      }
      
      return {
        id: unitSnapshot.id,
        ...unitSnapshot.data()
      };
    },
  });

  if (isLoading) {
    return <div className="animate-pulse h-[400px] bg-spotify-darker rounded-lg" />;
  }

  if (!unit) {
    return <div>Unit not found</div>;
  }

  const formatDate = (date: string | null) => {
    if (!date) return "Not available";
    return format(new Date(date), "PPP");
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fadeIn">
      <Card className="bg-spotify-darker border-spotify-accent p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Water Unit Details</h1>
          <Button 
            onClick={() => navigate("/units")}
            variant="outline"
            className="bg-spotify-accent hover:bg-spotify-accent-hover text-white border-none"
          >
            Back to Units
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Unit Name</label>
            <Input
              value={unit.name}
              readOnly
              className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Maintenance Contact</label>
            <Input
              value={unit.contact_name || "Not specified"}
              readOnly
              className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Location</label>
            <Input
              value={unit.location || "Not specified"}
              readOnly
              className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Email</label>
            <Input
              value={unit.contact_email || "Not specified"}
              readOnly
              className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Total Volume (m³)</label>
            <Input
              value={unit.total_volume || "0"}
              readOnly
              className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Phone</label>
            <Input
              value={unit.contact_phone || "Not specified"}
              readOnly
              className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Status</label>
            <Input
              value={unit.status}
              readOnly
              className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Next Maintenance</label>
            <Input
              value={formatDate(unit.next_maintenance)}
              readOnly
              className="bg-spotify-accent border-spotify-accent-hover text-white cursor-default"
            />
          </div>

          {unit.notes && (
            <div className="col-span-2 space-y-2">
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
    </div>
  );
};
