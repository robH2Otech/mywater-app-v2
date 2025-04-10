
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FilterIcon, Calendar, Droplets, Users } from "lucide-react";
import { CartridgeVisualization } from "@/components/users/private/CartridgeVisualization";
import { PrivateUser } from "@/types/privateUser";
import { format } from "date-fns";

interface HomeStatsProps {
  userData?: PrivateUser;
  daysUntilReplacement?: number | null;
  isReplacementDueSoon?: boolean;
  isReplacementOverdue?: boolean;
  cartridgeDaysLeft?: number;
  purchaseDate?: string;
  purifierModel?: string;
  referralCount?: number;
}

export function HomeStats({
  userData,
  daysUntilReplacement,
  isReplacementDueSoon,
  isReplacementOverdue,
  cartridgeDaysLeft = 355,
  purchaseDate = "3/31/2025",
  purifierModel = "MYWATER Home Plus",
  referralCount = 0
}: HomeStatsProps) {
  // Use data from userData if available
  const effectiveDaysLeft = userData && daysUntilReplacement !== null 
    ? daysUntilReplacement 
    : cartridgeDaysLeft;
  
  const effectivePurchaseDate = userData?.purchase_date 
    ? format(userData.purchase_date, "M/d/yyyy")
    : purchaseDate;
  
  const effectivePurifierModel = userData?.purifier_model || purifierModel;
  
  const effectiveReferrals = userData?.referrals_count !== undefined 
    ? userData.referrals_count
    : referralCount;

  // Calculate cartridge percentage based on days left
  // Assuming a cartridge lasts 365 days (1 year)
  const cartridgePercentage = ((365 - effectiveDaysLeft) / 365) * 100;
  const remainingPercentage = 100 - cartridgePercentage;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cartridge Status */}
        <Card className="bg-spotify-darker border-spotify-accent">
          <CardContent className="flex items-center p-4 gap-4">
            <div className="p-2 bg-green-900/20 rounded-full">
              <FilterIcon className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Cartridge Status</h3>
              <p className="font-medium text-lg">
                {isReplacementOverdue 
                  ? "Overdue" 
                  : isReplacementDueSoon 
                    ? "Replace Soon" 
                    : `In ${effectiveDaysLeft} days`
                }
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Purchase Date */}
        <Card className="bg-spotify-darker border-spotify-accent">
          <CardContent className="flex items-center p-4 gap-4">
            <div className="p-2 bg-purple-900/20 rounded-full">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Purchased On</h3>
              <p className="font-medium text-lg">{effectivePurchaseDate}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Purifier Model */}
        <Card className="bg-spotify-darker border-spotify-accent">
          <CardContent className="flex items-center p-4 gap-4">
            <div className="p-2 bg-blue-900/20 rounded-full">
              <Droplets className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Purifier Model</h3>
              <p className="font-medium text-lg">{effectivePurifierModel}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Referral Program */}
        <Card className="bg-spotify-darker border-spotify-accent">
          <CardContent className="flex items-center p-4 gap-4">
            <div className="p-2 bg-green-900/20 rounded-full">
              <Users className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-sm text-gray-400">Referral Program</h3>
              <p className="font-medium text-lg">{effectiveReferrals}/3 Referrals</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Cartridge Visualization */}
      <Card className="bg-spotify-darker border-spotify-accent flex justify-center items-center">
        <CardContent className="p-4 w-full">
          <CartridgeVisualization 
            percentage={cartridgePercentage}
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );
}
