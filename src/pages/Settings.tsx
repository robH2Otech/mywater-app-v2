
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

export const Settings = () => {
  const { toast } = useToast();
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("english");
  const [alertNotifications, setAlertNotifications] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);

  const handleClearCache = () => {
    toast({
      title: "Cache cleared",
      description: "Application cache has been successfully cleared.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data export started",
      description: "Your data export has been initiated.",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Theme Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-white">Theme</h2>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-[240px] bg-spotify-accent text-sm">
            <Sun className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <Separator className="bg-spotify-accent" />

      {/* Language Section */}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-white">Language</h2>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[240px] bg-spotify-accent text-sm">
            <Globe className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="spanish">Spanish</SelectItem>
            <SelectItem value="french">French</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <Separator className="bg-spotify-accent" />

      {/* Notifications Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white">Notifications</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Alert Notifications</span>
            </div>
            <Switch
              checked={alertNotifications}
              onCheckedChange={setAlertNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">System Updates</span>
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
        <h2 className="text-lg font-medium text-white">Data Management</h2>
        <div className="flex space-x-3">
          <Button
            variant="destructive"
            onClick={handleClearCache}
            className="text-sm h-9"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
          <Button
            variant="default"
            onClick={handleExportData}
            className="text-sm h-9 bg-spotify-green hover:bg-spotify-green/90"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </section>

      <Separator className="bg-spotify-accent" />

      {/* About Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium text-white">About</h2>
        <div className="space-y-3">
          <p className="text-sm text-gray-400">Version: 2.0.0</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            WATER ReUSE App is a comprehensive water management solution designed to help monitor and optimize water usage through advanced analytics and real-time alerts.
          </p>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">Disclaimer</h3>
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
