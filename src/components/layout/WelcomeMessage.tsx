
import { useAuth } from "@/contexts/AuthContext";

interface WelcomeMessageProps {
  firstName?: string;
}

export function WelcomeMessage({ firstName }: WelcomeMessageProps) {
  const { getUserFirstName } = useAuth();
  
  // Use the provided firstName prop or get it from auth context
  const displayName = firstName || getUserFirstName();
  
  return (
    <h1 className="text-2xl font-bold mb-6">
      Hey {displayName}, welcome back to X-WATER app!
    </h1>
  );
}
