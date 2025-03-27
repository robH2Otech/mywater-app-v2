
import { useState, useEffect } from "react";

// Define a custom hook for sidebar state management
export const useSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Initialize from localStorage if available
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setCollapsed(savedState === "true");
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return { collapsed, setCollapsed };
};
