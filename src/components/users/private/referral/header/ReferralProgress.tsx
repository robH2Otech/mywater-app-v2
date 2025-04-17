
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

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
      
      {/* Progress Steps */}
      <div className="grid grid-cols-3 gap-2 mt-3 mb-2">
        {Array.from({ length: referralsNeeded }).map((_, index) => (
          <motion.div 
            key={index}
            initial={{ scale: 0.9, opacity: 0.5 }}
            animate={{ 
              scale: index < referralsCount ? 1 : 0.95,
              opacity: index < referralsCount ? 1 : 0.7
            }}
            transition={{ delay: 0.5 + (index * 0.1) }}
            className={`h-3 rounded-full ${
              index < referralsCount 
                ? "bg-gradient-to-r from-cyan-400 to-blue-500" 
                : "bg-blue-900/70"
            }`}
          />
        ))}
      </div>
      
      <div className="h-2.5 w-full bg-blue-950 rounded-full mt-3">
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, delay: 0.4 }}
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
        />
      </div>
      
      {referralsRemaining > 0 ? (
        <div className="flex items-center gap-2 mt-3">
          <p className="text-sm text-blue-300">
            <strong>{referralsRemaining}</strong> more {referralsRemaining === 1 ? 'purchase' : 'purchases'} to unlock your free cartridge!
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-3">
          <CheckCircle className="text-green-400 h-4 w-4" />
          <p className="text-sm text-green-300">
            You've earned your free €150 replacement cartridge!
          </p>
        </div>
      )}
    </motion.div>
  );
}
