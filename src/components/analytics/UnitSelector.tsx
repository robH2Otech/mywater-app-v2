
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

interface UnitSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function UnitSelector({ value, onChange }: UnitSelectorProps) {
  const { data: units = [], isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const unitsCollection = collection(db, "units");
      const unitsQuery = query(unitsCollection, orderBy("name"));
      const unitsSnapshot = await getDocs(unitsQuery);
      
      return unitsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
    },
  });

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">Select Unit</label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
          <SelectValue placeholder="Select a unit" />
        </SelectTrigger>
        <SelectContent className="bg-spotify-darker border-spotify-accent">
          {units.map((unit) => (
            <SelectItem key={unit.id} value={unit.id}>
              {unit.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
