
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function TempAccessButton() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleTempAccess = () => {
    localStorage.setItem('tempAccess', 'true');
    toast({
      title: "Temporary Access Granted",
      description: "You now have temporary access to the app.",
    });
    navigate("/dashboard");
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleTempAccess}
      className="w-full mt-4 border-spotify-accent text-white hover:bg-spotify-accent/30"
    >
      Temporary Access (Bypass Login)
    </Button>
  );
}
