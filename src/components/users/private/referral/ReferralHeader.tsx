
import React from 'react';
import { Award } from "lucide-react";
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
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full blur-xl" />
          </div>
          <div className="relative inline-flex items-center justify-center bg-blue-500 rounded-full p-3 z-10">
            <Award className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <motion.div>
          <h2 className="text-2xl font-bold mt-3 bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">
            Refer Your Friends &amp; Earn Rewards
          </h2>
          <p className="text-gray-300 mt-1">
            Share the benefits &amp; earn a free replacement cartridge worth €150
          </p>
        </motion.div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 rounded-lg bg-blue-950/40 border border-blue-800/30">
        <div className="text-center sm:text-left space-y-1 flex-1">
          <h3 className="text-lg font-semibold text-blue-200">Your Progress</h3>
          <p className="text-md text-blue-100/70">
            <span className="text-xl font-bold text-white">{referralsCount}</span> of {referralsNeeded} referrals completed
            {referralsRemaining > 0 && (
              <span className="text-blue-300"> ({referralsRemaining} more to go!)</span>
            )}
          </p>
        </div>
        
        <div className="w-full sm:w-36 h-6">
          <ReferralProgressChart referrals={referralsCount} />
        </div>
      </div>
    </div>
  );
};
