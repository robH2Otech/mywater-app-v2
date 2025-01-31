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
import { useToast } from "@/components/ui/use-toast";

export const Settings = () => {
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("english");
  const [alertNotifications, setAlertNotifications] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);
  const { toast } = useToast();

  const handleClearCache = () => {
    // Implementation for clearing cache would go here
    toast({
      title: "Cache cleared",
      description: "Application cache has been successfully cleared.",
    });
  };

  const handleExportData = () => {
    // Implementation for exporting data would go here
    toast({
      title: "Data export started",
      description: "Your data export has been initiated.",
    });
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-12">
      {/* Theme Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Theme</h2>
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-[300px] bg-spotify-accent">
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

      {/* Language Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Language</h2>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[300px] bg-spotify-accent">
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

      {/* Notifications Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Alert Notifications</span>
            </div>
            <Switch
              checked={alertNotifications}
              onCheckedChange={setAlertNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>System Updates</span>
            </div>
            <Switch
              checked={systemUpdates}
              onCheckedChange={setSystemUpdates}
            />
          </div>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Data Management</h2>
        <div className="flex space-x-4">
          <Button
            variant="destructive"
            onClick={handleClearCache}
            className="flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear Cache</span>
          </Button>
          <Button
            variant="default"
            onClick={handleExportData}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            <span>Export Data</span>
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">About</h2>
        <div className="space-y-4">
          <p className="text-gray-400">Version: 2.0.0</p>
          <p className="text-gray-300">
            WATER ReUSE App is a comprehensive water management solution designed to help monitor and optimize water usage through advanced analytics and real-time alerts.
          </p>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Disclaimer</h3>
            <p className="text-gray-400">
              This application is provided "as is" without warranty of any kind, either express or implied. Use at your own risk.
            </p>
          </div>
          <p className="text-gray-400">
            © 2025 WATER ReUSE App. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
};