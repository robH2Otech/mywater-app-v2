
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { Settings } from "@/pages/Settings";
import { NotFound } from "@/pages/NotFound";
import { Units } from "@/pages/Units";
import { UnitDetails } from "@/pages/UnitDetails";
import { Filters } from "@/pages/Filters";
import { UVC } from "@/pages/UVC";
import { Alerts } from "@/pages/Alerts";
import { Analytics } from "@/pages/Analytics";
import { Users } from "@/pages/Users";
import { Auth } from "@/pages/Auth";
import { LandingPage } from "@/pages/LandingPage";
import { PrivateAuth } from "@/pages/PrivateAuth";
import { PrivateDashboard } from "@/pages/PrivateDashboard";
import Index from "@/pages/Index";  // Changed from import { Index } to import Index
import ClientRequests from "@/pages/ClientRequests";
import { ProtectedRoute, PrivateProtectedRoute } from "./ProtectedRoutes";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/private-auth" element={<PrivateAuth />} />
      <Route
        path="/private-dashboard/*"
        element={
          <PrivateProtectedRoute>
            <PrivateDashboard />
          </PrivateProtectedRoute>
        }
      />
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
      <Route 
        path="/client-requests" 
        element={
          <ProtectedRoute>
            <ClientRequests />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
