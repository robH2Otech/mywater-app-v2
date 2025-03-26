
import { Card, CardContent } from "@/components/ui/card";
import { DocumentData } from "firebase/firestore";
import { ReferralStatus } from "./referral/ReferralStatus";
import { ReferralCode } from "./referral/ReferralCode";
import { ReferralForm } from "./referral/ReferralForm";
import { ReferralHeader } from "./referral/ReferralHeader";

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
          <ReferralStatus userData={userData} />
          <ReferralCode referralCode={referralCode} />
          <ReferralForm userName={userName} referralCode={referralCode} />
        </CardContent>
      </Card>
    </div>
  );
}
