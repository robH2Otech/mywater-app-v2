
import { useLanguage } from "@/contexts/LanguageContext";

interface WelcomeMessageProps {
  firstName?: string;
  lastName?: string;
}

export const WelcomeMessage = ({ firstName, lastName }: WelcomeMessageProps) => {
  const { t } = useLanguage();
  
  // If no firstName is provided, return a default message
  if (!firstName) {
    return (
      <div className="text-white text-2xl font-medium">
        {t("dashboard.welcome")}
      </div>
    );
  }
  
  // Format the name: use first name only
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  
  return (
    <div className="text-white text-2xl font-medium">
      Hey {displayName}, welcome back to MYWATER portal!
    </div>
  );
};
