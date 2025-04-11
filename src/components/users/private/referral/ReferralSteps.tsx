
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Award, ShoppingCart } from "lucide-react";

export function ReferralSteps() {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-medium text-center mb-3">See How Easy It Is</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StepCard 
          number={1}
          icon={Share2}
          title="Invite Your Friends"
          description="Invite your friends to buy MYWATER products. Start by entering your friend's information in the form below and we'll provide your referral code to share."
          iconColor="text-blue-400"
        />
        
        <StepCard 
          number={2}
          icon={ShoppingCart}
          title="Friends Get 20% Off"
          description="Your friends can get 20% off when they buy a MYWATER product using your unique referral code."
          iconColor="text-green-400"
        />
        
        <StepCard 
          number={3}
          icon={Award}
          title="You Earn Points"
          description="Get 50 points for each friend who purchases a MYWATER product – up to 150 points per calendar year."
          iconColor="text-amber-400"
        />
      </div>
    </div>
  );
}

interface StepCardProps {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
  iconColor: string;
}

function StepCard({ number, icon: Icon, title, description, iconColor }: StepCardProps) {
  return (
    <Card className="bg-spotify-dark border-spotify-accent/20">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className="relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${iconColor.replace('text-', 'bg-').replace('400', '500/10')}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-spotify-accent flex items-center justify-center text-xs font-bold">
            {number}
          </span>
        </div>
        
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="text-xs text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
}
