
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReferralCodeProps {
  referralCode: string;
}

export function ReferralCode({ referralCode }: ReferralCodeProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  const copyReferralLink = () => {
    const referralLink = `https://mywater.com/refer?code=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    
    setTimeout(() => setIsCopied(false), 3000);
  };
  
  return (
    <div className="flex items-center gap-2 mb-6 p-3 bg-spotify-dark rounded-lg">
      <div className="flex-1">
        <p className="text-sm text-gray-400">Your Referral Code</p>
        <p className="text-lg font-mono font-bold">{referralCode}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={copyReferralLink}
        className="gap-2"
      >
        {isCopied ? (
          <>
            <CheckCheck className="h-4 w-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy Link
          </>
        )}
      </Button>
    </div>
  );
}
