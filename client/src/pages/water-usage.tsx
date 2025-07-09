import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/dashboard/sidebar";
import { useToast } from "@/hooks/use-toast";

export default function WaterUsagePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    gallons: "",
    pressure: "",
    flowRate: "",
    temperature: ""
  });

  const { data: usageData, isLoading } = useQuery({
    queryKey: ["/api/water-usage"],
    refetchInterval: 60000,
  });

  const addUsageMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest("POST", "/api/water-usage", {
        ...data,
        timestamp: new Date().toISOString(),
        gallons: parseFloat(data.gallons),
        pressure: parseFloat(data.pressure),
        flowRate: parseFloat(data.flowRate),
        temperature: data.temperature ? parseFloat(data.temperature) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-usage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/kpis"] });
      setShowAddForm(false);
      setFormData({ location: "", gallons: "", pressure: "", flowRate: "", temperature: "" });
      toast({ title: "Success", description: "Water usage record added successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add water usage record", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUsageMutation.mutate(formData);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Water Usage</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor and track water consumption across all locations</p>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => setShowAddForm(!showAddForm)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Usage Record
              </Button>
              <Button variant="outline" onClick={() => {
                const csvData = usageData?.map(record => ({
                  Timestamp: new Date(record.timestamp).toLocaleString(),
                  Location: record.location,
                  Gallons: record.gallons,
                  Pressure: record.pressure,
                  FlowRate: record.flowRate,
                  Temperature: record.temperature || 'N/A'
                })) || [];
                
                const csvContent = [
                  Object.keys(csvData[0] || {}).join(','),
                  ...csvData.map(row => Object.values(row).join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `water-usage-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add Water Usage Record</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Main Station"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="gallons">Gallons</Label>
                    <Input
                      id="gallons"
                      type="number"
                      step="0.1"
                      value={formData.gallons}
                      onChange={(e) => setFormData({ ...formData, gallons: e.target.value })}
                      placeholder="e.g., 1500"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pressure">Pressure (PSI)</Label>
                    <Input
                      id="pressure"
                      type="number"
                      step="0.1"
                      value={formData.pressure}
                      onChange={(e) => setFormData({ ...formData, pressure: e.target.value })}
                      placeholder="e.g., 45.2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="flowRate">Flow Rate (GPM)</Label>
                    <Input
                      id="flowRate"
                      type="number"
                      step="0.1"
                      value={formData.flowRate}
                      onChange={(e) => setFormData({ ...formData, flowRate: e.target.value })}
                      placeholder="e.g., 12.5"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={addUsageMutation.isPending}>
                      {addUsageMutation.isPending ? "Adding..." : "Add Record"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Water Usage</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading usage data...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Gallons</TableHead>
                      <TableHead>Pressure</TableHead>
                      <TableHead>Flow Rate</TableHead>
                      <TableHead>Temperature</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageData?.slice(0, 20).map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{record.location}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.gallons.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell>{record.pressure} PSI</TableCell>
                        <TableCell>{record.flowRate} GPM</TableCell>
                        <TableCell>{record.temperature ? `${record.temperature}°F` : "N/A"}</TableCell>
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