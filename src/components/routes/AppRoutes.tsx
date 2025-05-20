
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoutes";
import Dashboard from "@/pages/Dashboard";
import Units from "@/pages/Units";
import UnitDetails from "@/pages/UnitDetails";
import UVC from "@/pages/UVC";
import Alerts from "@/pages/Alerts";
import Analytics from "@/pages/Analytics";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import ClientRequests from "@/pages/ClientRequests";
import Filters from "@/pages/Filters";
import LocationsPage from "@/pages/LocationsPage";
import UnitLocationPage from "@/pages/UnitLocationPage";
import MLDashboard from "@/pages/MLDashboard";
import PrivateDashboard from "@/pages/PrivateDashboard";
import { HomePage } from "@/pages/private/HomePage";
import { ProfilePage } from "@/pages/private/ProfilePage";
import { ReferPage } from "@/pages/private/ReferPage";
import { DataCalculatorPage } from "@/pages/private/DataCalculatorPage";
import { InstallationPage } from "@/pages/private/InstallationPage";
import { SupportPage } from "@/pages/private/SupportPage";
import { ShopPage } from "@/pages/private/ShopPage";
import { SettingsPage } from "@/pages/private/SettingsPage";
import MigrationPage from "@/pages/MigrationPage";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth route */}
      <Route path="/auth" element={<Auth />} />
      
      {/* Business routes */}
      <Route path="/dashboard" element={<ProtectedRoute userType="business"><Dashboard /></ProtectedRoute>} />
      <Route path="/units" element={<ProtectedRoute userType="business"><Units /></ProtectedRoute>} />
      <Route path="/units/:id" element={<ProtectedRoute userType="business"><UnitDetails /></ProtectedRoute>} />
      <Route path="/locations" element={<ProtectedRoute userType="business"><LocationsPage /></ProtectedRoute>} />
      <Route path="/locations/:id" element={<ProtectedRoute userType="business"><UnitLocationPage /></ProtectedRoute>} />
      <Route path="/uvc" element={<ProtectedRoute userType="business"><UVC /></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute userType="business"><Alerts /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute userType="business"><Analytics /></ProtectedRoute>} />
      <Route path="/ml-dashboard" element={<ProtectedRoute userType="business"><MLDashboard /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute userType="business"><Users /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute userType="business"><Settings /></ProtectedRoute>} />
      <Route path="/client-requests" element={<ProtectedRoute userType="business"><ClientRequests /></ProtectedRoute>} />
      <Route path="/filters" element={<ProtectedRoute userType="business"><Filters /></ProtectedRoute>} />
      
      {/* Private user routes */}
      <Route path="/private-dashboard" element={<PrivateDashboard />}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="refer" element={<ReferPage />} />
        <Route path="data" element={<DataCalculatorPage />} />
        <Route path="install" element={<InstallationPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Migration page */}
      <Route path="/migration" element={<MigrationPage />} />
      
      {/* Home route redirects to auth */}
      <Route path="/" element={<Auth />} />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
