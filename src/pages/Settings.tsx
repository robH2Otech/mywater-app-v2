
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Sun,
  Globe,
  Bell,
  Trash2,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

export const Settings = () => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState("system");
  const [alertNotifications, setAlertNotifications] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);

  const handleClearCache = () => {
    toast({
      title: t("toast.success"),
      description: t("toast.cache.cleared"),
    });
  };

  const handleExportData = () => {
    toast({
      title: t("toast.success"),
      description: t("toast.export.started"),
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Theme Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-white">{t("settings.theme")}</h2>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-[240px] bg-spotify-accent text-sm">
            <Sun className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t("settings.theme")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">{t("system")}</SelectItem>
            <SelectItem value="light">{t("light")}</SelectItem>
            <SelectItem value="dark">{t("dark")}</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <Separator className="bg-spotify-accent" />

      {/* Language Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-white">{t("settings.language")}</h2>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[240px] bg-spotify-accent text-sm">
            <Globe className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t("settings.language")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t("english")}</SelectItem>
            <SelectItem value="fr">{t("french")}</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <Separator className="bg-spotify-accent" />

      {/* Notifications Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white">{t("settings.notifications")}</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">{t("alerts.title")}</span>
            </div>
            <Switch
              checked={alertNotifications}
              onCheckedChange={setAlertNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">{t("toast.update.success")}</span>
            </div>
            <Switch
              checked={systemUpdates}
              onCheckedChange={setSystemUpdates}
            />
          </div>
        </div>
      </section>

      <Separator className="bg-spotify-accent" />

      {/* Data Management Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white">{t("settings.data")}</h2>
        <div className="flex space-x-3">
          <Button
            variant="destructive"
            onClick={handleClearCache}
            className="text-sm h-9"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("button.clear.cache")}
          </Button>
          <Button
            variant="default"
            onClick={handleExportData}
            className="text-sm h-9 bg-spotify-green hover:bg-spotify-green/90"
          >
            <Download className="h-4 w-4 mr-2" />
            {t("button.export.data")}
          </Button>
        </div>
      </section>

      <Separator className="bg-spotify-accent" />

      {/* About Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white">{t("settings.about")}</h2>
        <div className="space-y-3">
          <p className="text-sm text-gray-400">Version: 2.0.0</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            WATER ReUSE App is a comprehensive water management solution designed to help monitor and optimize water usage through advanced analytics and real-time alerts.
          </p>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">{t("settings.disclaimer")}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              This application is provided "as is" without warranty of any kind, either express or implied. Use at your own risk.
            </p>
          </div>
          <p className="text-sm text-gray-400">
            © 2025 MYWATER Technologies app. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
};
