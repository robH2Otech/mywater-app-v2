
import { Card, CardContent } from "@/components/ui/card";
import { DocumentData } from "firebase/firestore";
import { ReferralStatus } from "./referral/ReferralStatus";
import { ReferralCode } from "./referral/ReferralCode";
import { ReferralForm } from "./referral/ReferralForm";
import { motion } from "framer-motion";
import { ReferralHeader } from "./referral/ReferralHeader";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReferralHistory } from "./referral/ReferralHistory";

interface ReferralProgramProps {
  userData: DocumentData | null;
}

export function ReferralProgram({ userData }: ReferralProgramProps) {
  const [mounted, setMounted] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const isMobile = useIsMobile();

  // Ensure we have the correct referral code from userData
  const referralCode = userData?.referral_code || "";
  const userName = `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim();
  const referralsCount = userData?.referrals_count || 0;
  const referralsConverted = userData?.referrals_converted || 0;
  const referralsNeeded = 3;
  const referralsRemaining = Math.max(0, referralsNeeded - referralsConverted);

  // Add more debug logging
  console.log("ReferralProgram - Full userData:", userData);
  console.log("ReferralProgram - userData.referral_code:", userData?.referral_code);
  console.log("ReferralProgram - referralCode:", referralCode);

  // Ensure animations run after component mount for better performance
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for successful referrals to show animation
  useEffect(() => {
    const handleNewReferral = () => {
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 3000);
    };

    window.addEventListener('newReferralDetected', handleNewReferral);
    return () => {
      window.removeEventListener('newReferralDetected', handleNewReferral);
    };
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate={mounted ? "show" : "hidden"}
      className="space-y-6"
    >
      {/* Success Animation */}
      {showSuccessAnimation && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed top-24 inset-x-0 z-50 flex justify-center"
        >
          <div className="bg-green-500/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <span className="text-sm font-medium">New referral detected! Progress updated.</span>
          </div>
        </motion.div>
      )}

      <motion.div variants={item}>
        <Card className="border-blue-500/20 bg-gradient-to-b from-blue-900/10 to-blue-800/5">
          <CardContent className={`${isMobile ? 'p-4' : 'pt-6 pb-8 px-6'} space-y-6`}>
            <ReferralHeader 
              referralsCount={referralsConverted} 
              referralsNeeded={referralsNeeded}
              referralsRemaining={referralsRemaining}
            />
            
            <ReferralStatus userData={userData} />
            
            <motion.div variants={item}>
              <ReferralCode referralCode={referralCode} />
            </motion.div>
            
            <motion.div variants={item}>
              <ReferralForm userName={userName} referralCode={referralCode} />
            </motion.div>

            {referralsConverted > 0 && (
              <motion.div variants={item}>
                <ReferralHistory referrals={referralsConverted} />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
