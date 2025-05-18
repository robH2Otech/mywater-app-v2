
import { Route, Routes, Navigate } from "react-router-dom";
import { PrivateLayout } from "@/components/layout/PrivateLayout";
import { HomePage } from "./private/HomePage";
import { ProfilePage } from "./private/ProfilePage";
import { ReferPage } from "./private/ReferPage";
import { InstallationPage } from "./private/InstallationPage";
import { SupportPage } from "./private/SupportPage";
import { ShopPage } from "./private/ShopPage";
import { SettingsPage } from "./private/SettingsPage";
import { DataCalculatorPage } from "./private/DataCalculatorPage";
import { NotFound } from "@/components/ui/notfound";

const PrivateDashboard = () => {
  return (
    <PrivateLayout>
      <div className="relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-mywater-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-mywater-secondary/5 rounded-full blur-3xl" />
        </div>
        
        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/refer" element={<ReferPage />} />
          <Route path="/data" element={<DataCalculatorPage />} />
          <Route path="/install" element={<InstallationPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/private-dashboard" replace />} />
        </Routes>
      </div>
    </PrivateLayout>
  );
};

export default PrivateDashboard;
