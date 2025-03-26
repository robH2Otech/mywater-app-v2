
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Facebook, Mail, AlertCircle } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleEmailAuth: (e: React.FormEvent) => Promise<void>;
  handleSocialAuth: (provider: 'google' | 'facebook') => Promise<void>;
  isLoading: boolean;
  socialLoading: string | null;
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  handleEmailAuth,
  handleSocialAuth,
  isLoading,
  socialLoading
}: LoginFormProps) {
  const { toast } = useToast();
  
  return (
    <Card className="bg-spotify-darker border-spotify-accent">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <Button 
              type="button"
              className="w-full bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 transition-all"
              onClick={() => handleSocialAuth('google')}
              disabled={!!socialLoading}
            >
              <div className="flex items-center justify-center">
                <FcGoogle className="mr-2 h-5 w-5" />
                <span>{socialLoading === 'google' ? "Signing in..." : "Sign in with Google"}</span>
              </div>
            </Button>
            
            <Button 
              type="button"
              className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-medium py-3 transition-all"
              onClick={() => handleSocialAuth('facebook')}
              disabled={!!socialLoading}
            >
              <Facebook className="mr-2 h-5 w-5" />
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
          
          <form onSubmit={handleEmailAuth} className="space-y-6">
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
              placeholder="your.email@example.com"
            />
            <FormInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              required
              minLength={6}
              placeholder="Your password"
            />

            <Alert className="bg-blue-900/20 border-blue-800 text-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-xs">
                Use any email and password for testing or log in with Google/Facebook
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3"
              disabled={isLoading}
            >
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign In with Email"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
