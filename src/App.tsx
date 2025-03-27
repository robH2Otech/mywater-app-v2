import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";
import { Units } from "./pages/Units";
import { UnitDetails } from "./pages/UnitDetails";
import { Filters } from "./pages/Filters";
import { UVC } from "./pages/UVC";
import { Alerts } from "./pages/Alerts";
import { Analytics } from "./pages/Analytics";
import { Users } from "./pages/Users";
import { Auth } from "./pages/Auth";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { auth } from "./integrations/firebase/client";
import { LanguageProvider } from "./contexts/LanguageContext";
import { LandingPage } from "./pages/LandingPage";
import { PrivateAuth } from "./pages/PrivateAuth";
import { PrivateDashboard } from "./pages/PrivateDashboard";
import Index from "./pages/Index";
import { ClientRequests } from "./pages/ClientRequests";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isTempAccess, setIsTempAccess] = useState(false);

  useEffect(() => {
    const tempAccess = localStorage.getItem('tempAccess') === 'true';
    setIsTempAccess(tempAccess);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null && !isTempAccess) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && !isTempAccess) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

const PrivateProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            resolve(user);
            unsubscribe();
          });
        });
        
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error("Error checking auth state:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/private-auth" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <div className="App">
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/private-auth" element={<PrivateAuth />} />
                <Route
                  path="/private-dashboard"
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
                <Route path="/client-requests" element={<ClientRequests />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;
