
import React from 'react';
import { Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { ReferralProgressChart } from '@/components/users/private/ReferralProgressChart';

interface ReferralHeaderProps {
  referralsCount: number;
  referralsNeeded: number;
  referralsRemaining: number;
}

export const ReferralHeader: React.FC<ReferralHeaderProps> = ({ 
  referralsCount, 
  referralsNeeded,
  referralsRemaining
}) => {
  // Calculate user rank based on referrals
  const getUserRank = (count: number) => {
    if (count >= 3) return "Water Champion";
    if (count >= 2) return "Flow Ambassador";
    if (count >= 1) return "Water Enthusiast";
    return "Water Saver Starter";
  };

  const rank = getUserRank(referralsCount);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full blur-2xl" />
          </div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative inline-flex items-center justify-center bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full p-4 z-10 shadow-lg"
          >
            <Award className="h-10 w-10 text-white" />
          </motion.div>
        </div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mt-3 bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
            Refer Friends & Earn Rewards
          </h2>
          <div className="flex flex-col items-center gap-2 mt-3">
            <p className="text-green-300 font-semibold text-lg">
              You Earn: Free €150 Cartridge!
            </p>
            <p className="text-blue-300">
              Your Friends Get: 20% Off Their Purchase
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="p-4 rounded-lg bg-blue-950/40 border border-blue-800/30">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-blue-200">Your Progress</h3>
            <span className="text-sm text-blue-300 px-2 py-1 bg-blue-500/20 rounded">
              {referralsCount} of {referralsNeeded}
            </span>
          </div>
          <div className="h-2.5 w-full bg-blue-950 rounded-full mt-2">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${(referralsCount / referralsNeeded) * 100}%` }}
            />
          </div>
          {referralsRemaining > 0 && (
            <p className="text-sm text-blue-300 mt-2">
              {referralsRemaining} more to unlock your free cartridge!
            </p>
          )}
        </div>

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
      </motion.div>
    </div>
  );
};
