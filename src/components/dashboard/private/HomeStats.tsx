
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Droplets, Share2 } from "lucide-react";
import { DocumentData } from "firebase/firestore";
import { PrivateUser } from "@/types/privateUser";

interface HomeStatsProps {
  userData: DocumentData | PrivateUser | null;
  daysUntilReplacement: number | null;
  isReplacementOverdue: boolean;
  isReplacementDueSoon: boolean;
  cartridgeUsagePercent: number;
}

export function HomeStats({ 
  userData, 
  daysUntilReplacement, 
  isReplacementOverdue,
  isReplacementDueSoon,
  cartridgeUsagePercent
}: HomeStatsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Cartridge Status Card */}
      <Card className="glass hover:bg-spotify-accent/40 transition-colors">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-gray-400">Cartridge Status</p>
            <div className="flex justify-between items-center">
              <p className={`text-sm font-medium ${
                isReplacementOverdue 
                  ? "text-red-400" 
                  : isReplacementDueSoon 
                    ? "text-amber-400" 
                    : "text-green-400"
              }`}>
                {isReplacementOverdue 
                  ? `Overdue by ${Math.abs(daysUntilReplacement!)} days` 
                  : `In ${daysUntilReplacement} days`}
              </p>
              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    cartridgeUsagePercent > 80 ? "bg-red-500" : 
                    cartridgeUsagePercent > 50 ? "bg-amber-500" : 
                    "bg-green-500"}`} 
                  style={{ width: `${cartridgeUsagePercent}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Date Card */}
      <Card className="glass hover:bg-spotify-accent/40 transition-colors">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-spotify-dark flex items-center justify-center">
            <Calendar className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Purchased On</p>
            <p className="text-sm font-medium">
              {userData?.purchase_date 
                ? new Date(userData.purchase_date).toLocaleDateString() 
                : "Not available"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Model Card */}
      <Card className="glass hover:bg-spotify-accent/40 transition-colors">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-spotify-dark flex items-center justify-center">
            <Droplets className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Purifier Model</p>
            <p className="text-sm font-medium">{userData?.purifier_model || "Standard"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Referral Card */}
      <Card className="glass hover:bg-spotify-accent/40 transition-colors">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-spotify-dark flex items-center justify-center">
            <Share2 className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Referral Program</p>
            <p className="text-sm font-medium">{userData?.referrals_converted || 0}/3 Referrals</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
