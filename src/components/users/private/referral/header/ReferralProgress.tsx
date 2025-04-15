
import { motion } from "framer-motion";

interface ReferralProgressProps {
  referralsCount: number;
  referralsNeeded: number;
  referralsRemaining: number;
}

export function ReferralProgress({ 
  referralsCount, 
  referralsNeeded, 
  referralsRemaining 
}: ReferralProgressProps) {
  const progressPercent = Math.min(100, (referralsCount / referralsNeeded) * 100);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-4 rounded-lg bg-blue-950/40 border border-blue-800/30"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-blue-200">Your Progress</h3>
        <span className="text-sm text-blue-300 px-2 py-1 bg-blue-500/20 rounded-full">
          {referralsCount} of {referralsNeeded}
        </span>
      </div>
      
      <div className="h-2.5 w-full bg-blue-950 rounded-full mt-2">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, delay: 0.4 }}
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
        />
      </div>
      
      {referralsRemaining > 0 ? (
        <p className="text-sm text-blue-300 mt-2">
          {referralsRemaining} more to unlock your free cartridge!
        </p>
      ) : (
        <p className="text-sm text-green-300 mt-2">
          You've earned your free cartridge!
        </p>
      )}
    </motion.div>
  );
}
