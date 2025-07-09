import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, Activity, Download } from "lucide-react";

interface QuickActionsProps {
  onGenerateReport: () => void;
}

export default function QuickActions({ onGenerateReport }: QuickActionsProps) {
  const actions = [
    {
      title: "Generate Daily Report",
      description: "PDF export with usage stats",
      icon: BarChart3,
      color: "bg-blue-100 text-blue-600",
      onClick: onGenerateReport
    },
    {
      title: "Schedule Inspection",
      description: "Add new maintenance task",
      icon: Calendar,
      color: "bg-orange-100 text-orange-600",
      onClick: () => console.log("Schedule inspection")
    },
    {
      title: "System Health Check",
      description: "Run diagnostics",
      icon: Activity,
      color: "bg-green-100 text-green-600",
      onClick: () => console.log("System health check")
    },
    {
      title: "Export Data",
      description: "CSV/Excel format",
      icon: Download,
      color: "bg-purple-100 text-purple-600",
      onClick: () => console.log("Export data")
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg h-auto"
                onClick={action.onClick}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">{action.title}</p>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
