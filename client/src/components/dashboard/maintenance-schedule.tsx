import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function MaintenanceSchedule() {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/maintenance/today"],
    refetchInterval: 60000,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      apiRequest("PATCH", `/api/maintenance/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
    },
    onError: (error) => {
      console.error('Failed to update maintenance task:', error);
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-600";
      case "high": return "bg-orange-100 text-orange-600";
      case "normal": return "bg-green-100 text-green-600";
      case "low": return "bg-gray-100 text-gray-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTaskToggle = (task: any, completed: boolean) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: {
        status: completed ? "completed" : "pending",
        completedDate: completed ? new Date().toISOString() : null
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
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
          <CardTitle>Today's Schedule</CardTitle>
          <Link href="/maintenance">
            <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks && tasks.length > 0 ? (
            tasks.map((task: any) => (
              <div 
                key={task.id} 
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
              >
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={(checked) => handleTaskToggle(task, checked as boolean)}
                  disabled={updateTaskMutation.isPending}
                />
                <div className={`flex-1 ${task.status === "completed" ? "opacity-75" : ""}`}>
                  <p className={`text-sm font-medium text-gray-900 ${task.status === "completed" ? "line-through" : ""}`}>
                    {task.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {task.location} • {formatTime(task.scheduledDate)}
                  </p>
                </div>
                <div className={`text-xs px-2 py-1 rounded capitalize ${getPriorityColor(task.priority)}`}>
                  {task.status === "completed" ? "Done" : task.priority}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks scheduled for today</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
