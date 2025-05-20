
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";
import { SupportContactForm } from "@/components/users/private/support/SupportContactForm";

export function SupportPage() {
  const { userData, loading } = usePrivateUserData();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white">Loading...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
      <SupportContactForm userData={userData} />
    </div>
  );
}
