import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Home from "@/pages/Home";
import LandingPage from "@/pages/LandingPage";
import HistoryPage from "@/pages/HistoryPage";
import LibraryPage from "@/pages/LibraryPage";
import ContactPage from "@/pages/ContactPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050510]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#00f3ff]" />
          <span className="text-white font-mono text-sm tracking-widest animate-pulse">
            システム初期化中...
          </span>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* 
        If user is logged in, show Chat (Home).
        If not, show Landing Page.
        Admin page is protected inside the component but we can route it here too.
      */}
      <Route path="/">
        {user ? <Home /> : <LandingPage />}
      </Route>
      
      <Route path="/history" component={HistoryPage} />
      <Route path="/library" component={LibraryPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/admin-page" component={AdminPage} />
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
