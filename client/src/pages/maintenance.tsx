import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Wrench, Calendar } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/dashboard/sidebar";
import { useToast } from "@/hooks/use-toast";

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    taskType: "",
    location: "",
    priority: "",
    scheduledDate: "",
    assignedTechnician: "",
    estimatedDuration: "",
    description: "",
    notes: ""
  });

  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ["/api/maintenance"],
    refetchInterval: 60000,
    refetchIntervalInBackground: false, // Only refresh when tab is active
  });

  const addMaintenanceMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("POST", "/api/maintenance", {
        ...data,
        status: "pending",
        estimatedDuration: data.estimatedDuration ? parseInt(data.estimatedDuration) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      setShowAddForm(false);
      setFormData({ taskType: "", location: "", priority: "", scheduledDate: "", assignedTechnician: "", estimatedDuration: "", description: "", notes: "" });
      toast({ title: "Success", description: "Maintenance task scheduled successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to schedule maintenance task", variant: "destructive" });
    }
  });

  const updateMaintenanceMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest("PATCH", `/api/maintenance/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({ title: "Success", description: "Maintenance status updated" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMaintenanceMutation.mutate(formData);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "normal": return "outline";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "outline";
      case "in_progress": return "default";
      case "completed": return "secondary";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Maintenance</h1>
              <p className="text-sm text-gray-500 mt-1">Schedule and track maintenance tasks across the system</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Schedule New Maintenance Task</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taskType">Task Type</Label>
                    <Select value={formData.taskType} onValueChange={(value) => setFormData({ ...formData, taskType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inspection">Inspection</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="replacement">Replacement</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="calibration">Calibration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., North Treatment Plant"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignedTechnician">Assigned Technician</Label>
                    <Input
                      id="assignedTechnician"
                      value={formData.assignedTechnician}
                      onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                      placeholder="e.g., Mike Wilson"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
                    <Input
                      id="estimatedDuration"
                      type="number"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                      placeholder="e.g., 120"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the maintenance task"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" disabled={addMaintenanceMutation.isPending}>
                      {addMaintenanceMutation.isPending ? "Scheduling..." : "Schedule Task"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-500" />
                Maintenance Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading maintenance data...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceData?.map((task: any) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.taskType}</TableCell>
                        <TableCell>{task.location}</TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {new Date(task.scheduledDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{task.assignedTechnician}</TableCell>
                        <TableCell>{task.estimatedDuration ? `${task.estimatedDuration} min` : "N/A"}</TableCell>
                        <TableCell>
                          {task.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateMaintenanceMutation.mutate({ id: task.id, status: "in_progress" })}
                            >
                              Start Task
                            </Button>
                          )}
                          {task.status === "in_progress" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateMaintenanceMutation.mutate({ id: task.id, status: "completed" })}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}