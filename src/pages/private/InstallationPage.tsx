
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";
import { InstallationGuide } from "@/components/users/private/support/InstallationGuide";

export function InstallationPage() {
  const { userData, loading } = usePrivateUserData();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white">Loading your data...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Installation Guide</h2>
      <InstallationGuide purifierModel={userData?.purifier_model || "MYWATER System"} />
    </div>
  );
}
