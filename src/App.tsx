
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AppRoutes } from "@/components/routes/AppRoutes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./App.css";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          // Don't retry if it's a permissions error
          if (error?.message?.includes('Missing or insufficient permissions')) {
            return false;
          }
          return failureCount < 2; // Reduced from 3 to 2
        },
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
        gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer (renamed from cacheTime)
        refetchOnMount: 'always',
        refetchInterval: false, // Disable automatic refetching
      },
      mutations: {
        retry: 1, // Only retry mutations once
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-spotify-dark prevent-horizontal-scroll">
            <AppRoutes />
            <Toaster />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
