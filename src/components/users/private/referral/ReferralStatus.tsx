
import React from "react";
import { DocumentData } from "firebase/firestore";
import { CheckCircle, Share2, Clock } from "lucide-react";
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
  const isPending = referralsCount > 0 && referralsConverted < 3;
  const isClaimed = referralRewardClaimed;
  
  // Get most recent referral (mock data - would be pulled from actual referrals)
  const lastReferralDate = userData?.last_referral_date 
    ? new Date(userData.last_referral_date) 
    : null;

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
        title: "Reward Ready!",
        description: "Great job! Visit our shop to claim your free €150 replacement cartridge.",
        bgClass: "bg-yellow-900/10 border-yellow-600/20"
      };
    }
    
    if (isPending) {
      return {
        icon: Clock,
        iconClass: "text-blue-400",
        title: "In Progress",
        description: lastReferralDate 
          ? `Last activity: ${lastReferralDate.toLocaleDateString()}. Keep sharing to earn your free cartridge!`
          : `Share with ${3 - referralsConverted} more friends who complete a purchase.`,
        bgClass: "bg-blue-900/10 border-blue-700/20"
      };
    }
    
    return {
      icon: Share2,
      iconClass: "text-cyan-400",
      title: "Ready to Start",
      description: "Share your code below to start earning your free €150 replacement cartridge!",
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
