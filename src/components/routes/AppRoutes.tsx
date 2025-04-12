
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PrivateDashboard } from "@/pages/PrivateDashboard";
import { PrivateAuth } from "@/pages/PrivateAuth";
import { LandingPage } from "@/pages/LandingPage";
import { Auth } from "@/pages/Auth";
import Index from "@/pages/Index";
import { ProtectedRoute, PrivateProtectedRoute } from "./ProtectedRoutes";
import { AdminRoutes } from "./AdminRoutes";
import ClientRequests from "@/pages/ClientRequests";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/private-auth" element={<PrivateAuth />} />
      
      {/* Private User Routes */}
      <Route
        path="/private-dashboard/*"
        element={
          <PrivateProtectedRoute>
            <PrivateDashboard />
          </PrivateProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Index />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Additional Admin Routes - Use fragment to include all routes from AdminRoutes */}
      <>
        <AdminRoutes />
      </>
      
      {/* Client Requests Route */}
      <Route 
        path="/client-requests" 
        element={
          <ProtectedRoute>
            <ClientRequests />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch-all route for any undefined routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
