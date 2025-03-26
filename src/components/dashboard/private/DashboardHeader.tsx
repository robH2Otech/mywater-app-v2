
import { UserAvatar } from "@/components/layout/UserAvatar";
import { WelcomeMessage } from "@/components/layout/WelcomeMessage";
import { Card, CardContent } from "@/components/ui/card";
import { CartridgeDonutChart } from "@/components/users/private/CartridgeDonutChart";
import { ReferralProgressChart } from "@/components/users/private/ReferralProgressChart";
import { DocumentData } from "firebase/firestore";
import { Calendar, Filter, Droplets, Share2 } from "lucide-react";

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Cartridge Status Card */}
      <Card className="glass hover:bg-spotify-accent/40 transition-colors">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-spotify-dark flex items-center justify-center">
            <Filter className="h-6 w-6 text-mywater-blue" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Cartridge Status</p>
            <p className={`text-lg font-medium ${
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
        </CardContent>
      </Card>

      {/* Purchase Date Card */}
      <Card className="glass hover:bg-spotify-accent/40 transition-colors">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-spotify-dark flex items-center justify-center">
            <Calendar className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Purchased On</p>
            <p className="text-lg font-medium">
              {userData?.purchase_date 
                ? new Date(userData.purchase_date).toLocaleDateString() 
                : "Not available"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Model Card */}
      <Card className="glass hover:bg-spotify-accent/40 transition-colors">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-spotify-dark flex items-center justify-center">
            <Droplets className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Purifier Model</p>
            <p className="text-lg font-medium">{userData?.purifier_model || "Standard"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Referral Card */}
      <Card className="glass hover:bg-spotify-accent/40 transition-colors">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-spotify-dark flex items-center justify-center">
            <Share2 className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Referral Program</p>
            <p className="text-lg font-medium">{userData?.referrals_converted || 0}/3 Referrals</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
