
import { motion } from "framer-motion";
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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-lg bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-700/20"
      >
        <h3 className="text-sm font-medium text-blue-200 mb-2">Dual Rewards</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-950/50 rounded-md text-center">
            <p className="text-xs text-blue-300">For Your Friend</p>
            <p className="text-lg font-bold text-white mt-1">20% OFF</p>
            <p className="text-xs text-blue-300 mt-1">First Purchase</p>
          </div>
          <div className="p-3 bg-blue-950/50 rounded-md text-center">
            <p className="text-xs text-blue-300">For You</p>
            <p className="text-lg font-bold text-white mt-1">€150 FREE</p>
            <p className="text-xs text-blue-300 mt-1">Cartridge</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
