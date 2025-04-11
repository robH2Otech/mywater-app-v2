
import { ReferralProgram } from "@/components/users/private/ReferralProgram";
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";

export function ReferPage() {
  const { userData, loading } = usePrivateUserData();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-200 mt-4">Loading your referral data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6 text-center sm:text-left bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
        Refer & Earn Program
      </h2>
      <ReferralProgram userData={userData} />
    </div>
  );
}
