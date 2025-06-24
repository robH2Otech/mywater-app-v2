
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertItem } from "./AlertItem";
import { useRecentAlerts } from "@/hooks/dashboard/useRecentAlerts";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";

export const RecentAlerts = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: combinedAlerts = [], isError, isLoading } = useRecentAlerts();

  const handleAlertClick = () => {
    navigate('/alerts');
  };

  console.log(`Rendering Recent Alerts: ${combinedAlerts.length} alerts available`);

  return (
    <Card 
      className="p-6 glass cursor-pointer hover:bg-white/5 transition-colors"
      onClick={handleAlertClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{t("alerts.recent.title")}</h2>
        <Bell className={`h-5 w-5 ${combinedAlerts.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
      </div>
      <div className="space-y-4">
        {isLoading ? (
          <div className="h-24">
            <LoadingSkeleton />
          </div>
        ) : isError ? (
          <div className="text-center py-4">
            <p className="text-red-400">{t("alerts.error.loading")}</p>
          </div>
        ) : combinedAlerts.length > 0 ? (
          <>
            {combinedAlerts.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-400 hover:text-gray-300">
                {t("alerts.click.view.all")}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400">{t("alerts.no.active")}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
