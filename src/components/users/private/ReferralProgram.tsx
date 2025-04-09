
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
                <p className="font-medium mb-1">Email Delivery Information</p>
                <p>
                  Your referral invitations are sent directly using EmailJS. For the best delivery rate, keep your message 
                  concise and avoid spam-triggering words. If recipients don't see the email, ask them to check their 
                  spam folder or try an alternative email address.
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
