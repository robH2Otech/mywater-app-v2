
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";
import { HomeStats } from "@/components/dashboard/private/HomeStats";
import { CartridgeVisualization } from "@/components/users/private/CartridgeVisualization";
import { CartridgeAlert } from "@/components/dashboard/private/CartridgeAlert";

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <HomeStats 
            userData={userData}
            daysUntilReplacement={daysUntilReplacement}
            isReplacementOverdue={isReplacementOverdue}
            isReplacementDueSoon={isReplacementDueSoon}
          />
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-spotify-darker rounded-lg border border-white/10 h-full p-6 flex items-center justify-center">
            <CartridgeVisualization percentage={cartridgeUsagePercent} />
          </div>
        </div>
      </div>
    </div>
  );
}
