
import { ReferralProgram } from "@/components/users/private/ReferralProgram";
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";

export function ReferPage() {
  const { userData, loading } = usePrivateUserData();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white">Loading your referral data...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Refer a Friend</h2>
      <ReferralProgram userData={userData} />
    </div>
  );
}
