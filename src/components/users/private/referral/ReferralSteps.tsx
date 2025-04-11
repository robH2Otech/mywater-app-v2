
import { Share2, ShoppingCart, Gift } from "lucide-react";
import { motion } from "framer-motion";

export function ReferralSteps() {
  const steps = [
    {
      icon: <Share2 className="h-5 w-5 text-blue-400" />,
      title: "Share",
      description: "Send your referral code to friends via email or social media",
      color: "from-blue-500 to-cyan-500",
      delay: 0
    },
    {
      icon: <ShoppingCart className="h-5 w-5 text-green-400" />,
      title: "Friend Purchases",
      description: "Your friend uses your code at checkout",
      color: "from-green-500 to-emerald-500",
      delay: 0.1
    },
    {
      icon: <Gift className="h-5 w-5 text-purple-400" />,
      title: "Earn Rewards",
      description: "Get a free cartridge after 3 successful referrals",
      color: "from-purple-500 to-pink-500",
      delay: 0.2
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {steps.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: step.delay, duration: 0.4 }}
          className="relative"
        >
          <div className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg bg-spotify-accent/10 hover:bg-spotify-accent/20 transition-colors">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-r ${step.color}`}>
              {step.icon}
            </div>
            <h4 className="font-medium text-white">{step.title}</h4>
            <p className="text-sm text-gray-400">{step.description}</p>
          </div>
          
          {index < steps.length - 1 && (
            <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10 text-gray-500">
              →
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
