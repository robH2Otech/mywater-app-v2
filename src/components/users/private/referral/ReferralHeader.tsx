
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";

export function ReferralHeader() {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Share2 className="h-5 w-5 text-mywater-blue" />
        Referral Program
      </CardTitle>
      <CardDescription>
        Invite friends to try MYWATER and earn rewards when they purchase
      </CardDescription>
    </CardHeader>
  );
}
