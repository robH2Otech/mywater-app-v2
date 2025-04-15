
import { ReferralTitle } from "./header/ReferralTitle";
import { ReferralProgress } from "./header/ReferralProgress";
import { ReferralRank } from "./header/ReferralRank";

interface ReferralHeaderProps {
  referralsCount: number;
  referralsNeeded: number;
  referralsRemaining: number;
}

export function ReferralHeader({ 
  referralsCount, 
  referralsNeeded, 
  referralsRemaining 
}: ReferralHeaderProps) {
  return (
    <div className="space-y-6">
      <ReferralTitle />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReferralProgress 
          referralsCount={referralsCount}
          referralsNeeded={referralsNeeded}
          referralsRemaining={referralsRemaining}
        />
        
        <ReferralRank 
          referralsCount={referralsCount}
        />
      </div>
    </div>
  );
}
