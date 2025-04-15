
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
  const referralCode = userData?.referral_code || "MYWATER20";
  const userName = `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim();
  const referralsCount = userData?.referrals_count || 0;
  const referralsNeeded = 3;
  const referralsRemaining = Math.max(0, referralsNeeded - referralsCount);

  // Animation variants for staggered animations
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
            
            <motion.div 
              variants={item}
              className="p-4 rounded-md border border-blue-700/30 bg-blue-900/10 text-sm text-blue-200 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -translate-y-12 translate-x-12" />
              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1.5">Referral Rewards Program</p>
                    <p className="text-sm text-blue-100/80 leading-relaxed">
                      For every friend who purchases a MYWATER system using your code, you'll earn progress toward your free replacement cartridge worth €150. Get 3 friends to purchase and claim your reward!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={item}>
              <ReferralSteps />
            </motion.div>
            
            <motion.div variants={item}>
              <ReferralCode referralCode={referralCode} />
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
