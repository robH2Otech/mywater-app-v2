
import { DocumentData } from "firebase/firestore";
import { Award } from "lucide-react";
import { motion } from "framer-motion";

interface ReferralStatusProps {
  userData: DocumentData | null;
}

export function ReferralStatus({ userData }: ReferralStatusProps) {
  const referralsConverted = userData?.referrals_converted || 0;
  const isMyWaterHero = referralsConverted >= 3;
  const progressPercentage = Math.min(100, ((referralsConverted) / 3) * 100);
  
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <motion.p 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm text-gray-300"
        >
          Your Referral Status
        </motion.p>
        {isMyWaterHero && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs rounded-full px-3 py-1.5 shadow-glow"
          >
            <Award className="h-3.5 w-3.5" />
            <span className="font-bold tracking-wide">MYWATER HERO</span>
          </motion.div>
        )}
      </div>
      
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        className="relative"
      >
        <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
          />
        </div>
        
        {/* Milestones */}
        <div className="flex justify-between mt-1 px-1">
          <Milestone active={referralsConverted >= 1} position={33} label="1" />
          <Milestone active={referralsConverted >= 2} position={66} label="2" />
          <Milestone active={referralsConverted >= 3} position={100} label="3" />
        </div>
      </motion.div>
      
      <div className="flex justify-between items-center">
        <p className="text-xs text-blue-300 font-medium">
          {referralsConverted}/3 Referrals
        </p>
        <p className="text-xs text-gray-300">
          {isMyWaterHero 
            ? "Congratulations! You've earned a free cartridge!" 
            : "Need " + (3 - referralsConverted) + " more to earn a free cartridge"}
        </p>
      </div>
      
      {isMyWaterHero && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-3 rounded-md bg-green-900/20 border border-green-500/20 text-center"
        >
          <p className="text-green-300 text-sm font-medium">
            You've qualified for a free replacement cartridge!
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Contact customer support to claim your reward.
          </p>
        </motion.div>
      )}
    </div>
  );
}

interface MilestoneProps {
  active: boolean;
  position: number;
  label: string;
}

function Milestone({ active, position, label }: MilestoneProps) {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{ scale: active ? 1 : 0.8, opacity: active ? 1 : 0.5 }}
      transition={{ delay: active ? 0.5 : 0 }}
      className={`absolute -mt-4 transform -translate-x-1/2`}
      style={{ left: `${position}%` }}
    >
      <div className={`flex flex-col items-center`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-400'}`}>
          {label}
        </div>
      </div>
    </motion.div>
  );
}
