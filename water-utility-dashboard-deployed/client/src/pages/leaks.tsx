import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/dashboard/sidebar";
import { useToast } from "@/hooks/use-toast";

export default function LeaksPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    severity: "",
    estimatedGallonsLost: "",
    assignedTechnician: "",
    notes: ""
  });

  const { data: leaksData, isLoading } = useQuery({
    queryKey: ["/api/leaks"],
    refetchInterval: 30000,
    refetchIntervalInBackground: false, // Only refresh when tab is active
  });

  const addLeakMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("POST", "/api/leaks", {
        ...data,
        detectedAt: new Date().toISOString(),
        status: "active",
        estimatedGallonsLost: data.estimatedGallonsLost ? parseFloat(data.estimatedGallonsLost) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      setShowAddForm(false);
      setFormData({ location: "", severity: "", estimatedGallonsLost: "", assignedTechnician: "", notes: "" });
      toast({ title: "Success", description: "Leak record added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add leak record", variant: "destructive" });
    }
  });

  const updateLeakMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest("PATCH", `/api/leaks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      toast({ title: "Success", description: "Leak status updated" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addLeakMutation.mutate(formData);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "outline";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "destructive";
      case "investigating": return "outline";
      case "resolved": return "secondary";
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
              <h1 className="text-2xl font-semibold text-gray-900">Leak Detection</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor and manage water leaks across the system</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Report New Leak
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Report New Leak</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Main Street & 5th Avenue"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedGallonsLost">Estimated Gallons Lost</Label>
                    <Input
                      id="estimatedGallonsLost"
                      type="number"
                      value={formData.estimatedGallonsLost}
                      onChange={(e) => setFormData({ ...formData, estimatedGallonsLost: e.target.value })}
                      placeholder="e.g., 1500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignedTechnician">Assigned Technician</Label>
                    <Input
                      id="assignedTechnician"
                      value={formData.assignedTechnician}
                      onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional details about the leak"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" disabled={addLeakMutation.isPending}>
                      {addLeakMutation.isPending ? "Reporting..." : "Report Leak"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Active Leaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading leak data...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detected</TableHead>
                      <TableHead>Estimated Loss</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaksData?.map((leak: any) => (
                      <TableRow key={leak.id}>
                        <TableCell className="font-medium">{leak.location}</TableCell>
                        <TableCell>
                          <Badge variant={getSeverityColor(leak.severity)}>{leak.severity}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(leak.status)}>{leak.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(leak.detectedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {leak.estimatedGallonsLost ? `${leak.estimatedGallonsLost.toLocaleString()} gal` : "N/A"}
                        </TableCell>
                        <TableCell>{leak.assignedTechnician || "Unassigned"}</TableCell>
                        <TableCell>
                          {leak.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateLeakMutation.mutate({ id: leak.id, status: "investigating" })}
                            >
                              Start Investigation
                            </Button>
                          )}
                          {leak.status === "investigating" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateLeakMutation.mutate({ id: leak.id, status: "resolved" })}
                            >
                              Mark Resolved
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