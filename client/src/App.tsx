import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import WaterUsagePage from "@/pages/water-usage";
import LeaksPage from "@/pages/leaks";
import MaintenancePage from "@/pages/maintenance";
import ReportsPage from "@/pages/reports";
import CustomersPage from "@/pages/customers";
import TestPage from "@/pages/test";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  // Always show the dashboard and other pages without authentication
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/water-usage" component={WaterUsagePage} />
      <Route path="/leaks" component={LeaksPage} />
      <Route path="/maintenance" component={MaintenancePage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/customers" component={CustomersPage} />
      <Route path="/test" component={TestPage} />
      <Route path="/login" component={LoginPage} />
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
