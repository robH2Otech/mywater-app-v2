
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { auth } from "@/integrations/firebase/client";
import { usePrivateUserData } from "@/hooks/dashboard/usePrivateUserData";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { PrivateDashboardHeader } from "@/components/dashboard/private/PrivateDashboardHeader";
import { PrivateDashboardStats } from "@/components/dashboard/private/PrivateDashboardStats";
import { PrivateDashboardCharts } from "@/components/dashboard/private/PrivateDashboardCharts";
import { PrivateRecentAlerts } from "@/components/dashboard/private/PrivateRecentAlerts";

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
        {/* Header with logo and user menu */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
              <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="#1A1F2C"/>
              <path d="M27.5 17.5C27.5 21.6421 24.1421 25 20 25C15.8579 25 12.5 21.6421 12.5 17.5C12.5 13.3579 15.8579 10 20 10C24.1421 10 27.5 13.3579 27.5 17.5Z" stroke="#33C3F0" strokeWidth="2"/>
              <path d="M25 27.5C25 28.8807 22.7614 30 20 30C17.2386 30 15 28.8807 15 27.5C15 26.1193 17.2386 25 20 25C22.7614 25 25 26.1193 25 27.5Z" stroke="#33C3F0" strokeWidth="2"/>
            </svg>
            <h1 className="text-2xl md:text-3xl font-bold text-white">MYWATER</h1>
          </div>
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
        
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">
            Hey {userData?.first_name || "User"}, welcome back!
          </h1>
          <p className="text-xl text-gray-400 mt-2">Welcome to the dashboard!</p>
        </div>
        
        {/* Stats cards */}
        <PrivateDashboardStats 
          userData={userData}
          daysUntilReplacement={daysUntilReplacement}
          isReplacementDueSoon={isReplacementDueSoon}
          isReplacementOverdue={isReplacementOverdue}
        />
        
        {/* Charts and alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <PrivateDashboardCharts userData={userData} />
          <PrivateRecentAlerts />
        </div>
      </div>
    </div>
  );
}
