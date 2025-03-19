import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = 'mywater-blue' | 'spotify-green' | 'dark-blue';

interface ThemeContextType {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Default to MYWATER blue
  const [themeColor, setThemeColorState] = useState<ThemeColor>('mywater-blue');

  useEffect(() => {
    // Load saved theme from localStorage on initial load
    const savedTheme = localStorage.getItem('theme-color') as ThemeColor;
    if (savedTheme) {
      setThemeColorState(savedTheme);
      applyThemeColor(savedTheme);
    } else {
      // Default to MYWATER blue
      applyThemeColor('mywater-blue');
    }
  }, []);

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    localStorage.setItem('theme-color', color);
    applyThemeColor(color);
  };

  const applyThemeColor = (color: ThemeColor) => {
    const root = document.documentElement;
    // Reset all colors
    
    switch (color) {
      case 'mywater-blue':
        root.style.setProperty('--primary', '192 65% 51%'); // #39afcd
        root.style.setProperty('--ring', '192 65% 51%');
        break;
      case 'spotify-green':
        root.style.setProperty('--primary', '142 72% 42%'); // #1DB954
        root.style.setProperty('--ring', '142 72% 42%');
        break;
      case 'dark-blue':
        root.style.setProperty('--primary', '219 57% 40%'); // #2c53A0
        root.style.setProperty('--ring', '219 57% 40%');
        break;
    }
  };

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
