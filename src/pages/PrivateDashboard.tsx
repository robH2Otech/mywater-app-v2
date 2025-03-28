
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { auth } from "@/integrations/firebase/client";
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";
import { DashboardHeader } from "@/components/dashboard/private/DashboardHeader";
import { CartridgeAlert } from "@/components/dashboard/private/CartridgeAlert";
import { DashboardTabs } from "@/components/dashboard/private/DashboardTabs";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";

export function PrivateDashboard() {
  const navigate = useNavigate();
  const {
    userData,
    loading,
    daysUntilReplacement,
    isReplacementDueSoon,
    isReplacementOverdue,
    formattedReplacementDate,
    cartridgeUsagePercent
  } = usePrivateUserData();
  
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-spotify-dark flex items-center justify-center">
        <p className="text-white">Loading your data...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-spotify-dark">
      <Header />
      
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* User greeting and status summary */}
        <DashboardHeader 
          userData={userData}
          daysUntilReplacement={daysUntilReplacement}
          isReplacementOverdue={isReplacementOverdue}
          isReplacementDueSoon={isReplacementDueSoon}
          cartridgeUsagePercent={cartridgeUsagePercent}
        />
        
        {/* Alert for cartridge replacement */}
        <CartridgeAlert 
          isReplacementDueSoon={isReplacementDueSoon}
          isReplacementOverdue={isReplacementOverdue}
          formattedReplacementDate={formattedReplacementDate}
        />
        
        {/* Main content tabs */}
        <DashboardTabs userData={userData} />
      </div>
    </div>
  );
}
