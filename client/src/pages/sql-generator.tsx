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
import { Play, Download, Database, BarChart, FileText, Code, Plus, Minus, Settings } from "lucide-react";

interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTime: number;
}

interface QueryCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  connector: 'AND' | 'OR';
}

interface QueryBuilder {
  table: string;
  selectedFields: string[];
  conditions: QueryCondition[];
  groupBy: string[];
  orderBy: { field: string; direction: 'ASC' | 'DESC' }[];
  limit: number | null;
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

const DATABASE_TABLES = {
  water_usage: {
    label: "Water Usage",
    fields: {
      id: { label: "ID", type: "number" },
      location: { label: "Location", type: "text" },
      timestamp: { label: "Timestamp", type: "datetime" },
      gallons: { label: "Gallons", type: "number" },
      pressure: { label: "Pressure", type: "number" },
      flow_rate: { label: "Flow Rate", type: "number" },
      temperature: { label: "Temperature", type: "number" },
      quality_metrics: { label: "Quality Metrics", type: "text" }
    }
  },
  leaks: {
    label: "Leaks",
    fields: {
      id: { label: "ID", type: "number" },
      location: { label: "Location", type: "text" },
      severity: { label: "Severity", type: "text" },
      status: { label: "Status", type: "text" },
      detected_at: { label: "Detected At", type: "datetime" },
      resolved_at: { label: "Resolved At", type: "datetime" },
      estimated_gallons_lost: { label: "Estimated Gallons Lost", type: "number" },
      assigned_technician: { label: "Assigned Technician", type: "text" },
      notes: { label: "Notes", type: "text" }
    }
  },
  maintenance: {
    label: "Maintenance",
    fields: {
      id: { label: "ID", type: "number" },
      location: { label: "Location", type: "text" },
      status: { label: "Status", type: "text" },
      assigned_technician: { label: "Assigned Technician", type: "text" },
      notes: { label: "Notes", type: "text" },
      task_type: { label: "Task Type", type: "text" },
      priority: { label: "Priority", type: "text" },
      scheduled_date: { label: "Scheduled Date", type: "datetime" },
      completed_date: { label: "Completed Date", type: "datetime" },
      estimated_duration: { label: "Estimated Duration", type: "number" },
      description: { label: "Description", type: "text" },
      cost: { label: "Cost", type: "number" }
    }
  },
  alerts: {
    label: "Alerts",
    fields: {
      id: { label: "ID", type: "number" },
      location: { label: "Location", type: "text" },
      timestamp: { label: "Timestamp", type: "datetime" },
      severity: { label: "Severity", type: "text" },
      resolved_at: { label: "Resolved At", type: "datetime" },
      type: { label: "Type", type: "text" },
      message: { label: "Message", type: "text" },
      is_read: { label: "Is Read", type: "boolean" }
    }
  },
  users: {
    label: "Users",
    fields: {
      id: { label: "ID", type: "number" },
      username: { label: "Username", type: "text" },
      role: { label: "Role", type: "text" },
      full_name: { label: "Full Name", type: "text" },
      department: { label: "Department", type: "text" },
      created_at: { label: "Created At", type: "datetime" },
      email: { label: "Email", type: "text" }
    }
  }
};

const OPERATORS = {
  text: [
    { value: "=", label: "equals" },
    { value: "!=", label: "not equals" },
    { value: "LIKE", label: "contains" },
    { value: "NOT LIKE", label: "does not contain" },
    { value: "IS NULL", label: "is empty" },
    { value: "IS NOT NULL", label: "is not empty" }
  ],
  number: [
    { value: "=", label: "equals" },
    { value: "!=", label: "not equals" },
    { value: ">", label: "greater than" },
    { value: ">=", label: "greater than or equal" },
    { value: "<", label: "less than" },
    { value: "<=", label: "less than or equal" },
    { value: "IS NULL", label: "is empty" },
    { value: "IS NOT NULL", label: "is not empty" }
  ],
  datetime: [
    { value: "=", label: "equals" },
    { value: "!=", label: "not equals" },
    { value: ">", label: "after" },
    { value: ">=", label: "on or after" },
    { value: "<", label: "before" },
    { value: "<=", label: "on or before" },
    { value: "IS NULL", label: "is empty" },
    { value: "IS NOT NULL", label: "is not empty" }
  ],
  boolean: [
    { value: "=", label: "equals" },
    { value: "!=", label: "not equals" },
    { value: "IS NULL", label: "is empty" },
    { value: "IS NOT NULL", label: "is not empty" }
  ]
};

export default function SqlGenerator() {
  const [activeTab, setActiveTab] = useState("builder");
  const [sql, setSql] = useState("");
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Query Builder State
  const [queryBuilder, setQueryBuilder] = useState<QueryBuilder>({
    table: "",
    selectedFields: [],
    conditions: [],
    groupBy: [],
    orderBy: [],
    limit: null
  });
  
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

  // Query Builder Functions
  const generateSQLFromBuilder = () => {
    if (!queryBuilder.table || queryBuilder.selectedFields.length === 0) {
      return "";
    }

    let query = "SELECT ";
    
    // Add selected fields
    if (queryBuilder.selectedFields.includes("*")) {
      query += "*";
    } else {
      query += queryBuilder.selectedFields.join(", ");
    }
    
    query += ` FROM ${queryBuilder.table}`;
    
    // Add WHERE conditions
    if (queryBuilder.conditions.length > 0) {
      query += " WHERE ";
      queryBuilder.conditions.forEach((condition, index) => {
        if (index > 0) {
          query += ` ${condition.connector} `;
        }
        
        if (condition.operator === "LIKE" || condition.operator === "NOT LIKE") {
          query += `${condition.field} ${condition.operator} '%${condition.value}%'`;
        } else if (condition.operator === "IS NULL" || condition.operator === "IS NOT NULL") {
          query += `${condition.field} ${condition.operator}`;
        } else {
          const fieldType = DATABASE_TABLES[queryBuilder.table as keyof typeof DATABASE_TABLES]?.fields[condition.field]?.type;
          if (fieldType === "text" || fieldType === "datetime") {
            query += `${condition.field} ${condition.operator} '${condition.value}'`;
          } else {
            query += `${condition.field} ${condition.operator} ${condition.value}`;
          }
        }
      });
    }
    
    // Add GROUP BY
    if (queryBuilder.groupBy.length > 0) {
      query += ` GROUP BY ${queryBuilder.groupBy.join(", ")}`;
    }
    
    // Add ORDER BY
    if (queryBuilder.orderBy.length > 0) {
      query += " ORDER BY ";
      queryBuilder.orderBy.forEach((order, index) => {
        if (index > 0) query += ", ";
        query += `${order.field} ${order.direction}`;
      });
    }
    
    // Add LIMIT
    if (queryBuilder.limit && queryBuilder.limit > 0) {
      query += ` LIMIT ${queryBuilder.limit}`;
    }
    
    return query;
  };

  const addCondition = () => {
    const newCondition: QueryCondition = {
      id: Math.random().toString(36).substring(7),
      field: "",
      operator: "=",
      value: "",
      connector: "AND"
    };
    setQueryBuilder(prev => ({
      ...prev,
      conditions: [...prev.conditions, newCondition]
    }));
  };

  const updateCondition = (id: string, updates: Partial<QueryCondition>) => {
    setQueryBuilder(prev => ({
      ...prev,
      conditions: prev.conditions.map(condition =>
        condition.id === id ? { ...condition, ...updates } : condition
      )
    }));
  };

  const removeCondition = (id: string) => {
    setQueryBuilder(prev => ({
      ...prev,
      conditions: prev.conditions.filter(condition => condition.id !== id)
    }));
  };

  const executeBuilderQuery = () => {
    const generatedSQL = generateSQLFromBuilder();
    if (generatedSQL) {
      setSql(generatedSQL);
      setActiveTab("editor");
      // Auto-execute the query
      setTimeout(() => {
        setIsExecuting(true);
        executeSqlMutation.mutate(generatedSQL);
        setIsExecuting(false);
      }, 100);
    }
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder">Query Builder</TabsTrigger>
          <TabsTrigger value="editor">Query Editor</TabsTrigger>
          <TabsTrigger value="templates">Sample Queries</TabsTrigger>
          <TabsTrigger value="schema">Database Schema</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Visual Query Builder
                  </CardTitle>
                  <CardDescription>
                    Build SQL queries using a visual interface - perfect for non-technical users
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Table Selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Source</label>
                    <Select
                      value={queryBuilder.table}
                      onValueChange={(value) => setQueryBuilder(prev => ({ 
                        ...prev, 
                        table: value, 
                        selectedFields: [],
                        conditions: [],
                        groupBy: [],
                        orderBy: []
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a table..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DATABASE_TABLES).map(([key, table]) => (
                          <SelectItem key={key} value={key}>
                            {table.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {queryBuilder.table && (
                    <>
                      {/* Field Selection */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Select Fields</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={queryBuilder.selectedFields.includes("*")}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setQueryBuilder(prev => ({ ...prev, selectedFields: ["*"] }));
                                } else {
                                  setQueryBuilder(prev => ({ ...prev, selectedFields: [] }));
                                }
                              }}
                            />
                            <span className="text-sm font-medium">All Fields (*)</span>
                          </label>
                          {!queryBuilder.selectedFields.includes("*") && 
                            Object.entries(DATABASE_TABLES[queryBuilder.table as keyof typeof DATABASE_TABLES].fields).map(([fieldKey, field]) => (
                              <label key={fieldKey} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={queryBuilder.selectedFields.includes(fieldKey)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setQueryBuilder(prev => ({ 
                                        ...prev, 
                                        selectedFields: [...prev.selectedFields, fieldKey] 
                                      }));
                                    } else {
                                      setQueryBuilder(prev => ({ 
                                        ...prev, 
                                        selectedFields: prev.selectedFields.filter(f => f !== fieldKey) 
                                      }));
                                    }
                                  }}
                                />
                                <span className="text-sm">{field.label}</span>
                              </label>
                            ))
                          }
                        </div>
                      </div>

                      {/* Conditions */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Filters (WHERE)</label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={addCondition}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Filter
                          </Button>
                        </div>
                        
                        {queryBuilder.conditions.map((condition, index) => (
                          <div key={condition.id} className="flex items-center gap-2 p-3 border rounded mb-2">
                            {index > 0 && (
                              <Select
                                value={condition.connector}
                                onValueChange={(value: 'AND' | 'OR') => updateCondition(condition.id, { connector: value })}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AND">AND</SelectItem>
                                  <SelectItem value="OR">OR</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            
                            <Select
                              value={condition.field}
                              onValueChange={(value) => updateCondition(condition.id, { field: value, operator: "=" })}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Field..." />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(DATABASE_TABLES[queryBuilder.table as keyof typeof DATABASE_TABLES].fields).map(([fieldKey, field]) => (
                                  <SelectItem key={fieldKey} value={fieldKey}>
                                    {field.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {condition.field && (
                              <Select
                                value={condition.operator}
                                onValueChange={(value) => updateCondition(condition.id, { operator: value })}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {OPERATORS[DATABASE_TABLES[queryBuilder.table as keyof typeof DATABASE_TABLES].fields[condition.field]?.type as keyof typeof OPERATORS]?.map((op) => (
                                    <SelectItem key={op.value} value={op.value}>
                                      {op.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}

                            {condition.field && !["IS NULL", "IS NOT NULL"].includes(condition.operator) && (
                              <Input
                                placeholder="Value..."
                                value={condition.value}
                                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                                className="flex-1"
                              />
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCondition(condition.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Limit */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Limit Results</label>
                        <Input
                          type="number"
                          placeholder="No limit"
                          value={queryBuilder.limit || ""}
                          onChange={(e) => setQueryBuilder(prev => ({ 
                            ...prev, 
                            limit: e.target.value ? parseInt(e.target.value) : null 
                          }))}
                          className="w-32"
                        />
                      </div>

                      {/* Execute Button */}
                      <Button
                        onClick={executeBuilderQuery}
                        disabled={queryBuilder.selectedFields.length === 0 || isExecuting}
                        className="w-full"
                        size="lg"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Build & Execute Query
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    SQL Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto min-h-[100px]">
                    {generateSQLFromBuilder() || "Configure your query using the options on the left"}
                  </pre>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    <span>Start by selecting a data source</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    <span>Choose which fields to display</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    <span>Add filters to narrow results</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    <span>Set a limit to control output size</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

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