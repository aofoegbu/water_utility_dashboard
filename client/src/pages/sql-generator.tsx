import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Play, Download, Database, BarChart, FileText, Code } from "lucide-react";

interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTime: number;
}

const SAMPLE_QUERIES = {
  "Basic Usage Report": `SELECT 
  location,
  COUNT(*) as reading_count,
  AVG(gallons)::numeric(10,2) as avg_gallons,
  MAX(gallons)::numeric(10,2) as max_gallons,
  MIN(gallons)::numeric(10,2) as min_gallons
FROM water_usage 
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY location
ORDER BY avg_gallons DESC;`,

  "Leak Analysis": `SELECT 
  l.location,
  l.severity,
  l.status,
  l.detected_at,
  l.estimated_gallons_lost,
  l.assigned_technician
FROM leaks l
WHERE l.detected_at >= NOW() - INTERVAL '30 days'
ORDER BY l.detected_at DESC;`,

  "Maintenance Summary": `SELECT 
  task_type,
  status,
  COUNT(*) as task_count,
  AVG(estimated_duration) as avg_duration,
  AVG(cost) as avg_cost
FROM maintenance
WHERE scheduled_date >= NOW() - INTERVAL '30 days'
GROUP BY task_type, status
ORDER BY task_count DESC;`,

  "Daily Usage Trends": `SELECT 
  DATE(timestamp) as date,
  COUNT(*) as readings,
  SUM(gallons)::numeric(12,2) as total_gallons,
  AVG(pressure)::numeric(8,2) as avg_pressure,
  AVG(flow_rate)::numeric(8,2) as avg_flow_rate
FROM water_usage
WHERE timestamp >= NOW() - INTERVAL '14 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;`,

  "Alert Summary": `SELECT 
  type,
  severity,
  COUNT(*) as alert_count,
  COUNT(CASE WHEN is_read IS NOT TRUE THEN 1 END) as unread_count
FROM alerts
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY type, severity
ORDER BY alert_count DESC;`
};

