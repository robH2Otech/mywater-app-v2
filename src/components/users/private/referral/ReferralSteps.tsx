
import { Award, Send, Tag, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export function ReferralSteps() {
  const steps = [
    {
      icon: Tag,
      title: "Share Your Code",
      description: "Send your unique referral code to friends"
    },
    {
      icon: UserPlus,
      title: "Friends Sign Up",
      description: "They receive 20% off their first purchase"
    },
    {
      icon: Award,
      title: "Earn Rewards",
      description: "Get a free cartridge after 3 referrals"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-1"
    >
      {steps.map((step, index) => (
        <motion.div
          key={index}
          variants={item}
          className={`relative p-4 rounded-lg bg-gradient-to-br ${
            index === 0 ? "from-blue-900/30 to-blue-800/10" :
            index === 1 ? "from-cyan-900/30 to-cyan-800/10" :
            "from-indigo-900/30 to-indigo-800/10"
          }`}
        >
          <div className="absolute top-0 left-0 w-full h-1 overflow-hidden rounded-t-lg">
            <div className={`w-full h-full ${
              index === 0 ? "bg-blue-500/50" :
              index === 1 ? "bg-cyan-500/50" :
              "bg-indigo-500/50"
            }`}></div>
          </div>
          
          <div className="flex flex-col items-center text-center pt-2">
            <div className={`p-2 rounded-full ${
              index === 0 ? "bg-blue-500/20 text-blue-300" :
              index === 1 ? "bg-cyan-500/20 text-cyan-300" :
              "bg-indigo-500/20 text-indigo-300"
            }`}>
              <step.icon className="h-5 w-5" />
            </div>
            <h4 className="mt-2 font-medium text-white">{step.title}</h4>
            <p className="text-xs text-gray-400 mt-1">{step.description}</p>
            
            {index < steps.length - 1 && (
              <div className="hidden sm:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                <Send className="h-4 w-4 text-gray-500" />
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
