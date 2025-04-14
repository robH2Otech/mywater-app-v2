
import { Route, Routes, Navigate } from "react-router-dom";
import { PrivateLayout } from "@/components/layout/PrivateLayout";
import { ProfilePage } from "./private/ProfilePage";
import { ReferPage } from "./private/ReferPage";
import { InstallationPage } from "./private/InstallationPage";
import { SupportPage } from "./private/SupportPage";
import { ShopPage } from "./private/ShopPage";
import { SettingsPage } from "./private/SettingsPage";
import { ImpactPage } from "./private/ImpactPage";

// Temporary home page component to test Impact page navigation
const TemporaryHomePage = () => (
  <div className="text-center my-8">
    <h2 className="text-2xl font-bold">Home Page (temporarily hidden for testing)</h2>
    <p className="text-gray-400 mt-2">
      This page is temporarily hidden to test the Impact page functionality.
      <br />
      Please click on the Impact tab in the sidebar.
    </p>
  </div>
);

export function PrivateDashboard() {
  return (
    <PrivateLayout>
      <Routes>
        {/* Temporarily replace HomePage with TemporaryHomePage for testing */}
        <Route index element={<TemporaryHomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="refer" element={<ReferPage />} />
        <Route path="impact" element={<ImpactPage />} />
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
