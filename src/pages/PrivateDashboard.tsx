
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { auth } from "@/integrations/firebase/client";
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";
import { DashboardHeader } from "@/components/dashboard/private/DashboardHeader";
import { CartridgeAlert } from "@/components/dashboard/private/CartridgeAlert";
import { DashboardTabs } from "@/components/dashboard/private/DashboardTabs";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { Card } from "@/components/ui/card";
import { WelcomeMessage } from "@/components/layout/WelcomeMessage";

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
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header styled like the business Index page */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">MYWATER Home Portal</h1>
          <div className="flex items-center gap-3">
            <UserAvatar 
              firstName={userData?.first_name || ""}
              lastName={userData?.last_name || ""}
              className="hidden md:flex"
            />
            <Button variant="ghost" onClick={handleSignOut} className="text-gray-400">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        
        {/* Welcome message like in business Index */}
        <Card className="mb-6 bg-spotify-darker border-spotify-accent">
          <div className="p-6">
            <WelcomeMessage 
              firstName={userData?.first_name}
              lastName={userData?.last_name}
            />
            <p className="text-gray-400">
              {userData?.purifier_model || "MYWATER System"} Owner
            </p>
          </div>
        </Card>
        
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
