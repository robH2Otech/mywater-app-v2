
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { loginWithEmail, getAuthErrorMessage } from "@/utils/firebase/auth";
import { AuthService } from "@/services/authService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface BusinessAuthFormProps {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
}

export function BusinessAuthForm({ isLogin, setIsLogin }: BusinessAuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authStep, setAuthStep] = useState<string>("idle");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthStep("authenticating");

    try {
      console.log("🔐 Starting business authentication for:", email);
      
      // Step 1: Authenticate with Firebase
      const userCredential = await loginWithEmail(email, password);
      console.log("✅ Firebase authentication successful");
      setAuthStep("verifying_claims");

      // Step 2: Handle claims initialization
      const authResult = await AuthService.handlePostAuth();
      
      if (!authResult.success) {
        console.log("❌ Claims verification failed");
        setAuthStep("claims_failed");
        
        if (authResult.needsClaimsInitialization) {
          toast({
            title: "Account Setup Required",
            description: "Your account needs to be set up by an administrator. Please contact support.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Authentication Error",
            description: "Unable to verify your account permissions. Please try again or contact support.",
            variant: "destructive",
          });
        }
        return;
      }

      // Step 3: Success - navigate to dashboard
      console.log("✅ Authentication successful with role:", authResult.claims.role);
      setAuthStep("success");
      
      toast({
        title: "Welcome back!",
        description: `Signed in as ${authResult.claims.role}`,
      });

      navigate("/dashboard");

    } catch (error: any) {
      console.error("❌ Authentication error:", error);
      setAuthStep("failed");
      
      const errorMessage = getAuthErrorMessage(error);
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setAuthStep("idle"), 3000);
    }
  };

  const getStepMessage = () => {
    switch (authStep) {
      case "authenticating":
        return "Authenticating with Firebase...";
      case "verifying_claims":
        return "Verifying permissions...";
      case "claims_failed":
        return "Permission verification failed";
      case "success":
        return "Authentication successful!";
      case "failed":
        return "Authentication failed";
      default:
        return "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          placeholder="admin@company.com"
          disabled={isLoading}
        />
        
        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          required
          minLength={6}
          placeholder="Your password"
          disabled={isLoading}
        />
      </div>

      {authStep !== "idle" && (
        <Alert className={`${
          authStep === "success" ? "bg-green-900/20 border-green-800" :
          authStep === "claims_failed" || authStep === "failed" ? "bg-red-900/20 border-red-800" :
          "bg-blue-900/20 border-blue-800"
        }`}>
          <div className="flex items-center">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {!isLoading && (authStep === "claims_failed" || authStep === "failed") && (
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            <AlertDescription className="text-sm">
              {getStepMessage()}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing In...
          </div>
        ) : (
          "Sign In"
        )}
      </Button>

      <Alert className="bg-blue-900/20 border-blue-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Business accounts require administrator approval. Contact your system administrator if you need access.
        </AlertDescription>
      </Alert>
    </form>
  );
}
