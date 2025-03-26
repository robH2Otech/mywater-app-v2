
import { UserAvatar } from "@/components/layout/UserAvatar";
import { WelcomeMessage } from "@/components/layout/WelcomeMessage";
import { Card, CardContent } from "@/components/ui/card";
import { CartridgeDonutChart } from "@/components/users/private/CartridgeDonutChart";
import { ReferralProgressChart } from "@/components/users/private/ReferralProgressChart";
import { DocumentData } from "firebase/firestore";

interface PrivateDashboardHeaderProps {
  userData: DocumentData | null;
  daysUntilReplacement: number | null;
  isReplacementOverdue: boolean;
  isReplacementDueSoon: boolean;
  cartridgeUsagePercent: number;
}

export function PrivateDashboardHeader({ 
  userData, 
  daysUntilReplacement, 
  isReplacementOverdue,
  isReplacementDueSoon,
  cartridgeUsagePercent
}: PrivateDashboardHeaderProps) {
  return (
    <Card className="mb-6 bg-spotify-darker border-spotify-accent">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Hey {userData?.first_name || "User"}, welcome back!
            </h2>
            <p className="text-gray-400">
              {userData?.purifier_model || "MYWATER System"} Owner
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
