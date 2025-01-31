import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const NotificationSettings = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
        <Bell className="h-5 w-5 text-spotify-green" />
      </div>
      <div className="space-y-6">
        {/* Notification toggles will go here */}
        <div className="flex items-center justify-between">
          <span className="text-white">Email Notifications</span>
          <Switch />
        </div>
      </div>
    </Card>
  );
};