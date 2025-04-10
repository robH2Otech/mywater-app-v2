
import { Progress } from "@/components/ui/progress";

interface ReferralProgressBarProps {
  progress: number;
  referralsCount: number;
  referralsNeeded: number;
}

export function ReferralProgressBar({ progress, referralsCount, referralsNeeded }: ReferralProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">Your Progress</span>
        <span className="font-medium">{referralsCount}/{referralsNeeded} Referrals</span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>0 Points</span>
        <span>150 Points</span>
      </div>
      
      {referralsCount < referralsNeeded ? (
        <p className="text-xs text-center text-gray-400 mt-1">
          You need {referralsNeeded - referralsCount} more referral{referralsNeeded - referralsCount !== 1 && 's'} to get your free cartridge!
        </p>
      ) : (
        <p className="text-xs text-center text-emerald-400 font-medium mt-1">
          Congratulations! You've earned your free cartridge!
        </p>
      )}
    </div>
  );
}
