
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
  
  // Get initials
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  const initials = lastInitial ? `${firstInitial}${lastInitial}` : firstInitial;
  
  return (
    <div className="text-white text-2xl font-medium">
      Welcome {initials} back to MYWATER app!
    </div>
  );
};
