
import { useLanguage } from "@/contexts/LanguageContext";

interface WelcomeMessageProps {
  firstName: string;
}

export const WelcomeMessage = ({ firstName }: WelcomeMessageProps) => {
  const { t } = useLanguage();
  
  // If no firstName is provided, return a default message
  if (!firstName) {
    return (
      <div className="text-white text-lg">
        {t("dashboard.welcome")}
      </div>
    );
  }
  
  // Capitalize first letter of the name
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  
  return (
    <div className="text-white text-lg">
      {t("dashboard.welcome.user", { name: capitalizedName })}
    </div>
  );
};
