
import { Route, Routes, Navigate } from "react-router-dom";
import { PrivateLayout } from "@/components/layout/PrivateLayout";
import { HomePage } from "./private/HomePage";
import { ProfilePage } from "./private/ProfilePage";
import { ReferPage } from "./private/ReferPage";
import { InstallationPage } from "./private/InstallationPage";
import { SupportPage } from "./private/SupportPage";
import { ShopPage } from "./private/ShopPage";
import { SettingsPage } from "./private/SettingsPage";
import { ImpactPage } from "./private/ImpactPage";
import { CalculatorPage } from "./private/CalculatorPage";

export function PrivateDashboard() {
  return (
    <PrivateLayout>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="refer" element={<ReferPage />} />
        <Route path="impact" element={<ImpactPage />} />
        <Route path="calculator" element={<CalculatorPage />} />
        <Route path="install" element={<InstallationPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Catch any unmatched routes inside private-dashboard and redirect to home */}
        <Route path="*" element={<Navigate to="/private-dashboard" replace />} />
      </Routes>
    </PrivateLayout>
  );
}
