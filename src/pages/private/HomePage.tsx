
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";
import { HomeStats } from "@/components/dashboard/private/HomeStats";
import { CartridgeVisualization } from "@/components/users/private/CartridgeVisualization";
import { CartridgeAlert } from "@/components/dashboard/private/CartridgeAlert";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";

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
  
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isSmallScreen = isMobile || isTablet;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="text-blue-200 mt-4">Loading your dashboard...</p>
        </div>
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
      
      <div className={`grid ${isSmallScreen ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-6'} min-h-[400px]`}>
        <div className={isSmallScreen ? '' : 'col-span-1 h-full'}>
          <HomeStats 
            userData={userData}
            daysUntilReplacement={daysUntilReplacement}
            isReplacementOverdue={isReplacementOverdue}
            isReplacementDueSoon={isReplacementDueSoon}
          />
        </div>
        
        <div className={`${isSmallScreen ? 'mt-6' : 'col-span-2'} h-full`}>
          <div className="bg-spotify-darker rounded-lg border border-white/10 h-full p-6 flex items-center justify-center">
            <CartridgeVisualization 
              percentage={cartridgeUsagePercent} 
              height={isSmallScreen ? 300 : 400} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
