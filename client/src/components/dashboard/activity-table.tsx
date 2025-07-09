import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";

export default function ActivityTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activities"],
    refetchInterval: 60000,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": case "critical": return "bg-red-100 text-red-600";
      case "completed": case "normal": return "bg-green-100 text-green-600";
      case "investigating": case "warning": return "bg-orange-100 text-orange-600";
      case "pending": return "bg-blue-100 text-blue-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType.toLowerCase()) {
      case "leak alert": return "bg-status-critical";
      case "maintenance complete": return "bg-status-success";
      case "system check": return "bg-status-info";
      default: return "bg-gray-400";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mock activities data since the API might not have seeded activities
  const mockActivities = [
    {
      id: 1,
      eventType: "Leak Alert",
      location: "Main St & 4th Ave",
      status: "Active",
      technician: "Mike Johnson",
      timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      details: "High pressure leak detected"
    },
    {
      id: 2,
      eventType: "Maintenance Complete",
      location: "North Treatment Plant",
      status: "Completed",
      technician: "Sarah Chen",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      details: "Pump station inspection completed"
    },
    {
      id: 3,
      eventType: "System Check",
      location: "Station 7 - Pine Street",
      status: "Normal",
      technician: "Auto System",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      details: "Automated system health check"
    }
  ];

  const displayActivities = activities && activities.length > 0 ? activities : mockActivities;

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent System Activity</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input
                placeholder="Search activity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="alerts">Alerts</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="system">System Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technician
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayActivities.map((activity: any) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(activity.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getEventTypeIcon(activity.eventType)}`}></div>
                      <span className="text-sm text-gray-900">{activity.eventType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.technician}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 mr-3">
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing 1 to {displayActivities.length} of {displayActivities.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button size="sm" className="bg-primary-500 text-white">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
