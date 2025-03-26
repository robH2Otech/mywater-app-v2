
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PrivateRecentAlerts() {
  return (
    <div className="lg:col-span-1">
      <Card className="bg-spotify-darker border-spotify-accent h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-red-500" />
            Recent Alerts
          </CardTitle>
          <div className="text-sm text-gray-400 px-3 py-1 rounded-full bg-spotify-dark">
            Last 7 Days
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-8 flex flex-col items-center justify-center text-center h-[300px]">
            <Bell className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">No active alerts</p>
            <p className="text-gray-500 text-sm mt-2">Your system is running normally</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
