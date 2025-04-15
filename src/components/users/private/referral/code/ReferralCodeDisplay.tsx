
import { motion } from "framer-motion";

interface ReferralCodeDisplayProps {
  referralCode: string;
}

export function ReferralCodeDisplay({ referralCode }: ReferralCodeDisplayProps) {
  if (!referralCode) {
    return (
      <div className="text-center space-y-2">
        <h3 className="text-sm font-medium text-blue-300">Your Referral Code</h3>
        <div className="h-8 bg-blue-900/30 animate-pulse rounded-md w-32 mx-auto"></div>
      </div>
    );
  }
  
  return (
    <div className="text-center space-y-2">
      <h3 className="text-sm font-medium text-blue-300">Your Referral Code</h3>
      <motion.p 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-white bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
      >
        {referralCode}
      </motion.p>
    </div>
  );
}
