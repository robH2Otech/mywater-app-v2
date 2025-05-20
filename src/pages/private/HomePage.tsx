
import React from 'react';
import { HomeStats } from '@/components/dashboard/private/HomeStats';
import { CartridgeAlert } from '@/components/dashboard/private/CartridgeAlert';
import { DashboardHeader } from '@/components/dashboard/private/DashboardHeader';
import { EnvironmentalImpactCalculator } from '@/components/dashboard/private/EnvironmentalImpactCalculator';

export function HomePage() {
  return (
    <div className="space-y-6">
      <DashboardHeader userName="User" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CartridgeAlert />
          <HomeStats />
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
