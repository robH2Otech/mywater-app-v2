
import { Card, CardContent } from "@/components/ui/card";
import { DocumentData } from "firebase/firestore";
import { Progress } from "@/components/ui/progress";
import { Award } from "lucide-react";

interface ReferralStatusProps {
  userData: DocumentData | null;
}

export function ReferralStatus({ userData }: ReferralStatusProps) {
  const referralsConverted = userData?.referrals_converted || 0;
  const referralsCount = userData?.referrals_count || 0;
  const rewardEarned = userData?.referral_reward_earned || false;
  const rewardClaimed = userData?.referral_reward_claimed || false;
  
  const maxReferrals = 3;
  const progress = Math.min(100, (referralsConverted / maxReferrals) * 100);
  
  return (
    <div className="bg-spotify-dark/60 rounded-xl p-5">
      <h3 className="text-lg font-semibold flex items-center mb-4">
        <Award className="h-5 w-5 mr-2 text-amber-400" />
        Your Status
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Referral Progress</span>
          <span className="text-sm">{referralsConverted}/{maxReferrals}</span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="p-3 bg-spotify-dark rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-400">{referralsConverted}</p>
            <p className="text-xs text-gray-400">Converted</p>
          </div>
          
          <div className="p-3 bg-spotify-dark rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-400">{referralsCount - referralsConverted}</p>
            <p className="text-xs text-gray-400">Pending</p>
          </div>
        </div>
        
        {rewardEarned && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-900/20 text-center">
            <p className="text-sm font-medium text-amber-300">
              {rewardClaimed ? "Free cartridge claimed!" : "Free cartridge earned! Claim it in your account."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