export default function SqlGenerator() {
  const [activeTab, setActiveTab] = useState("editor");
  const [sql, setSql] = useState("");
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const { toast } = useToast();

  // Execute SQL mutation
  const executeSqlMutation = useMutation({
    mutationFn: async (sqlQuery: string) => {
      const startTime = Date.now();
      const response = await fetch("/api/sql/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlQuery }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to execute query");
      }
      
      const result = await response.json();
      result.executionTime = Date.now() - startTime;
      return result;
    },
    onSuccess: (data) => {
      setQueryResult(data);
      toast({
        title: "Query executed successfully",
        description: `Returned ${data.rowCount} rows in ${data.executionTime}ms`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Query execution failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExecuteQuery = () => {
    if (!sql.trim()) {
      toast({
        title: "Empty query",
        description: "Please enter a SQL query to execute",
        variant: "destructive",
      });
      return;
    }

    setIsExecuting(true);
    executeSqlMutation.mutate(sql);
    setIsExecuting(false);
  };

  const handleTemplateSelect = (queryName: string) => {
    setSql(SAMPLE_QUERIES[queryName as keyof typeof SAMPLE_QUERIES] || "");
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!queryResult) {
      toast({
        title: "No data to export",
        description: "Please execute a query first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/sql/export/${format}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sql,
          data: queryResult.rows,
          columns: queryResult.columns
        }),
      });
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `query_result_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export successful",
        description: `Data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SQL Report Generator</h1>
          <p className="text-muted-foreground">
            Execute SQL queries and generate reports from water utility data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Documentation
          </Button>
          <Button variant="outline" size="sm">
            <BarChart className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">Query Editor</TabsTrigger>
          <TabsTrigger value="templates">Sample Queries</TabsTrigger>
          <TabsTrigger value="schema">Database Schema</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    SQL Query Editor
                  </CardTitle>
                  <CardDescription>
                    Write and execute SQL queries against the PostgreSQL water utility database
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Quick Templates</label>
                    <Select onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a sample query..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(SAMPLE_QUERIES).map((queryName) => (
                          <SelectItem key={queryName} value={queryName}>
                            {queryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">SQL Query</label>
                    <Textarea
                      placeholder="SELECT * FROM water_usage WHERE timestamp >= NOW() - INTERVAL '7 days'..."
                      className="font-mono text-sm min-h-[250px]"
                      value={sql}
                      onChange={(e) => setSql(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleExecuteQuery}
                    disabled={isExecuting || !sql.trim()}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isExecuting ? "Executing..." : "Execute Query"}
                  </Button>
                </CardContent>
              </Card>

              {queryResult && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Query Results
                          <Badge variant="secondary">
                            {queryResult.rowCount} rows
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Executed in {queryResult.executionTime}ms
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport('csv')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport('json')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          JSON
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {queryResult.columns.map((column) => (
                              <TableHead key={column} className="font-semibold">
                                {column}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {queryResult.rows.map((row, index) => (
                            <TableRow key={index}>
                              {queryResult.columns.map((column) => (
                                <TableCell key={column} className="font-mono text-sm">
                                  {row[column] !== null && row[column] !== undefined
                                    ? String(row[column])
                                    : "NULL"}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Query Help</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="font-medium">Security Note:</p>
                    <p className="text-muted-foreground">Only SELECT queries are allowed for security.</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="font-medium">Performance Tip:</p>
                    <p className="text-muted-foreground">Use LIMIT for large datasets and proper WHERE clauses.</p>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="font-medium">PostgreSQL Features:</p>
                    <p className="text-muted-foreground">Use DATE(), INTERVAL, and numeric casting for better reports.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Tables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="font-mono">water_usage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="font-mono">leaks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="font-mono">maintenance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="font-mono">alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="font-mono">activities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="font-mono">users</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(SAMPLE_QUERIES).map(([name, query]) => (
              <Card key={name} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {name}
                  </CardTitle>
                  <CardDescription>
                    {name === "Basic Usage Report" && "Analyze water usage patterns by location"}
                    {name === "Leak Analysis" && "Review recent leak incidents and status"}
                    {name === "Maintenance Summary" && "Summarize maintenance tasks by type and status"}
                    {name === "Daily Usage Trends" && "Track daily usage trends over time"}
                    {name === "Alert Summary" && "Analyze system alerts by type and severity"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <ScrollArea className="h-[100px]">
                      <code className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {query}
                      </code>
                    </ScrollArea>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        handleTemplateSelect(name);
                        setActiveTab("editor");
                      }}
                    >
                      Use This Query
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  water_usage
                </CardTitle>
                <CardDescription>Water consumption readings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><span className="font-mono">id</span> - Primary key</div>
                  <div><span className="font-mono">location</span> - Reading location</div>
                  <div><span className="font-mono">timestamp</span> - Reading time</div>
                  <div><span className="font-mono">gallons</span> - Gallons consumed</div>
                  <div><span className="font-mono">pressure</span> - Water pressure</div>
                  <div><span className="font-mono">flow_rate</span> - Flow rate</div>
                  <div><span className="font-mono">temperature</span> - Water temperature</div>
                  <div><span className="font-mono">quality_metrics</span> - JSON quality data</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  leaks
                </CardTitle>
                <CardDescription>Leak detection and tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><span className="font-mono">id</span> - Primary key</div>
                  <div><span className="font-mono">location</span> - Leak location</div>
                  <div><span className="font-mono">severity</span> - Severity level</div>
                  <div><span className="font-mono">status</span> - Current status</div>
                  <div><span className="font-mono">detected_at</span> - Detection time</div>
                  <div><span className="font-mono">resolved_at</span> - Resolution time</div>
                  <div><span className="font-mono">estimated_gallons_lost</span> - Loss estimate</div>
                  <div><span className="font-mono">assigned_technician</span> - Assigned tech</div>
                  <div><span className="font-mono">notes</span> - Additional notes</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  maintenance
                </CardTitle>
                <CardDescription>Maintenance task management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><span className="font-mono">id</span> - Primary key</div>
                  <div><span className="font-mono">task_type</span> - Type of task</div>
                  <div><span className="font-mono">location</span> - Task location</div>
                  <div><span className="font-mono">priority</span> - Priority level</div>
                  <div><span className="font-mono">status</span> - Current status</div>
                  <div><span className="font-mono">scheduled_date</span> - Scheduled time</div>
                  <div><span className="font-mono">completed_date</span> - Completion time</div>
                  <div><span className="font-mono">assigned_technician</span> - Assigned tech</div>
                  <div><span className="font-mono">estimated_duration</span> - Duration (min)</div>
                  <div><span className="font-mono">description</span> - Task description</div>
                  <div><span className="font-mono">cost</span> - Estimated cost</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  alerts
                </CardTitle>
                <CardDescription>System alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><span className="font-mono">id</span> - Primary key</div>
                  <div><span className="font-mono">type</span> - Alert type</div>
                  <div><span className="font-mono">location</span> - Alert location</div>
                  <div><span className="font-mono">timestamp</span> - Alert time</div>
                  <div><span className="font-mono">severity</span> - Severity level</div>
                  <div><span className="font-mono">resolved_at</span> - Resolution time</div>
                  <div><span className="font-mono">message</span> - Alert message</div>
                  <div><span className="font-mono">is_read</span> - Read status</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  activities
                </CardTitle>
                <CardDescription>System activity audit trail</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><span className="font-mono">id</span> - Primary key</div>
                  <div><span className="font-mono">event_type</span> - Event type</div>
                  <div><span className="font-mono">location</span> - Event location</div>
                  <div><span className="font-mono">timestamp</span> - Event time</div>
                  <div><span className="font-mono">status</span> - Event status</div>
                  <div><span className="font-mono">technician</span> - Technician involved</div>
                  <div><span className="font-mono">details</span> - Additional details</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  users
                </CardTitle>
                <CardDescription>User accounts and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div><span className="font-mono">id</span> - Primary key</div>
                  <div><span className="font-mono">username</span> - Username</div>
                  <div><span className="font-mono">email</span> - Email address</div>
                  <div><span className="font-mono">full_name</span> - Full name</div>
                  <div><span className="font-mono">role</span> - User role</div>
                  <div><span className="font-mono">department</span> - Department</div>
                  <div><span className="font-mono">created_at</span> - Account creation</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}