
import React from 'react';
import { HomeStats } from '@/components/dashboard/private/HomeStats';
import { CartridgeAlert } from '@/components/dashboard/private/CartridgeAlert';
import { DashboardHeader } from '@/components/dashboard/private/DashboardHeader';
import { EnvironmentalImpactCalculator } from '@/components/dashboard/private/EnvironmentalImpactCalculator';
import { usePrivateUserData } from '@/hooks/dashboard/usePrivateUserData';

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

  return (
    <div className="space-y-6">
      <DashboardHeader 
        userData={userData} 
        daysUntilReplacement={daysUntilReplacement}
        isReplacementOverdue={isReplacementOverdue}
        isReplacementDueSoon={isReplacementDueSoon}
        cartridgeUsagePercent={cartridgeUsagePercent}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CartridgeAlert 
            isReplacementDueSoon={isReplacementDueSoon}
            isReplacementOverdue={isReplacementOverdue}
            formattedReplacementDate={formattedReplacementDate}
          />
          <HomeStats 
            userData={userData}
            daysUntilReplacement={daysUntilReplacement}
            isReplacementOverdue={isReplacementOverdue}
            isReplacementDueSoon={isReplacementDueSoon}
          />
        </div>
        
        <div className="lg:col-span-1">
          <EnvironmentalImpactCalculator />
        </div>
      </div>
    </div>
  );
}

// Export as a named export primarily, but also add a default export for compatibility
export default HomePage;
