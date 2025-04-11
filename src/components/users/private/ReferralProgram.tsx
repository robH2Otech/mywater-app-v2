
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentData, doc, getDoc } from "firebase/firestore";
import { ReferralStatus } from "./referral/ReferralStatus";
import { ReferralCode } from "./referral/ReferralCode";
import { ReferralForm } from "./referral/ReferralForm";
import { Info, Award, Share2, Clock } from "lucide-react";
import { ReferralSteps } from "./referral/ReferralSteps";
import { ReferralProgressBar } from "./referral/ReferralProgressBar";
import { db } from "@/integrations/firebase/client";
import { motion } from "framer-motion";
import { useAuthState } from "@/hooks/firebase/useAuthState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ReferralProgramProps {
  userData: DocumentData | null;
}

export function ReferralProgram({ userData }: ReferralProgramProps) {
  const { user } = useAuthState();
  const [referralCode, setReferralCode] = useState<string>("MYWATER20");
  const userName = `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim();
  const referralsCount = userData?.referrals_count || 0;
  const referralsNeeded = 3; // Need 3 referrals for free cartridge
  const progress = Math.min(100, (referralsCount / referralsNeeded) * 100);

  // Fetch the actual referral code from Firestore
  useEffect(() => {
    const fetchReferralCode = async () => {
      if (user?.uid) {
        try {
          // Check referral_codes collection for this user
          const referralCodeDoc = await getDoc(doc(db, "referral_codes", user.uid));
          
          if (referralCodeDoc.exists() && referralCodeDoc.data()?.code) {
            setReferralCode(referralCodeDoc.data().code);
          } else {
            // Try to get from the user's document
            const userDoc = await getDoc(doc(db, "app_users_privat", user.uid));
            if (userDoc.exists() && userDoc.data()?.referral_code) {
              setReferralCode(userDoc.data().referral_code);
            } else {
              console.log("Using default referral code as none found in database");
            }
          }
        } catch (error) {
          console.error("Error fetching referral code:", error);
        }
      }
    };

    fetchReferralCode();
  }, [user]);

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden bg-gradient-to-br from-spotify-darker to-spotify-dark border-spotify-accent/50">
          <CardContent className="p-0">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-center">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="inline-flex items-center justify-center bg-white/20 rounded-full p-4 mb-3 backdrop-blur-sm"
              >
                <Award className="h-10 w-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-1">Refer Your Friends</h2>
              <p className="text-white/80 text-lg">Get a free replacement cartridge worth €150</p>
            </div>
            
            {/* Main Content */}
            <div className="px-6 py-5 space-y-6">
              {/* Progress Tracker */}
              <div className="pt-2 pb-4">
                <ReferralProgressBar 
                  progress={progress} 
                  referralsCount={referralsCount}
                  referralsNeeded={referralsNeeded}
                />
              </div>
              
              {/* Info Alert */}
              <Alert className="bg-blue-900/20 border-blue-500/30">
                <Info className="h-5 w-5 text-blue-400" />
                <AlertTitle className="text-blue-300">Referral Program</AlertTitle>
                <AlertDescription className="text-blue-100">
                  For every friend who purchases a MYWATER system, you earn 50 points. Collect 150 points (3 referrals) 
                  to receive a free replacement cartridge!
                </AlertDescription>
              </Alert>
              
              {/* Referral Steps */}
              <div className="bg-spotify-dark/60 rounded-xl p-5">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-400" />
                  How It Works
                </h3>
                <ReferralSteps />
              </div>
              
              {/* Status and Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-5">
                  <ReferralStatus userData={userData} />
                </div>
                <div>
                  <ReferralCode referralCode={referralCode} />
                </div>
              </div>
              
              <ReferralForm userName={userName} referralCode={referralCode} />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
