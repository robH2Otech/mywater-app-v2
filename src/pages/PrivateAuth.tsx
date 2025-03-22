
import { useState, useEffect } from "react";
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
  FacebookAuthProvider,
  onAuthStateChanged
} from "firebase/auth";
import { collection, addDoc, getDocs, query, where, doc, getDoc } from "firebase/firestore";
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

  // Check if user is already authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/private-dashboard");
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authMode === "login") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Check if user exists in private users collection
        await verifyPrivateUser(user.uid);
        
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
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPrivateUser = async (uid: string) => {
    // Check if user exists in app_users_privat collection
    const privateUsersRef = collection(db, "app_users_privat");
    const q = query(privateUsersRef, where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Check old collection as fallback
      const oldPrivateUsersRef = collection(db, "private_users");
      const oldQuery = query(oldPrivateUsersRef, where("uid", "==", uid));
      const oldSnapshot = await getDocs(oldQuery);
      
      if (oldSnapshot.empty) {
        throw new Error("No home user account found with these credentials.");
      } else {
        // Migrate to new collection
        const userData = oldSnapshot.docs[0].data();
        await addDoc(collection(db, "app_users_privat"), {
          ...userData,
          migrated_at: new Date().toISOString()
        });
      }
    }
  };

  const handleAuthError = (error: any) => {
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
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      errorMessage = "An account already exists with the same email but different sign-in credentials.";
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = "The sign-in popup was closed before completing authentication.";
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = "The sign-in popup was blocked by your browser.";
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "The sign-in popup was closed before completing authentication.";
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = "This domain is not authorized for OAuth operations. Please contact support.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      const authProvider = provider === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
      
      // Configure provider for better compatibility
      if (provider === 'google') {
        const googleProvider = authProvider as GoogleAuthProvider;
        googleProvider.setCustomParameters({
          prompt: 'select_account',
          login_hint: email || undefined
        });
      } else {
        const facebookProvider = authProvider as FacebookAuthProvider;
        facebookProvider.setCustomParameters({
          display: 'popup'
        });
      }
      
      const result = await signInWithPopup(auth, authProvider);
      
      // Get user info from credential
      const user = result.user;
      await handleSocialUserData(user, provider);
      
      // Navigate to the dashboard after successful sign-in or registration
      navigate("/private-dashboard");
    } catch (error: any) {
      console.error("Social auth error:", error);
      handleAuthError(error);
    } finally {
      setSocialLoading(null);
    }
  };
  
  const handleSocialUserData = async (user: any, provider: string) => {
    // First check if user already exists in app_users_privat collection
    const privateUsersRef = collection(db, "app_users_privat");
    const q = query(privateUsersRef, where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // Check the old collection as fallback
      const oldPrivateUsersRef = collection(db, "private_users");
      const oldQuery = query(oldPrivateUsersRef, where("uid", "==", user.uid));
      const oldSnapshot = await getDocs(oldQuery);
      
      if (!oldSnapshot.empty) {
        // Migrate from old collection
        const userData = oldSnapshot.docs[0].data();
        await addDoc(collection(db, "app_users_privat"), {
          ...userData,
          migrated_at: new Date().toISOString()
        });
      } else {
        // Create a new user in app_users_privat collection
        // Extract user info from social login
        const name = user.displayName || '';
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        await addDoc(collection(db, "app_users_privat"), {
          uid: user.uid,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
          auth_provider: provider
        });
        
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
        });
      }
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
