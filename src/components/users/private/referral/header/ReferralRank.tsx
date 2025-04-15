
import { TrendingUp } from "lucide-react";

interface ReferralRankProps {
  referralsCount: number;
  referralsRemaining: number;
}

export function ReferralRank({ referralsCount, referralsRemaining }: ReferralRankProps) {
  const getUserRank = (count: number) => {
    if (count >= 3) return "Water Champion";
    if (count >= 2) return "Flow Ambassador";
    if (count >= 1) return "Water Enthusiast";
    return "Water Saver Starter";
  };

  const rank = getUserRank(referralsCount);

  return (
    <div className="p-4 rounded-lg bg-blue-950/40 border border-blue-800/30">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-blue-200">Your Rank</h3>
      </div>
      <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
        {rank}
      </p>
      <p className="text-sm text-blue-300 mt-1">
        {referralsRemaining > 0 
          ? `${referralsRemaining} more referrals to next rank!`
          : "You've reached the highest rank!"}
      </p>
    </div>
  );
}
