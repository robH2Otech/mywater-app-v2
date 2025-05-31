
import { useIsMobile } from "@/hooks/use-mobile";

interface WelcomeMessageProps {
  firstName: string;
  isMobile?: boolean;
}

export const WelcomeMessage = ({ firstName, isMobile: propIsMobile }: WelcomeMessageProps) => {
  const hookIsMobile = useIsMobile();
  const isMobile = propIsMobile !== undefined ? propIsMobile : hookIsMobile;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const displayName = firstName || "User";

  return (
    <div className="flex flex-col">
      <h1 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold text-white truncate`}>
        {isMobile ? `Hi, ${displayName}` : `${getGreeting()}, ${displayName}`}
      </h1>
      {!isMobile && (
        <p className="text-sm text-gray-400">
          Welcome to your dashboard
        </p>
      )}
    </div>
  );
};
