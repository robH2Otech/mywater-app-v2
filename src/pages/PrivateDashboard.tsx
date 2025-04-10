
import { Route, Routes } from "react-router-dom";
import { PrivateLayout } from "@/components/layout/PrivateLayout";
import { HomePage } from "./private/HomePage";
import { ProfilePage } from "./private/ProfilePage";
import { ReferPage } from "./private/ReferPage";
import { ImpactPage } from "./private/ImpactPage";
import { InstallationPage } from "./private/InstallationPage";
import { SupportPage } from "./private/SupportPage";
import { ShopPage } from "./private/ShopPage";
import { SettingsPage } from "./private/SettingsPage";

export function PrivateDashboard() {
  return (
    <PrivateLayout>
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="refer" element={<ReferPage />} />
        <Route path="impact" element={<ImpactPage />} />
        <Route path="install" element={<InstallationPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </PrivateLayout>
  );
}
