
import { Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Units } from "@/pages/Units";
import { UnitDetails } from "@/pages/UnitDetails";
import { Filters } from "@/pages/Filters";
import { UVC } from "@/pages/UVC";
import { Alerts } from "@/pages/Alerts";
import { Analytics } from "@/pages/Analytics";
import { Users } from "@/pages/Users";
import { Settings } from "@/pages/Settings";
import { ProtectedRoute } from "./ProtectedRoutes";

export function AdminRoutes() {
  return (
    <>
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
    </>
  );
}
