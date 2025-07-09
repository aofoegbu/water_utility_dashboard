import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function AlertsPanel() {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (alertId: number) => 
      apiRequest("PATCH", `/api/alerts/${alertId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-50 border-red-200";
      case "warning": return "bg-orange-50 border-orange-200";
      case "info": return "bg-blue-50 border-blue-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  const getSeverityDot = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-status-critical";
      case "warning": return "bg-status-warning";
      case "info": return "bg-status-info";
      default: return "bg-gray-400";
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Alerts</CardTitle>
          <Link href="/leaks">
            <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts && alerts.length > 0 ? (
            alerts.slice(0, 3).map((alert: any) => (
              <div 
                key={alert.id} 
                className={`flex items-start space-x-3 p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
              >
                <div className={`w-2 h-2 ${getSeverityDot(alert.severity)} rounded-full mt-2`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.location} • {formatTime(alert.timestamp)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600 p-1"
                  onClick={() => markAsReadMutation.mutate(alert.id)}
                  disabled={markAsReadMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent alerts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
