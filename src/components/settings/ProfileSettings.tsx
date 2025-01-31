import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ProfileSettings = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
        <User className="h-5 w-5 text-spotify-green" />
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profile form fields will go here */}
          <Button className="w-full md:w-auto">Save Changes</Button>
        </div>
      </div>
    </Card>
  );
};