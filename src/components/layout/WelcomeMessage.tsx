
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";

interface WelcomeMessageProps {
  firstName: string;
  isMobile?: boolean;
}

export const WelcomeMessage = ({ firstName, isMobile: propIsMobile }: WelcomeMessageProps) => {
  const hookIsMobile = useIsMobile();
  const isMobile = propIsMobile !== undefined ? propIsMobile : hookIsMobile;
  const { t } = useLanguage();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("greeting.good.morning");
    if (hour < 18) return t("greeting.good.afternoon");
    return t("greeting.good.evening");
  };

  const displayName = firstName || "User";

  return (
    <div className="flex flex-col">
      <h1 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold text-white truncate`}>
        {isMobile ? `Hi, ${displayName}` : `${getGreeting()}, ${displayName}`}
      </h1>
      {!isMobile && (
        <p className="text-sm text-gray-400">
          {t("greeting.welcome.back")}
        </p>
      )}
    </div>
  );
};
