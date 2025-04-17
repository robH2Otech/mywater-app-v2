
import React from "react";
import { Check, Share, ShoppingCart, Gift } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: Share,
      title: "Share Your Link",
      description: "Send your unique referral code or link to friends and family."
    },
    {
      icon: ShoppingCart,
      title: "Friend Makes a Purchase",
      description: "Your friend clicks your link and adds MYWATER products to their cart."
    },
    {
      icon: Check,
      title: "Discount Applied at Checkout",
      description: "Friend enters your code in the 'Discount Code' field to get 20% off."
    },
    {
      icon: Gift,
      title: "Automatic Tracking",
      description: "Once they complete their purchase, our system automatically updates your progress."
    }
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-blue-200 mb-3">
        Follow these simple steps to earn your free €150 replacement cartridge:
      </p>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-3 items-start">
            <div className="w-6 h-6 rounded-full bg-blue-800/50 flex-shrink-0 flex items-center justify-center mt-0.5">
              <step.icon className="h-3.5 w-3.5 text-blue-300" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-white">{step.title}</h4>
              <p className="text-xs text-blue-300 mt-0.5">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-blue-200 mt-2 border-t border-blue-800/30 pt-2">
        Each successful referral brings you closer to your free cartridge and higher rank status!
      </p>
    </div>
  );
}
