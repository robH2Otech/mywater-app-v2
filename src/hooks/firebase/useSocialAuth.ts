
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  loginWithGoogle, 
  loginWithFacebook, 
  handleSocialUserData,
  getAuthErrorMessage 
} from "@/utils/firebase/auth";
import { currentDomain } from "@/integrations/firebase/client";

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
      console.log(`Attempting ${provider} authentication on domain: ${currentDomain}`);
      
      let result;
      
      if (provider === 'google') {
        result = await loginWithGoogle();
      } else {
        result = await loginWithFacebook();
      }
      
      console.log(`${provider} authentication successful`, result);
      
      // Get user info from credential
      const user = result.user;
      
      if (!user) {
        throw new Error("Authentication successful but no user returned");
      }
      
      // Process the social user data
      await handleSocialUserData(user, provider);
      
      // Check if user needs to complete profile
      const needsProfileCompletion = result.additionalUserInfo?.isNewUser || false;
      
      if (needsProfileCompletion) {
        // Stay on the register tab to complete profile
        console.log("New user needs to complete profile");
        toast({
          title: "Almost there!",
          description: "Please complete your profile to finish registration",
        });
      } else {
        // Navigate to the dashboard after successful sign-in
        navigate("/private-dashboard");
      }
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
      
      // Enhanced error message for OAuth issues
      let errorMessage = getAuthErrorMessage(error);
      
      // Add special handling for OAuth domain issues
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `Your domain (${currentDomain}) isn't authorized for ${provider} login. Please ensure this domain is added to Firebase Auth settings.`;
        console.error(`Unauthorized domain: ${currentDomain}. You need to add this domain to Firebase Auth settings.`);
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
