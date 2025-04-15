
import React from "react";
import { DocumentData } from "firebase/firestore";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface ReferralStatusProps {
  userData: DocumentData | null;
}

export function ReferralStatus({ userData }: ReferralStatusProps) {
  // Get the user's referral status
  const referralsCount = userData?.referrals_count || 0;
  const referralsConverted = userData?.referrals_converted || 0;
  const referralRewardEarned = userData?.referral_reward_earned || false;
  const referralRewardClaimed = userData?.referral_reward_claimed || false;
  
  // Define status states
  const isEligible = referralsConverted >= 3;
  const isPending = referralsCount > 0 && referralsCount < 3;
  const isClaimed = referralRewardClaimed;

  const getStatusInfo = () => {
    if (isClaimed) {
      return {
        icon: CheckCircle,
        iconClass: "text-green-400",
        title: "Reward Claimed",
        description: "You've claimed your free €150 replacement cartridge!",
        bgClass: "bg-green-900/10 border-green-600/20"
      };
    }
    
    if (isEligible) {
      return {
        icon: CheckCircle,
        iconClass: "text-yellow-400",
        title: "Reward Ready",
        description: "You've earned a free €150 replacement cartridge! Visit our shop to claim it.",
        bgClass: "bg-yellow-900/10 border-yellow-600/20"
      };
    }
    
    if (isPending) {
      return {
        icon: Clock,
        iconClass: "text-blue-400",
        title: "In Progress",
        description: `Share with ${3 - referralsCount} more friends to earn your free €150 replacement cartridge.`,
        bgClass: "bg-blue-900/10 border-blue-700/20"
      };
    }
    
    return {
      icon: XCircle,
      iconClass: "text-gray-400",
      title: "Not Started Yet",
      description: "Share your code with friends to start earning rewards!",
      bgClass: "bg-slate-800/20 border-slate-700/20"
    };
  };
  
  const { icon: StatusIcon, iconClass, title, description, bgClass } = getStatusInfo();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg ${bgClass} flex items-start gap-3`}
    >
      <StatusIcon className={`h-5 w-5 ${iconClass} flex-shrink-0 mt-1`} />
      <div>
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm text-gray-300 mt-0.5">{description}</p>
      </div>
    </motion.div>
  );
}
