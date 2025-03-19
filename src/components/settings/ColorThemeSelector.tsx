
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ColorThemeSelectorProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export const ColorThemeSelector = ({ theme, setTheme }: ColorThemeSelectorProps) => {
  const { toast } = useToast();

  const handleThemeChange = (value: string) => {
    setTheme(value);
    
    // Add CSS variables to the document root for dynamic theming
    const root = document.documentElement;
    
    switch (value) {
      case 'mywater-blue':
        root.style.setProperty('--app-theme-color', '#39afcd');
        break;
      case 'spotify-green':
        root.style.setProperty('--app-theme-color', '#1DB954');
        break;
      case 'st-tropaz-blue':
        root.style.setProperty('--app-theme-color', '#2c53A0');
        break;
      default:
        root.style.setProperty('--app-theme-color', '#39afcd');
    }
    
    toast({
      title: "Theme Updated",
      description: "Your color theme has been updated successfully.",
    });
  };

  return (
    <Select value={theme} onValueChange={handleThemeChange}>
      <SelectTrigger className="w-[240px] bg-spotify-accent text-sm">
        <Palette className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select Theme Color" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="mywater-blue">MYWATER Blue (#39afcd)</SelectItem>
        <SelectItem value="spotify-green">Spotify Green (#1DB954)</SelectItem>
        <SelectItem value="st-tropaz-blue">St Tropaz Blue (#2c53A0)</SelectItem>
      </SelectContent>
    </Select>
  );
};
