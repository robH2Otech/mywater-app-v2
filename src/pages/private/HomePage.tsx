
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";
import { HomeStats } from "@/components/dashboard/private/HomeStats";
import { CartridgeAlert } from "@/components/dashboard/private/CartridgeAlert";
import { Card } from "@/components/ui/card";
import { Filter, Calendar } from "lucide-react";

export function HomePage() {
  const {
    userData,
    loading,
    daysUntilReplacement,
    isReplacementDueSoon,
    isReplacementOverdue,
    formattedReplacementDate,
    cartridgeUsagePercent
  } = usePrivateUserData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-white">Loading your data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CartridgeAlert 
        isReplacementDueSoon={isReplacementDueSoon}
        isReplacementOverdue={isReplacementOverdue}
        formattedReplacementDate={formattedReplacementDate}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="w-full">
          <HomeStats 
            userData={userData}
            daysUntilReplacement={daysUntilReplacement}
            isReplacementOverdue={isReplacementOverdue}
            isReplacementDueSoon={isReplacementDueSoon}
            cartridgeUsagePercent={cartridgeUsagePercent}
          />
        </div>
      </div>
    </div>
  );
}
