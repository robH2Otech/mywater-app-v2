
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { PrivateLayout } from "@/components/layout/PrivateLayout";
import { HomePage } from "./private/HomePage";
import { ProfilePage } from "./private/ProfilePage";
import { ReferPage } from "./private/ReferPage";
import { InstallationPage } from "./private/InstallationPage";
import { SupportPage } from "./private/SupportPage";
import { ShopPage } from "./private/ShopPage";
import { SettingsPage } from "./private/SettingsPage";
import { ImpactPage } from "./private/ImpactPage";

export function PrivateDashboard() {
  const location = useLocation();
  // Add console logging to diagnose the route rendering
  console.log("PrivateDashboard rendering - Current path:", location.pathname);
  
  return (
    <PrivateLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="refer" element={<ReferPage />} />
        <Route path="impact" element={<ImpactPage />} />
        <Route path="install" element={<InstallationPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/private-dashboard" replace />} />
      </Routes>
    </PrivateLayout>
  );
}
