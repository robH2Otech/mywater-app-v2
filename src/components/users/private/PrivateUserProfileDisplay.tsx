
import { Button } from "@/components/ui/button";
import { Edit, User, Home, Monitor, Award } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartridgeDonutChart } from "./CartridgeDonutChart";
import { ReferralProgressChart } from "./ReferralProgressChart";

interface PrivateUserProfileDisplayProps {
  userData: any;
  onEdit: () => void;
  cartridgeUsagePercent: number;
}

export function PrivateUserProfileDisplay({ 
  userData, 
  onEdit, 
  cartridgeUsagePercent 
}: PrivateUserProfileDisplayProps) {
  if (!userData) {
    return <p className="text-gray-400">Loading profile data...</p>;
  }

  const isMyWaterHero = (userData?.referrals_converted || 0) >= 3;
  const referralsCount = userData?.referrals_count || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-white">My Information</h3>
          {isMyWaterHero && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs rounded-full px-2 py-1">
              <Award className="h-3 w-3" />
              <span>MYWATER HERO</span>
            </div>
          )}
        </div>
        <Button 
          onClick={onEdit}
          variant="outline"
          className="bg-mywater-blue hover:bg-mywater-blue/90 text-white"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact Information Card */}
        <Card className="bg-spotify-accent/10 border border-spotify-accent/30">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-md flex items-center gap-2">
              <User className="h-4 w-4 text-mywater-blue" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400">Full Name</p>
                <p className="text-sm text-white">{`${userData.first_name || ''} ${userData.last_name || ''}`}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400">Email Address</p>
                <p className="text-sm text-white truncate">{userData.email || ''}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400">Phone Number</p>
                <p className="text-sm text-white">{userData.phone || ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Address Information Card */}
        <Card className="bg-spotify-accent/10 border border-spotify-accent/30">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-md flex items-center gap-2">
              <Home className="h-4 w-4 text-mywater-blue" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400">Street Address</p>
                <p className="text-sm text-white">{userData.street_address || ''}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400">City</p>
                <p className="text-sm text-white">{userData.city || ''}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400">Postal Code</p>
                  <p className="text-sm text-white">{userData.postal_code || ''}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400">Country</p>
                  <p className="text-sm text-white">{userData.country || ''}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* System Information Card */}
        <Card className="bg-spotify-accent/10 border border-spotify-accent/30">
          <CardHeader className="pb-2 px-4 pt-4">
            <CardTitle className="text-md flex items-center gap-2">
              <Monitor className="h-4 w-4 text-mywater-blue" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="space-y-3 md:w-1/2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400">Purifier Model</p>
                  <p className="text-sm text-white">{userData.purifier_model || ''}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400">Purchase Date</p>
                  <p className="text-sm text-white">
                    {userData.purchase_date 
                      ? (userData.purchase_date.toDate 
                         ? new Date(userData.purchase_date.toDate()).toLocaleDateString() 
                         : new Date(userData.purchase_date).toLocaleDateString())
                      : ''}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400">Referral Points</p>
                  <p className="text-sm text-white flex items-center gap-2">
                    <span>{(referralsCount * 50)}/150 Points</span>
                    {isMyWaterHero && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        Free Cartridge Earned!
                      </span>
                    )}
                  </p>
                  <div className="h-1.5 w-full bg-gray-700 rounded-full mt-1">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" 
                      style={{ width: `${Math.min(100, (referralsCount * 50) / 150 * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <p className="text-xs font-medium text-gray-400 mb-1 text-center">Cartridge Life</p>
                <div className="w-28 h-28 mx-auto">
                  <CartridgeDonutChart percentage={cartridgeUsagePercent} />
                </div>
                <p className="text-[10px] text-center mt-1 text-gray-400">
                  Next replacement: {userData?.cartridge_replacement_date 
                    ? (userData.cartridge_replacement_date.toDate 
                       ? new Date(userData.cartridge_replacement_date.toDate()).toLocaleDateString() 
                       : new Date(userData.cartridge_replacement_date).toLocaleDateString())
                    : 'Not set'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
