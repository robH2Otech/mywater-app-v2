
import { motion } from "framer-motion";
import { TrendingUp, Award, Star } from "lucide-react";

interface ReferralRankProps {
  referralsCount: number;
}

export function ReferralRank({ referralsCount }: ReferralRankProps) {
  // Define ranks based on referral count
  const getRankInfo = () => {
    if (referralsCount >= 10) {
      return {
        title: "Water Champion",
        nextRank: "Maximum rank achieved!",
        remaining: 0,
        nextAt: 10,
        color: "from-purple-400 to-pink-400",
        progress: 100,
        badge: <Award className="h-5 w-5 text-purple-300" />
      };
    } else if (referralsCount >= 5) {
      return {
        title: "Flow Ambassador",
        nextRank: "Water Champion",
        remaining: 10 - referralsCount,
        nextAt: 10,
        color: "from-cyan-400 to-blue-500",
        progress: (referralsCount - 5) / 5 * 100,
        badge: <Star className="h-5 w-5 text-blue-300" />
      };
    } else if (referralsCount >= 3) {
      return {
        title: "Hydration Expert",
        nextRank: "Flow Ambassador",
        remaining: 5 - referralsCount,
        nextAt: 5,
        color: "from-green-400 to-teal-500",
        progress: (referralsCount - 3) / 2 * 100,
        badge: <TrendingUp className="h-5 w-5 text-teal-300" />
      };
    } else {
      return {
        title: "Water Saver Starter",
        nextRank: "Hydration Expert",
        remaining: 3 - referralsCount,
        nextAt: 3,
        color: "from-blue-400 to-cyan-300",
        progress: referralsCount / 3 * 100,
        badge: <TrendingUp className="h-5 w-5 text-blue-300" />
      };
    }
  };

  const rank = getRankInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="p-4 rounded-lg bg-blue-950/40 border border-blue-800/30"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-300" />
          <h3 className="text-lg font-semibold text-blue-200">Your Rank</h3>
        </div>
      </div>

      <div className="my-3 text-center flex items-center justify-center gap-2">
        {rank.badge}
        <h4 className={`text-xl font-bold bg-gradient-to-r ${rank.color} bg-clip-text text-transparent`}>
          {rank.title}
        </h4>
      </div>

      {rank.remaining > 0 && (
        <>
          <div className="h-1.5 w-full bg-blue-950 rounded-full mt-3">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${rank.progress}%` }}
              transition={{ duration: 1, delay: 0.6 }}
              className={`h-full bg-gradient-to-r ${rank.color} rounded-full`}
            />
          </div>
          <p className="text-sm text-blue-300 mt-2 text-center">
            {rank.remaining} more successful {rank.remaining === 1 ? 'referral' : 'referrals'} to reach <span className="font-medium text-white">{rank.nextRank}</span>!
          </p>
        </>
      )}
    </motion.div>
  );
}
