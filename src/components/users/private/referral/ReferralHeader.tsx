
import React from 'react';
import { Award } from "lucide-react";
import { motion } from "framer-motion";
import { ReferralTitle } from './header/ReferralTitle';
import { ReferralProgress } from './header/ReferralProgress';
import { ReferralRank } from './header/ReferralRank';

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
        
        <ReferralTitle />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <ReferralProgress 
          referralsCount={referralsCount} 
          referralsNeeded={referralsNeeded}
          referralsRemaining={referralsRemaining}
        />
        <ReferralRank 
          referralsCount={referralsCount}
          referralsRemaining={referralsRemaining}
        />
      </motion.div>
    </div>
  );
};
