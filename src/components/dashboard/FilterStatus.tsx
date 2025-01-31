import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";

export const FilterStatus = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Filter Status</h3>
        <Filter className="h-5 w-5 text-spotify-green" />
      </div>
      <div className="space-y-4">
        {/* Filter status items will be mapped here */}
        <p className="text-gray-400">No filters to display</p>
      </div>
    </Card>
  );
};