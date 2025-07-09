import { Card, CardContent } from "@/components/ui/card";
import { Droplet, AlertTriangle, Gauge, Wrench } from "lucide-react";

interface KPICardsProps {
  kpis?: {
    totalUsageToday: string;
    usageChange: string;
    activeLeaks: number;
    systemPressure: number;
    pendingMaintenance: number;
    unreadAlerts: number;
  };
}

export default function KPICards({ kpis }: KPICardsProps) {
  if (!kpis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const usageChange = parseFloat(kpis.usageChange);
  const isUsageUp = usageChange > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Water Usage Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usage Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {kpis.totalUsageToday}M
              </p>
              <p className="text-sm text-gray-500">gallons</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Droplet className="text-blue-600 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className={`mr-1 ${isUsageUp ? 'text-status-success' : 'text-red-500'}`}>
                {isUsageUp ? '↑' : '↓'} {Math.abs(usageChange)}%
              </span>
              <span className="text-gray-500">vs yesterday</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Leaks Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Leaks</p>
              <p className="text-3xl font-bold text-status-critical mt-2">
                {kpis.activeLeaks}
              </p>
              <p className="text-sm text-gray-500">locations</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-status-critical mr-1">
                {kpis.activeLeaks > 5 ? 'High' : 'Normal'}
              </span>
              <span className="text-gray-500">alert level</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Pressure Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Pressure</p>
              <p className="text-3xl font-bold text-status-success mt-2">
                {kpis.systemPressure}
              </p>
              <p className="text-sm text-gray-500">PSI</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Gauge className="text-green-600 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-status-success mr-1">Normal</span>
              <span className="text-gray-500">range</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Maintenance Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-3xl font-bold text-status-warning mt-2">
                {kpis.pendingMaintenance}
              </p>
              <p className="text-sm text-gray-500">maintenance</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Wrench className="text-orange-600 h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-status-warning mr-1">
                {Math.floor(kpis.pendingMaintenance * 0.25)}
              </span>
              <span className="text-gray-500">overdue</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
