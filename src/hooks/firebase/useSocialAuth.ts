
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  loginWithGoogle, 
  loginWithFacebook, 
  handleSocialUserData,
  getAuthErrorMessage 
} from "@/utils/firebase/auth";

/**
 * Hook to handle social authentication methods
 */
export function useSocialAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      console.log(`Attempting ${provider} authentication`);
      
      let result;
      
      if (provider === 'google') {
        result = await loginWithGoogle();
      } else {
        result = await loginWithFacebook();
      }
      
      console.log(`${provider} authentication successful`, result);
      
      // Get user info from credential
      const user = result.user;
      await handleSocialUserData(user, provider);
      
      // Navigate to the dashboard after successful sign-in or registration
      navigate("/private-dashboard");
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
      // Enhanced error message for OAuth issues
      let errorMessage = getAuthErrorMessage(error);
      
      // Add special handling for OAuth domain issues
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `Your domain isn't authorized for ${provider} login. Please ensure you're accessing from an authorized domain or contact support.`;
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSocialLoading(null);
    }
  };
  
  return {
    socialLoading,
    handleSocialAuth
  };
}
