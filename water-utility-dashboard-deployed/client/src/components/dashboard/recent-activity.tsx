import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, Settings, Droplets, Calendar, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activities"],
    refetchInterval: 30000,
    refetchIntervalInBackground: false, // Only refresh when tab is active
  });

  const getActivityIcon = (eventType: string) => {
    switch (eventType) {
      case "leak_detected": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "maintenance_completed": return <Settings className="h-4 w-4 text-green-500" />;
      case "usage_spike": return <Droplets className="h-4 w-4 text-blue-500" />;
      case "system_alert": return <Activity className="h-4 w-4 text-orange-500" />;
      case "maintenance_scheduled": return <Calendar className="h-4 w-4 text-purple-500" />;
      case "alert_generated": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (eventType: string) => {
    switch (eventType) {
      case "leak_detected": return "destructive";
      case "maintenance_completed": return "default";
      case "usage_spike": return "secondary";
      case "system_alert": return "outline";
      case "maintenance_scheduled": return "outline";
      case "alert_generated": return "outline";
      default: return "outline";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.eventType) {
      case "leak_detected":
        return `Leak detected at ${activity.location}`;
      case "maintenance_completed":
        return `Maintenance completed at ${activity.location}`;
      case "usage_spike":
        return `Usage spike detected at ${activity.location}`;
      case "system_alert":
        return `System alert: ${activity.description}`;
      case "maintenance_scheduled":
        return `Maintenance scheduled for ${activity.location}`;
      case "alert_generated":
        return `Alert generated for ${activity.location}`;
      default:
        return activity.description || "System activity";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
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
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent System Activity
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
            <Link href="/dashboard" className="flex items-center gap-1">
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.slice(0, 6).map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                {getActivityIcon(activity.eventType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getActivityDescription(activity)}
                  </p>
                  <Badge variant={getActivityColor(activity.eventType) as any} className="text-xs">
                    {activity.eventType.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 truncate">
                    {activity.details || "System activity recorded"}
                  </p>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {!activities || activities.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent system activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}