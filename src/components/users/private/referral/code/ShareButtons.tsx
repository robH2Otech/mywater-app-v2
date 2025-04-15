
import { useState } from "react";
import { Copy, CheckCheck, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  referralCode: string;
  onShare: () => Promise<void>;
  onCopy: () => void;
  isCopied: boolean;
}

export function ShareButtons({ referralCode, onShare, onCopy, isCopied }: ShareButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={onCopy}
        variant="outline"
        className="w-full flex-1 border-blue-500/50 hover:bg-blue-700/30"
      >
        {isCopied ? (
          <>
            <CheckCheck className="text-green-400" />
            <span className="ml-2 text-green-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="text-blue-300" />
            <span className="ml-2">Copy Link</span>
          </>
        )}
      </Button>
      
      <Button
        onClick={onShare}
        className="w-full flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
      >
        <Share2 className="mr-2" />
        Share Your Invite
      </Button>
    </div>
  );
}
