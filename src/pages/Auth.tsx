
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { useToast } from "@/hooks/use-toast";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

export function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log("User signed in:", user);
        navigate("/");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create a user profile document in Firestore
        await addDoc(collection(db, "app_users"), {
          id: user.uid,
          email: user.email,
          first_name: "",
          last_name: "",
          role: "user",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        toast({
          title: "Success",
          description: "Account created successfully. You may now sign in.",
        });
        
        // Switch to login view
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMessage = "Authentication failed";
      
      // Handle common Firebase auth errors
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

  const handleTempAccess = () => {
    // Store a flag in local storage to indicate temporary access
    localStorage.setItem('tempAccess', 'true');
    toast({
      title: "Temporary Access Granted",
      description: "You now have temporary access to the app.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-spotify-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-spotify-darker p-8 rounded-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
          <p className="mt-2 text-gray-400">
            {isLogin
              ? "Please sign in to continue"
              : "Please sign up to get started"}
          </p>
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
            {isLoading
              ? "Loading..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-mywater-blue hover:underline"
          >
            {isLogin
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
          
          <div className="pt-2 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleTempAccess}
              className="w-full mt-4 border-spotify-accent text-white hover:bg-spotify-accent/30"
            >
              Temporary Access (Bypass Login)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
