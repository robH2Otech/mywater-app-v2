
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Tooltip } from "@/components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AppRoutes } from "./components/routes/AppRoutes";

// Create a new QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <Tooltip content="Application content">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </Tooltip>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
