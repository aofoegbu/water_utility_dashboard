import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/sidebar";
import KPICards from "@/components/dashboard/kpi-cards";
import UsageChart from "@/components/dashboard/usage-chart";
import SystemStatusMap from "@/components/dashboard/system-status-map";
import AlertsPanel from "@/components/dashboard/alerts-panel";
import MaintenanceSchedule from "@/components/dashboard/maintenance-schedule";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivity from "@/components/dashboard/recent-activity";
import ReportModal from "@/components/dashboard/report-modal";
import { useState } from "react";
import { Bell, Download, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const { user, logout } = useAuth();

  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useQuery({
    queryKey: ["/api/dashboard/kpis"],
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchIntervalInBackground: false, // Only refresh when tab is active
  });

  const { data: unreadAlerts } = useQuery({
    queryKey: ["/api/alerts"],
    queryFn: () => fetch("/api/alerts?unreadOnly=true").then(res => res.json()),
    refetchInterval: 30000,
    refetchIntervalInBackground: false, // Only refresh when tab is active
  });

  if (kpisError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading dashboard: {kpisError.message}</p>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  if (kpisLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const lastUpdate = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Water System Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Real-time monitoring and analytics • Last updated: {lastUpdate}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setAlertsOpen(!alertsOpen)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadAlerts && unreadAlerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadAlerts.length}
                    </span>
                  )}
                </Button>
              </div>
              
              <Button 
                onClick={() => setShowReportModal(true)}
                className="bg-primary-500 hover:bg-primary-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.fullName || user?.username || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'augustineogelo1@gmail.com'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Analyst'} • {user?.department || 'Water Utility'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <KPICards kpis={kpis} />
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <UsageChart />
            <SystemStatusMap />
          </div>

          {/* Data Panels Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <AlertsPanel />
            <MaintenanceSchedule />
            <QuickActions onGenerateReport={() => setShowReportModal(true)} />
          </div>

          {/* Activity Table */}
          <RecentActivity />
        </main>
      </div>

      <ReportModal 
        open={showReportModal} 
        onOpenChange={setShowReportModal} 
      />
    </div>
  );
}
