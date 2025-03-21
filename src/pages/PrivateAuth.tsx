
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormInput } from "@/components/shared/FormInput";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { PrivateUserRegisterForm } from "@/components/users/private/PrivateUserRegisterForm";

export function PrivateAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
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
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <PrivateUserRegisterForm />
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
