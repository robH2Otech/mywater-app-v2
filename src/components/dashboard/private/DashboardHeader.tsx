
import { UserAvatar } from "@/components/layout/UserAvatar";
import { WelcomeMessage } from "@/components/layout/WelcomeMessage";
import { Card, CardContent } from "@/components/ui/card";
import { CartridgeDonutChart } from "@/components/users/private/CartridgeDonutChart";
import { ReferralProgressChart } from "@/components/users/private/ReferralProgressChart";
import { differenceInDays } from "date-fns";
import { DocumentData } from "firebase/firestore";

interface DashboardHeaderProps {
  userData: DocumentData | null;
  daysUntilReplacement: number | null;
  isReplacementOverdue: boolean;
  isReplacementDueSoon: boolean;
  cartridgeUsagePercent: number;
}

export function DashboardHeader({ 
  userData, 
  daysUntilReplacement, 
  isReplacementOverdue,
  isReplacementDueSoon,
  cartridgeUsagePercent
}: DashboardHeaderProps) {
  return (
    <Card className="mb-6 bg-spotify-darker border-spotify-accent">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <WelcomeMessage 
              firstName={userData?.first_name}
              lastName={userData?.last_name}
            />
            <p className="text-gray-400">
              {userData?.purifier_model || "MYWATER System"} Owner
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* Cartridge Status with Donut Chart */}
            <div className="bg-spotify-dark rounded-lg p-3 flex items-center gap-3">
              <div className="h-16 w-16">
                <CartridgeDonutChart percentage={cartridgeUsagePercent} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Cartridge Replacement</p>
                <p className={`text-sm font-medium ${
                  isReplacementOverdue 
                    ? "text-red-400" 
                    : isReplacementDueSoon 
                      ? "text-amber-400" 
                      : "text-green-400"
                }`}>
                  {isReplacementOverdue 
                    ? `Overdue by ${Math.abs(daysUntilReplacement!)} days` 
                    : isReplacementDueSoon 
                      ? `Due in ${daysUntilReplacement} days` 
                      : `In ${daysUntilReplacement} days`}
                </p>
              </div>
            </div>
            
            {/* Referral Status with Bar Chart */}
            <div className="bg-spotify-dark rounded-lg p-3 flex items-center gap-3">
              <div className="h-16 w-16">
                <ReferralProgressChart referrals={userData?.referrals_converted || 0} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Referral Program</p>
                <p className="text-sm font-medium text-white">
                  {userData?.referrals_converted || 0}/3 Friends Purchased
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
