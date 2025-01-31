import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export const RecentAlerts = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
        <AlertCircle className="h-5 w-5 text-spotify-green" />
      </div>
      <div className="space-y-4">
        {/* Alert items will be mapped here */}
        <p className="text-gray-400">No recent alerts</p>
      </div>
    </Card>
  );
};