
import { Check, Share2, Gift, Users } from "lucide-react";
import { motion } from "framer-motion";

export function ReferralSteps() {
  const steps = [
    {
      icon: Share2,
      title: "Share Your Code",
      description: "Send your unique referral code to friends via email, SMS, or social media."
    },
    {
      icon: Users,
      title: "Friends Purchase",
      description: "Your friends use your code to get 20% off their MYWATER purchase."
    },
    {
      icon: Gift,
      title: "Earn Rewards",
      description: "After 3 successful referrals, claim your free replacement cartridge worth €150!"
    }
  ];

  return (
    <div className="p-5 bg-blue-950/20 rounded-lg border border-blue-700/20">
      <h3 className="text-lg font-semibold text-blue-200 mb-4">How It Works</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <StepCard
            key={index}
            icon={step.icon}
            title={step.title}
            description={step.description}
            stepNumber={index + 1}
          />
        ))}
      </div>
    </div>
  );
}

interface StepCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  stepNumber: number;
}

function StepCard({ icon: Icon, title, description, stepNumber }: StepCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * stepNumber }}
      className="p-4 bg-blue-900/10 border border-blue-700/30 rounded-md relative"
    >
      <div className="absolute -top-3 -left-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
        {stepNumber}
      </div>
      
      <div className="flex flex-col items-center text-center space-y-3 pt-2">
        <div className="p-3 bg-blue-800/30 rounded-full">
          <Icon className="h-6 w-6 text-blue-300" />
        </div>
        
        <div>
          <h4 className="text-blue-200 font-medium">{title}</h4>
          <p className="text-blue-100/70 text-sm mt-1">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
