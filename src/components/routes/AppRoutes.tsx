import { Routes, Route } from "react-router-dom";
import { ProtectedRoutes } from "./ProtectedRoutes";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import Units from "@/pages/Units";
import UnitDetails from "@/pages/UnitDetails";
import LocationsPage from "@/pages/LocationsPage";
import UnitLocationPage from "@/pages/UnitLocationPage";
import UVC from "@/pages/UVC";
import Analytics from "@/pages/Analytics";
import Alerts from "@/pages/Alerts";
import Filters from "@/pages/Filters";
import ClientRequests from "@/pages/ClientRequests";
import Users from "@/pages/Users";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import PrivateAuth from "@/pages/PrivateAuth";
import PrivateDashboard from "@/pages/PrivateDashboard";
import NotFound from "@/pages/NotFound";
import MigrationPage from "@/pages/MigrationPage";
import MLDashboard from "@/pages/MLDashboard";

const AppRoutes = () => {
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<NotFound />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/index" element={<Index />} />
        <Route path="/units" element={<Units />} />
        <Route path="/units/:id" element={<UnitDetails />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/locations/:id" element={<UnitLocationPage />} />
        <Route path="/uvc" element={<UVC />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ml-dashboard" element={<MLDashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/filters" element={<Filters />} />
        <Route path="/requests" element={<ClientRequests />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/migration" element={<MigrationPage />} />
      </Route>
      
      {/* Auth routes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/private-auth" element={<PrivateAuth />} />
      
      {/* Private user routes */}
      <Route element={<ProtectedRoutes userTypes={["private"]} />}>
        <Route path="/private-dashboard" element={<PrivateDashboard />} />
      </Route>
      
    </Routes>
  );
};

export default AppRoutes;
