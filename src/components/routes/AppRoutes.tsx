import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoutes";

// Lazy-loaded components
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const Units = React.lazy(() => import("@/pages/Units"));
const UnitDetails = React.lazy(() => import("@/pages/UnitDetails"));
const LocationsPage = React.lazy(() => import("@/pages/LocationsPage"));
const UnitLocationPage = React.lazy(() => import("@/pages/UnitLocationPage"));
const UVC = React.lazy(() => import("@/pages/UVC"));
const Analytics = React.lazy(() => import("@/pages/Analytics"));
const Alerts = React.lazy(() => import("@/pages/Alerts"));
const Filters = React.lazy(() => import("@/pages/Filters"));
const Users = React.lazy(() => import("@/pages/Users"));
const ClientRequests = React.lazy(() => import("@/pages/ClientRequests"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const Auth = React.lazy(() => import("@/pages/Auth"));
const PrivateAuth = React.lazy(() => import("@/pages/PrivateAuth"));
const PrivateDashboard = React.lazy(() => import("@/pages/PrivateDashboard"));
const LandingPage = React.lazy(() => import("@/pages/LandingPage"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const MigrationPage = React.lazy(() => import("@/pages/MigrationPage"));

// Loader component for suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
  </div>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        
        {/* Migration page - publicly accessible */}
        <Route path="/migration" element={<MigrationPage />} />
        
        {/* Protected business routes */}
        <Route element={<ProtectedRoute children={null} />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Units */}
          <Route path="/units" element={<Units />} />
          <Route path="/units/:unitId" element={<UnitDetails />} />
          
          {/* Locations */}
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/units/:unitId/location" element={<UnitLocationPage />} />
          
          {/* UVC */}
          <Route path="/uvc" element={<UVC />} />
          
          {/* Analytics */}
          <Route path="/analytics" element={<Analytics />} />
          
          {/* Alerts */}
          <Route path="/alerts" element={<Alerts />} />
          
          {/* Filters */}
          <Route path="/filters" element={<Filters />} />
          
          {/* Users */}
          <Route path="/users" element={<Users />} />
          
          {/* Client requests */}
          <Route path="/requests" element={<ClientRequests />} />
          
          {/* Settings */}
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* Authentication */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Private */}
        <Route path="/private-auth" element={<PrivateAuth />} />
        <Route path="/private-dashboard" element={<PrivateDashboard />} />
        
        {/* Other */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
