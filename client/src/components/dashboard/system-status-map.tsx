import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Droplets, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function SystemStatusMap() {
  const { data: leaks, isLoading: leaksLoading } = useQuery({
    queryKey: ["/api/leaks"],
    refetchInterval: 30000,
  });

  const { data: maintenance, isLoading: maintenanceLoading } = useQuery({
    queryKey: ["/api/maintenance"],
    refetchInterval: 30000,
  });

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ["/api/water-usage"],
    refetchInterval: 30000,
  });

  if (leaksLoading || maintenanceLoading || usageLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            System Status Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-500";
      case "investigating": return "bg-yellow-500";
      case "resolved": return "bg-green-500";
      case "pending": return "bg-blue-500";
      case "in_progress": return "bg-orange-500";
      case "completed": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <XCircle className="h-4 w-4" />;
      case "investigating": return <AlertTriangle className="h-4 w-4" />;
      case "resolved": return <CheckCircle className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      default: return <Droplets className="h-4 w-4" />;
    }
  };

  // Group locations by area
  const locationAreas = [
    { 
      name: "North District", 
      locations: ["North Pump Station", "North Valley", "Industrial District - North"],
      x: 20, y: 20 
    },
    { 
      name: "Downtown", 
      locations: ["Downtown Treatment Plant", "Main Street", "City Center"],
      x: 50, y: 40 
    },
    { 
      name: "South District", 
      locations: ["South Valley Pump Station", "Residential Area", "South End"],
      x: 30, y: 70 
    },
    { 
      name: "Industrial", 
      locations: ["Industrial District - Factory Row", "Manufacturing Zone", "Warehouse District"],
      x: 80, y: 30 
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          System Status Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-gray-200">
          {/* Map Areas */}
          {locationAreas.map((area, index) => {
            const areaLeaks = leaks?.filter(leak => 
              area.locations.some(loc => leak.location.includes(loc))
            ) || [];
            const areaMaintenance = maintenance?.filter(task => 
              area.locations.some(loc => task.location.includes(loc))
            ) || [];
            
            const hasActiveIssues = areaLeaks.some(leak => leak.status === 'active') || 
                                  areaMaintenance.some(task => task.status === 'pending');
            
            return (
              <div
                key={index}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group`}
                style={{ left: `${area.x}%`, top: `${area.y}%` }}
              >
                <div className={`w-4 h-4 rounded-full ${hasActiveIssues ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                <div className="absolute top-5 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded shadow-lg border min-w-48 z-10">
                  <h4 className="font-semibold text-sm mb-2">{area.name}</h4>
                  {areaLeaks.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-600 mb-1">Active Leaks:</p>
                      {areaLeaks.slice(0, 3).map((leak, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs">
                          {getStatusIcon(leak.status)}
                          <span className="truncate">{leak.location}</span>
                          <Badge variant="outline" className="text-xs">
                            {leak.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {areaMaintenance.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Maintenance:</p>
                      {areaMaintenance.slice(0, 2).map((task, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs">
                          {getStatusIcon(task.status)}
                          <span className="truncate">{task.taskType}</span>
                          <Badge variant="outline" className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Legend */}
          <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow-sm border">
            <div className="text-xs font-semibold mb-1">Status Legend</div>
            <div className="flex items-center gap-1 text-xs mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Normal</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Issues</span>
            </div>
          </div>
        </div>
        
        {/* Status Summary */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {locationAreas.filter(area => {
                const areaLeaks = leaks?.filter(leak => 
                  area.locations.some(loc => leak.location.includes(loc))
                ) || [];
                const areaMaintenance = maintenance?.filter(task => 
                  area.locations.some(loc => task.location.includes(loc))
                ) || [];
                return !areaLeaks.some(leak => leak.status === 'active') && 
                       !areaMaintenance.some(task => task.status === 'pending');
              }).length}
            </div>
            <div className="text-sm text-gray-600">Areas Normal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {locationAreas.filter(area => {
                const areaLeaks = leaks?.filter(leak => 
                  area.locations.some(loc => leak.location.includes(loc))
                ) || [];
                const areaMaintenance = maintenance?.filter(task => 
                  area.locations.some(loc => task.location.includes(loc))
                ) || [];
                return areaLeaks.some(leak => leak.status === 'active') || 
                       areaMaintenance.some(task => task.status === 'pending');
              }).length}
            </div>
            <div className="text-sm text-gray-600">Areas w/ Issues</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}