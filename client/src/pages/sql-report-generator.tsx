import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Play, Download, Save, Database, Clock, Star, FileText, BarChart } from "lucide-react";

interface QueryTemplate {
  id: number;
  name: string;
  description: string;
  sql: string;
  category: string;
  difficulty: string;
  estimatedRows?: number;
}

interface SqlQuery {
  id: number;
  name: string;
  description?: string;
  sql: string;
  category: string;
  tags: string[];
  createdBy: string;
  lastExecuted?: string;
  executionCount: number;
  isFavorite: boolean;
}

interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
}

interface SchemaTable {
  table: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
  }>;
}

export default function SqlReportGenerator() {
  const [activeTab, setActiveTab] = useState("editor");
  const [sql, setSql] = useState("");
  const [queryName, setQueryName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState<number>(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch query templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<QueryTemplate[]>({
    queryKey: ["/api/sql/templates"],
  });

  // Fetch saved queries
  const { data: queries = [], isLoading: queriesLoading } = useQuery<SqlQuery[]>({
    queryKey: ["/api/sql/queries"],
  });

  // Fetch database schema
  const { data: schema = [], isLoading: schemaLoading } = useQuery<SchemaTable[]>({
    queryKey: ["/api/sql/schema"],
  });

  // Execute SQL mutation
  const executeSqlMutation = useMutation({
    mutationFn: async (sqlQuery: string) => {
      const response = await fetch("/api/sql/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlQuery, queryName }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to execute query");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setQueryResult(data.data);
      setExecutionTime(data.executionTime);
      toast({
        title: "Query executed successfully",
        description: `Returned ${data.rowCount} rows in ${data.executionTime}ms`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sql/queries"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Query execution failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save query mutation
  const saveQueryMutation = useMutation({
    mutationFn: async (queryData: {
      name: string;
      sql: string;
      description?: string;
      category: string;
      tags: string[];
    }) => {
      const response = await fetch("/api/sql/queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save query");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Query saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sql/queries"] });
    },
    onError: () => {
      toast({
        title: "Failed to save query",
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

  const handleSaveQuery = () => {
    if (!queryName.trim() || !sql.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both query name and SQL",
        variant: "destructive",
      });
      return;
    }

    saveQueryMutation.mutate({
      name: queryName,
      sql,
      description: "",
      category: "custom",
      tags: [],
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    if (template) {
      setSql(template.sql);
      setQueryName(template.name);
      setSelectedTemplate(templateId);
    }
  };

  const handleQuerySelect = (query: SqlQuery) => {
    setSql(query.sql);
    setQueryName(query.name);
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
      const params = new URLSearchParams({
        sql,
        filename: queryName || 'query_result'
      });
      
      const response = await fetch(`/api/sql/export/${format}?${params}`);
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${queryName || 'query_result'}.${format}`;
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
            Execute SQL queries, generate reports, and analyze water utility data
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
          <TabsTrigger value="editor">Query Editor</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="saved">Saved Queries</TabsTrigger>
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
                    Write and execute SQL queries against the water utility database
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Query Name</label>
                      <Input
                        placeholder="Enter query name..."
                        value={queryName}
                        onChange={(e) => setQueryName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Quick Templates</label>
                      <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template..." />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">SQL Query</label>
                    <Textarea
                      placeholder="SELECT * FROM water_usage WHERE..."
                      className="font-mono text-sm min-h-[200px]"
                      value={sql}
                      onChange={(e) => setSql(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleExecuteQuery}
                      disabled={isExecuting || !sql.trim()}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isExecuting ? "Executing..." : "Execute Query"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSaveQuery}
                      disabled={!queryName.trim() || !sql.trim()}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
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
                          Executed in {executionTime}ms
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
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Recent Queries
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Favorite Queries
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Query History
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Query Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="font-medium">Security Note:</p>
                    <p className="text-muted-foreground">Only SELECT queries are allowed for security reasons.</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="font-medium">Performance Tip:</p>
                    <p className="text-muted-foreground">Use LIMIT clause for large datasets to improve query performance.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant={template.difficulty === 'beginner' ? 'default' : 
                                 template.difficulty === 'intermediate' ? 'secondary' : 'destructive'}>
                      {template.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    {template.estimatedRows && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Est. Rows:</span>
                        <span>{template.estimatedRows.toLocaleString()}</span>
                      </div>
                    )}
                    <Button 
                      className="w-full"
                      onClick={() => {
                        handleTemplateSelect(template.id.toString());
                        setActiveTab("editor");
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queries.map((query) => (
              <Card key={query.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {query.name}
                      {query.isFavorite && <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                    </CardTitle>
                    <Badge variant="outline">{query.category}</Badge>
                  </div>
                  {query.description && (
                    <CardDescription>{query.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created by:</span>
                      <span>{query.createdBy}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Executions:</span>
                      <span>{query.executionCount}</span>
                    </div>
                    {query.lastExecuted && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last run:</span>
                        <span>{new Date(query.lastExecuted).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {query.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        handleQuerySelect(query);
                        setActiveTab("editor");
                      }}
                    >
                      Load Query
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schema.map((table) => (
              <Card key={table.table}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {table.table}
                  </CardTitle>
                  <CardDescription>
                    {table.columns.length} columns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Column</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs">Key</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {table.columns.map((column) => (
                          <TableRow key={column.name}>
                            <TableCell className="font-mono text-xs">
                              {column.name}
                            </TableCell>
                            <TableCell className="text-xs">
                              {column.type}
                            </TableCell>
                            <TableCell className="text-xs">
                              {column.primaryKey && (
                                <Badge variant="default" className="text-xs">PK</Badge>
                              )}
                              {!column.nullable && !column.primaryKey && (
                                <Badge variant="secondary" className="text-xs">NN</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}