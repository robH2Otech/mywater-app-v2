
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PrivateDashboard } from "@/pages/PrivateDashboard";
import { PrivateAuth } from "@/pages/PrivateAuth";
import { LandingPage } from "@/pages/LandingPage";
import { Auth } from "@/pages/Auth";
import Index from "@/pages/Index";
import { ProtectedRoute, PrivateProtectedRoute } from "./ProtectedRoutes";
import ClientRequests from "@/pages/ClientRequests";
import { Units } from "@/pages/Units";
import { UnitDetails } from "@/pages/UnitDetails";
import { Filters } from "@/pages/Filters";
import { UVC } from "@/pages/UVC";
import { Alerts } from "@/pages/Alerts";
import { Analytics } from "@/pages/Analytics";
import { Users } from "@/pages/Users";
import { Settings } from "@/pages/Settings";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/private-auth" element={<PrivateAuth />} />
      
      {/* Private User Routes - Important: The wildcard * is needed to catch all nested routes */}
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
      
      {/* Include all admin routes directly */}
      <Route
        path="/units"
        element={
          <ProtectedRoute>
            <Layout>
              <Units />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/units/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <UnitDetails />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/filters"
        element={
          <ProtectedRoute>
            <Layout>
              <Filters />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/uvc"
        element={
          <ProtectedRoute>
            <Layout>
              <UVC />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/alerts"
        element={
          <ProtectedRoute>
            <Layout>
              <Alerts />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      
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
