
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/shared/FormInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider
} from "firebase/auth";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { PrivateUserRegisterForm } from "@/components/users/private/PrivateUserRegisterForm";
import { Facebook, Mail, Globe } from "lucide-react";

export function PrivateAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authMode === "login") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check if user exists in private users collection
        const privateUsersRef = collection(db, "private_users");
        const q = query(privateUsersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          toast({
            title: "Account not found",
            description: "No home user account found with these credentials.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        console.log("Private user signed in:", user);
        navigate("/private-dashboard");
      } else {
        toast({
          title: "Please complete the registration form",
          description: "We need a few more details to set up your account.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMessage = "Authentication failed";
      
      if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address format";
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = "This account has been disabled";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No account with this email exists";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password";
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      const authProvider = provider === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
      
      // Add these lines to make Google auth work with specific domains
      if (provider === 'google') {
        // Remove any domain restrictions that might be causing the issue
        authProvider.setCustomParameters({
          prompt: 'select_account'
        });
      }
      
      const result = await signInWithPopup(auth, authProvider);
      const user = result.user;
      
      // Check if user exists in private_users collection
      const privateUsersRef = collection(db, "private_users");
      const q = query(privateUsersRef, where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Redirect to complete registration with pre-filled email
        setAuthMode("register");
        setEmail(user.email || "");
        toast({
          title: "Additional Information Needed",
          description: "Please complete your profile to continue.",
        });
      } else {
        // User already exists, redirect to dashboard
        navigate("/private-dashboard");
      }
    } catch (error: any) {
      console.error("Social auth error:", error);
      
      let errorMessage = "Authentication Failed";
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for authentication. Please try another sign-in method.";
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in was cancelled. Please try again.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Too many popup requests. Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleLoginTab = () => {
    setAuthMode("login");
  };

  const handleRegisterTab = () => {
    setAuthMode("register");
  };

  return (
    <div className="min-h-screen bg-spotify-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            MYWATER Home User Portal
          </h2>
          <p className="mt-2 text-gray-400">
            {authMode === "login"
              ? "Sign in to manage your water purification system"
              : "Create your account to get started"}
          </p>
        </div>

        <Card className="p-6 bg-spotify-darker border-spotify-accent shadow-lg">
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" onClick={handleLoginTab}>Sign In</TabsTrigger>
              <TabsTrigger value="register" onClick={handleRegisterTab}>Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <Button 
                    type="button"
                    className="w-full bg-[#4285F4] hover:bg-[#4285F4]/90 text-white"
                    onClick={() => handleSocialAuth('google')}
                    disabled={!!socialLoading}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    {socialLoading === 'google' ? "Signing in..." : "Sign in with Google"}
                  </Button>
                  
                  <Button 
                    type="button"
                    className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
                    onClick={() => handleSocialAuth('facebook')}
                    disabled={!!socialLoading}
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    {socialLoading === 'facebook' ? "Signing in..." : "Sign in with Facebook"}
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600"></span>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-spotify-darker px-2 text-gray-400">
                      Or continue with email
                    </span>
                  </div>
                </div>
                
                <form onSubmit={handleAuth} className="space-y-6">
                  <FormInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    required
                  />
                  <FormInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    required
                    minLength={6}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-mywater-blue hover:bg-mywater-blue/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In with Email"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="register">
              <PrivateUserRegisterForm socialEmail={email} />
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-400">
              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <Button variant="link" onClick={handleRegisterTab} className="p-0 h-auto text-mywater-blue">
                    Register here
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Button variant="link" onClick={handleLoginTab} className="p-0 h-auto text-mywater-blue">
                    Sign in
                  </Button>
                </>
              )}
            </p>
          </div>
        </Card>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-gray-300"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
