import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";

const Settings = () => {
  return (
    <div className="space-y-6">
      <ProfileSettings />
      <NotificationSettings />
    </div>
  );
};

export default Settings;