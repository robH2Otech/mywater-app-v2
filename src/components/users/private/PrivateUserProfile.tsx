
import { Card } from "@/components/ui/card";
import { PrivateUser } from "@/types/privateUser";
import { format } from "date-fns";

interface PrivateUserProfileProps {
  userData: PrivateUser | null;
}

export function PrivateUserProfile({ userData }: PrivateUserProfileProps) {
  // Format date safely for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Not available';
    try {
      return typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
    } catch (e) {
      return String(date);
    }
  };

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
          <p>Purchase Date: {formatDate(userData?.purchase_date)}</p>
          <p>Replacement Date: {formatDate(userData?.cartridge_replacement_date)}</p>
        </div>
      </Card>

      <Card className="p-6 h-[200px] bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-500/20">
        <h3 className="font-semibold mb-2">Account Settings</h3>
        <div className="space-y-2 text-sm">
          <p>Referral Code: {userData?.referral_code || 'Not available'}</p>
          <p>Referrals: {userData?.referrals_converted || 0} converted</p>
          <p>Member Since: {formatDate(userData?.created_at)}</p>
        </div>
      </Card>
    </div>
  );
}
