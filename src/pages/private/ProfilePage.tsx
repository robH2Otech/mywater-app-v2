
import { PrivateUserProfile } from "@/components/users/private/PrivateUserProfile";
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";

export function ProfilePage() {
  const { userData, loading } = usePrivateUserData();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white">Loading your profile...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Profile</h2>
      <PrivateUserProfile userData={userData} />
    </div>
  );
}
