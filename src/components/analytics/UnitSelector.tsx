import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UnitSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function UnitSelector({ value, onChange }: UnitSelectorProps) {
  const { data: units, isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading units...</div>;

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-400">Select Unit</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-spotify-accent border-spotify-accent-hover text-white">
          <SelectValue placeholder="Select a unit" />
        </SelectTrigger>
        <SelectContent className="bg-spotify-darker border-spotify-accent-hover">
          {units?.map((unit) => (
            <SelectItem key={unit.id} value={unit.id}>
              {unit.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}