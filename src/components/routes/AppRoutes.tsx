import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, PrivateProtectedRoute } from "./ProtectedRoutes";
import { AuthProvider } from "@/contexts/AuthContext";

// Lazy-loaded components - ensuring proper imports
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
const PrivateAuth = React.lazy(() => import("@/pages/PrivateAuth"));
const PrivateDashboard = React.lazy(() => import("@/pages/PrivateDashboard"));
const LandingPage = React.lazy(() => import("@/pages/LandingPage"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const MigrationPage = React.lazy(() => import("@/pages/MigrationPage"));
const ImpactOverview = React.lazy(() => import("@/pages/ImpactOverview"));

// Import Auth directly instead of lazy loading to avoid module fetch issues
import Auth from "@/pages/Auth";

// Loader component for suspense fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
  </div>
);

export function AppRoutes() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Default route - Changed to landing page */}
          <Route path="/" element={<Navigate to="/landing" />} />
          
          {/* Landing page - publicly accessible */}
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Migration page - publicly accessible */}
          <Route path="/migration" element={<MigrationPage />} />
          
          {/* Authentication - using direct import instead of lazy */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/private-auth" element={<PrivateAuth />} />
          
          {/* Protected business routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/units" element={<ProtectedRoute><Units /></ProtectedRoute>} />
          <Route path="/units/:id" element={<ProtectedRoute><UnitDetails /></ProtectedRoute>} />
          <Route path="/locations" element={<ProtectedRoute><LocationsPage /></ProtectedRoute>} />
          <Route path="/locations/:iccid" element={<ProtectedRoute><UnitLocationPage /></ProtectedRoute>} />
          <Route path="/uvc" element={<ProtectedRoute><UVC /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/impact" element={<ProtectedRoute><ImpactOverview /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/filters" element={<ProtectedRoute><Filters /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/client-requests" element={<ProtectedRoute><ClientRequests /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          
          {/* Private routes */}
          <Route path="/private-dashboard/*" element={<PrivateProtectedRoute><PrivateDashboard /></PrivateProtectedRoute>} />
          
          {/* Other */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
