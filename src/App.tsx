import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout/Layout";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Units from "./pages/Units";
import UnitDetails from "./pages/UnitDetails";
import UVC from "./pages/UVC";
import Filters from "./pages/Filters";
import Users from "./pages/Users";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/dashboard"
                element={
                  <Layout>
                    <Dashboard />
                  </Layout>
                }
              />
              <Route
                path="/units"
                element={
                  <Layout>
                    <Units />
                  </Layout>
                }
              />
              <Route
                path="/units/:id"
                element={
                  <Layout>
                    <UnitDetails />
                  </Layout>
                }
              />
              <Route
                path="/uvc"
                element={
                  <Layout>
                    <UVC />
                  </Layout>
                }
              />
              <Route
                path="/filters"
                element={
                  <Layout>
                    <Filters />
                  </Layout>
                }
              />
              <Route
                path="/users"
                element={
                  <Layout>
                    <Users />
                  </Layout>
                }
              />
              <Route
                path="/alerts"
                element={
                  <Layout>
                    <Alerts />
                  </Layout>
                }
              />
              <Route
                path="/analytics"
                element={
                  <Layout>
                    <Analytics />
                  </Layout>
                }
              />
              <Route
                path="/settings"
                element={
                  <Layout>
                    <Settings />
                  </Layout>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
