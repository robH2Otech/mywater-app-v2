
import { motion } from "framer-motion";

interface ReferralCodeDisplayProps {
  referralCode: string;
}

export function ReferralCodeDisplay({ referralCode }: ReferralCodeDisplayProps) {
  return (
    <div className="text-center space-y-2">
      <h3 className="text-sm font-medium text-blue-300">Your Referral Code</h3>
      <p className="text-2xl sm:text-3xl font-mono font-bold tracking-wider text-white bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
        {referralCode}
      </p>
    </div>
  );
}
