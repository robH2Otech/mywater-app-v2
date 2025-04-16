
import { Card } from "@/components/ui/card";
import { PrivateUser } from "@/types/privateUser";

interface PrivateUserProfileProps {
  userData: PrivateUser;
}

export function PrivateUserProfile({ userData }: PrivateUserProfileProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="p-6 h-[200px] bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-cyan-500/20">
        <h3 className="font-semibold mb-2">Personal Information</h3>
        <div className="space-y-2 text-sm">
          <p>Name: {userData?.first_name} {userData?.last_name}</p>
          <p>Email: {userData?.email}</p>
          <p>Phone: {userData?.phone || 'Not provided'}</p>
        </div>
      </Card>

      <Card className="p-6 h-[200px] bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/20">
        <h3 className="font-semibold mb-2">Water Purifier Details</h3>
        <div className="space-y-2 text-sm">
          <p>Model: {userData?.purifier_model || 'Not specified'}</p>
          <p>Installation Date: {userData?.installation_date || 'Not specified'}</p>
          <p>Serial Number: {userData?.serial_number || 'Not specified'}</p>
        </div>
      </Card>

      <Card className="p-6 h-[200px] bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-500/20">
        <h3 className="font-semibold mb-2">Account Settings</h3>
        <div className="space-y-2 text-sm">
          <p>Account Type: {userData?.account_type || 'Standard'}</p>
          <p>Notifications: {userData?.notifications_enabled ? 'Enabled' : 'Disabled'}</p>
          <p>Member Since: {userData?.created_at || 'Not available'}</p>
        </div>
      </Card>
    </div>
  );
}
