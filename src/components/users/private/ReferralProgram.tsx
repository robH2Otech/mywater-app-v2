
import { Card, CardContent } from "@/components/ui/card";
import { DocumentData } from "firebase/firestore";
import { ReferralStatus } from "./referral/ReferralStatus";
import { ReferralCode } from "./referral/ReferralCode";
import { ReferralForm } from "./referral/ReferralForm";
import { ReferralHeader } from "./referral/ReferralHeader";
import { Info, Award, Share2, Users } from "lucide-react";
import { ReferralSteps } from "./referral/ReferralSteps";
import { ReferralProgressBar } from "./referral/ReferralProgressBar";

interface ReferralProgramProps {
  userData: DocumentData | null;
}

export function ReferralProgram({ userData }: ReferralProgramProps) {
  const referralCode = userData?.referral_code || "MYWATER20";
  const userName = `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim();
  const referralsCount = userData?.referrals_count || 0;
  const referralsNeeded = 3; // Need 3 referrals for free cartridge
  const progress = Math.min(100, (referralsCount / referralsNeeded) * 100);

  return (
    <div className="space-y-6">
      <Card className="bg-spotify-darker border-spotify-accent">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center bg-blue-500/10 rounded-full p-3 mb-2">
              <Award className="h-8 w-8 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold">Refer Your Friends</h2>
            <p className="text-gray-400">Get a free replacement cartridge (value of €150)</p>
          </div>
          
          <ReferralProgressBar 
            progress={progress} 
            referralsCount={referralsCount}
            referralsNeeded={referralsNeeded}
          />

          <div className="p-3 rounded-md border border-blue-700/30 bg-blue-900/10 text-sm text-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Referral Rewards</p>
                <p>
                  Earn 50 points for each friend who purchases a MYWATER product – up to 150 points per calendar year.
                  When you reach 150 points, you'll get a free replacement cartridge!
                </p>
              </div>
            </div>
          </div>
          
          <ReferralSteps />
          
          <ReferralStatus userData={userData} />
          <ReferralCode referralCode={referralCode} />
          <ReferralForm userName={userName} referralCode={referralCode} />
        </CardContent>
      </Card>
    </div>
  );
}
