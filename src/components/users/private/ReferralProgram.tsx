
import { Card, CardContent } from "@/components/ui/card";
import { DocumentData } from "firebase/firestore";
import { ReferralStatus } from "./referral/ReferralStatus";
import { ReferralCode } from "./referral/ReferralCode";
import { ReferralForm } from "./referral/ReferralForm";
import { ReferralHeader } from "./referral/ReferralHeader";
import { Info } from "lucide-react";

interface ReferralProgramProps {
  userData: DocumentData | null;
}

export function ReferralProgram({ userData }: ReferralProgramProps) {
  const referralCode = userData?.referral_code || "MYWATER20";
  const userName = `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim();

  return (
    <div className="space-y-6">
      <Card className="bg-spotify-darker border-spotify-accent">
        <ReferralHeader />
        <CardContent>
          <div className="mb-6 p-3 rounded-md border border-blue-700/30 bg-blue-900/10 text-sm text-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Reliable Email Delivery</p>
                <p>
                  Your referral invitations will be sent immediately. If delivery is delayed due to email 
                  provider restrictions, our system will automatically retry the delivery. You can also 
                  manually retry delivery with the "Retry Delivery" button.
                </p>
              </div>
            </div>
          </div>
          
          <ReferralStatus userData={userData} />
          <ReferralCode referralCode={referralCode} />
          <ReferralForm userName={userName} referralCode={referralCode} />
        </CardContent>
      </Card>
    </div>
  );
}
