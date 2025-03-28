
import { Button } from "@/components/ui/button";
import { Edit, User, Home, Monitor, Award } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartridgeDonutChart } from "./CartridgeDonutChart";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-spotify-accent/10 border border-spotify-accent/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-mywater-blue" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">Full Name</p>
                  <p className="text-lg text-white">{`${userData.first_name || ''} ${userData.last_name || ''}`}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">Email Address</p>
                  <p className="text-lg text-white">{userData.email || ''}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">Phone Number</p>
                  <p className="text-lg text-white">{userData.phone || ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-spotify-accent/10 border border-spotify-accent/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Home className="h-5 w-5 text-mywater-blue" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-400">Street Address</p>
                  <p className="text-lg text-white">{userData.street_address || ''}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">City</p>
                    <p className="text-lg text-white">{userData.city || ''}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">Post Code</p>
                    <p className="text-lg text-white">{userData.postal_code || ''}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">Country</p>
                    <p className="text-lg text-white">{userData.country || ''}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="bg-spotify-accent/10 border border-spotify-accent/30 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-mywater-blue" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">Purifier Model</p>
                    <p className="text-lg text-white">{userData.purifier_model || ''}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">Purchase Date</p>
                    <p className="text-lg text-white">
                      {userData.purchase_date 
                        ? (userData.purchase_date.toDate 
                           ? new Date(userData.purchase_date.toDate()).toLocaleDateString() 
                           : new Date(userData.purchase_date).toLocaleDateString())
                        : ''}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">Purchase Price</p>
                    <p className="text-lg text-white">{userData.purchase_price ? `$${userData.purchase_price}` : 'N/A'}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex-1 flex flex-col items-center justify-center">
                  <p className="text-sm font-medium text-gray-400 mb-2">Cartridge Life Remaining</p>
                  <div className="w-32 h-32">
                    <CartridgeDonutChart percentage={cartridgeUsagePercent} />
                  </div>
                  <p className="text-sm text-center mt-2 text-gray-400">
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
    </div>
  );
}
