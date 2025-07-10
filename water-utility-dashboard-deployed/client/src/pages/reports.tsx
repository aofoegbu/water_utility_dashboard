import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Calendar, TrendingUp, AlertTriangle, Wrench } from "lucide-react";
import Sidebar from "@/components/dashboard/sidebar";
import { useToast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportForm, setReportForm] = useState({
    reportType: "",
    format: "",
    startDate: "",
    endDate: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: "usage", label: "Water Usage Report", icon: TrendingUp, description: "Comprehensive water consumption analysis" },
    { value: "leaks", label: "Leak Detection Report", icon: AlertTriangle, description: "Summary of detected leaks and resolutions" },
    { value: "maintenance", label: "Maintenance Report", icon: Wrench, description: "Maintenance activities and schedules" },
    { value: "alerts", label: "Alerts Report", icon: FileText, description: "System alerts and notifications" }
  ];

  const handleGenerateReport = async () => {
    if (!reportForm.reportType || !reportForm.format || !reportForm.startDate || !reportForm.endDate) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: reportForm.reportType,
          format: reportForm.format,
          startDate: reportForm.startDate,
          endDate: reportForm.endDate
        })
      });

      if (!response.ok) throw new Error("Failed to generate report");

      const filename = `${reportForm.reportType}_${reportForm.startDate}_${reportForm.endDate}.${reportForm.format}`;
      
      if (reportForm.format === "pdf") {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const text = await response.text();
        const blob = new Blob([text], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast({ title: "Success", description: `${reportForm.format.toUpperCase()} report generated successfully` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
              <p className="text-sm text-gray-500 mt-1">Generate comprehensive reports for analysis and compliance</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Types */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Select Report Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.value}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            reportForm.reportType === type.value
                              ? "border-primary-500 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setReportForm({ ...reportForm, reportType: type.value })}
                        >
                          <div className="flex items-start space-x-3">
                            <Icon className={`h-5 w-5 mt-1 ${
                              reportForm.reportType === type.value ? "text-primary-600" : "text-gray-400"
                            }`} />
                            <div>
                              <h3 className="font-medium text-gray-900">{type.label}</h3>
                              <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Report Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={reportForm.startDate}
                        onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={reportForm.endDate}
                        onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="format">Output Format</Label>
                    <Select value={reportForm.format} onValueChange={(value) => setReportForm({ ...reportForm, format: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                        <SelectItem value="csv">CSV Data Export</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generate Report */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generate Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Options:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>Type: {reportForm.reportType ? reportTypes.find(t => t.value === reportForm.reportType)?.label : "Not selected"}</li>
                      <li>Format: {reportForm.format ? reportForm.format.toUpperCase() : "Not selected"}</li>
                      <li>Start: {reportForm.startDate || "Not selected"}</li>
                      <li>End: {reportForm.endDate || "Not selected"}</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={handleGenerateReport}
                    disabled={isGenerating || !reportForm.reportType || !reportForm.format || !reportForm.startDate || !reportForm.endDate}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isGenerating ? "Generating..." : "Generate Report"}
                  </Button>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• PDF reports include charts and formatted layouts</p>
                    <p>• CSV exports provide raw data for analysis</p>
                    <p>• Reports are generated in real-time from current data</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setReportForm({
                      reportType: "usage",
                      format: "pdf",
                      startDate: new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0]
                    })}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Last 7 Days Usage
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setReportForm({
                      reportType: "leaks",
                      format: "csv",
                      startDate: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0]
                    })}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Monthly Leaks CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setReportForm({
                      reportType: "maintenance",
                      format: "pdf",
                      startDate: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
                      endDate: new Date().toISOString().split('T')[0]
                    })}
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Maintenance Summary
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}