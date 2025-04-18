
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { createReferralShareContent } from "@/utils/emailUtil";
import { ShareOptions } from "./components/ShareOptions";
import { toast } from "@/hooks/use-toast";

interface ReferralFormProps {
  userName: string;
  referralCode: string;
}

export function ReferralForm({ userName, referralCode }: ReferralFormProps) {
  const [isShareOptionsVisible, setIsShareOptionsVisible] = useState(false);

  const toggleShareOptions = () => {
    setIsShareOptionsVisible(!isShareOptionsVisible);
  };

  const handleShareLink = async () => {
    const shareData = createReferralShareContent(userName, referralCode);
    toggleShareOptions();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
          Share With Friends
        </h3>
      </div>
      
      {/* Share Button */}
      <Button
        onClick={handleShareLink}
        className="w-full h-12 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 transition-all"
      >
        <Share2 className="h-5 w-5 mr-2" />
        Share Your Invite
      </Button>

      {isShareOptionsVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <Card className="border-blue-500/20 bg-blue-900/10 p-4 rounded-md mt-3">
            <ShareOptions 
              referralContent={createReferralShareContent(userName, referralCode)}
              userName={userName}
              referralCode={referralCode}
            />
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
