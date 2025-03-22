
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/shared/FormInput";
import { Facebook, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      
      <form onSubmit={handleEmailAuth} className="space-y-6">
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
  );
}
