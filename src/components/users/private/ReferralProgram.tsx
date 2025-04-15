import { Card, CardContent } from "@/components/ui/card";
import { DocumentData } from "firebase/firestore";
import { ReferralStatus } from "./referral/ReferralStatus";
import { ReferralCode } from "./referral/ReferralCode";
import { ReferralForm } from "./referral/ReferralForm";
import { Award, Info } from "lucide-react";
import { ReferralSteps } from "./referral/ReferralSteps";
import { motion } from "framer-motion";
import { ReferralHeader } from "./referral/ReferralHeader";

interface ReferralProgramProps {
  userData: DocumentData | null;
}

export function ReferralProgram({ userData }: ReferralProgramProps) {
  const referralCode = userData?.referral_code || "";
  const userName = `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim();
  const referralsCount = userData?.referrals_count || 0;
  const referralsNeeded = 3;
  const referralsRemaining = Math.max(0, referralsNeeded - referralsCount);

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
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <Card className="border-blue-500/20 bg-gradient-to-b from-blue-900/10 to-blue-800/5">
          <CardContent className="pt-6 pb-8 px-4 sm:px-6 space-y-6">
            <ReferralHeader 
              referralsCount={referralsCount} 
              referralsNeeded={referralsNeeded}
              referralsRemaining={referralsRemaining}
            />
            
            <ReferralStatus userData={userData} />
            
            <motion.div variants={item}>
              <ReferralCode />
            </motion.div>
            
            <motion.div variants={item}>
              <ReferralForm userName={userName} referralCode={referralCode} />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
