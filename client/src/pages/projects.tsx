import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Clock, DollarSign, Users, AlertTriangle, CheckCircle, FileText, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Project, Requirement, TestCase, UatSession, RiskAssessment, CostEstimate } from "@shared/schema";

export default function ProjectsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  // Fetch project details when a project is selected
  const { data: requirements = [] } = useQuery({
    queryKey: ["/api/requirements", selectedProject],
    queryFn: () => apiRequest(`/api/requirements?projectId=${selectedProject}`),
    enabled: !!selectedProject,
  });

  const { data: testCases = [] } = useQuery({
    queryKey: ["/api/test-cases", selectedProject],
    queryFn: () => apiRequest(`/api/test-cases?projectId=${selectedProject}`),
    enabled: !!selectedProject,
  });

  const { data: uatSessions = [] } = useQuery({
    queryKey: ["/api/uat-sessions", selectedProject],
    queryFn: () => apiRequest(`/api/uat-sessions?projectId=${selectedProject}`),
    enabled: !!selectedProject,
  });

  const { data: risks = [] } = useQuery({
    queryKey: ["/api/risks", selectedProject],
    queryFn: () => apiRequest(`/api/risks?projectId=${selectedProject}`),
    enabled: !!selectedProject,
  });

  const { data: costEstimates = [] } = useQuery({
    queryKey: ["/api/cost-estimates", selectedProject],
    queryFn: () => apiRequest(`/api/cost-estimates?projectId=${selectedProject}`),
    enabled: !!selectedProject,
  });

  const { data: costSummary } = useQuery({
    queryKey: ["/api/projects", selectedProject, "cost-summary"],
    queryFn: () => apiRequest(`/api/projects/${selectedProject}/cost-summary`),
    enabled: !!selectedProject,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/projects", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setShowNewProjectDialog(false);
      toast({ title: "Success", description: "Project created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    },
  });

  const selectedProjectData = projects.find((p: Project) => p.projectId === selectedProject);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "completed": return "secondary";
      case "on_hold": return "destructive";
      case "cancelled": return "outline";
      default: return "secondary";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  const handleCreateProject = (formData: FormData) => {
    const data = {
      projectId: formData.get("projectId"),
      name: formData.get("name"),
      description: formData.get("description"),
      methodology: formData.get("methodology"),
      priority: formData.get("priority"),
      projectManager: formData.get("projectManager"),
      sponsor: formData.get("sponsor"),
      budget: formData.get("budget") ? Number(formData.get("budget")) : null,
      startDate: formData.get("startDate") || null,
      endDate: formData.get("endDate") || null,
    };
    createProjectMutation.mutate(data);
  };

  if (projectsLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Project Tracker</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Project Tracker & UAT Management</h2>
        <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form action={handleCreateProject}>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Set up a new project with business requirements and UAT support.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="projectId" className="text-right">
                    Project ID
                  </Label>
                  <Input
                    id="projectId"
                    name="projectId"
                    placeholder="PROJ-003"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Project name"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Project description and objectives"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="methodology" className="text-right">
                    Methodology
                  </Label>
                  <Select name="methodology" defaultValue="agile">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select methodology" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agile">Agile</SelectItem>
                      <SelectItem value="waterfall">Waterfall</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="projectManager" className="text-right">
                    Project Manager
                  </Label>
                  <Input
                    id="projectManager"
                    name="projectManager"
                    placeholder="Augustine Ogelo"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sponsor" className="text-right">
                    Sponsor
                  </Label>
                  <Input
                    id="sponsor"
                    name="sponsor"
                    placeholder="Executive sponsor"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="budget" className="text-right">
                    Budget
                  </Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    placeholder="250000"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createProjectMutation.isPending}>
                  {createProjectMutation.isPending ? "Creating..." : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.filter((p: Project) => p.status === "active").length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requirements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requirements.length}</div>
            <p className="text-xs text-muted-foreground">
              {requirements.filter((r: Requirement) => r.status === "approved").length} approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Cases</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testCases.length}</div>
            <p className="text-xs text-muted-foreground">
              {testCases.filter((tc: TestCase) => tc.status === "passed").length} passed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">UAT Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uatSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {uatSessions.filter((uat: UatSession) => uat.approved).length} approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>
            Select a project to view requirements, test cases, UAT sessions, and risk assessments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projects.map((project: Project) => (
              <div
                key={project.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedProject === project.projectId 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-muted/50"
                }`}
                onClick={() => setSelectedProject(project.projectId)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{project.name}</h3>
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        {project.status}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(project.priority)}>
                        {project.priority}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {project.methodology}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>PM: {project.projectManager}</span>
                      {project.budget && (
                        <span>Budget: ${project.budget.toLocaleString()}</span>
                      )}
                      {project.startDate && (
                        <span>Start: {format(new Date(project.startDate), "MMM dd, yyyy")}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold">{project.percentComplete}%</div>
                    <Progress value={project.percentComplete} className="w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      {selectedProject && selectedProjectData && (
        <Tabs defaultValue="requirements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
            <TabsTrigger value="uat">UAT Sessions</TabsTrigger>
            <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="requirements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Requirements - {selectedProjectData.name}</CardTitle>
                <CardDescription>
                  Business and functional requirements with traceability and acceptance criteria.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requirements.map((req: Requirement) => (
                    <div key={req.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{req.requirementId}</Badge>
                            <Badge variant={
                              req.status === "accepted" ? "default" :
                              req.status === "approved" ? "secondary" :
                              req.status === "implemented" ? "default" : "outline"
                            }>
                              {req.status}
                            </Badge>
                            <Badge variant={getPriorityBadgeVariant(req.priority)}>
                              {req.priority}
                            </Badge>
                          </div>
                          <h4 className="font-semibold">{req.title}</h4>
                          <p className="text-sm text-muted-foreground">{req.description}</p>
                          {req.acceptanceCriteria && (
                            <div>
                              <h5 className="font-medium text-sm">Acceptance Criteria:</h5>
                              <p className="text-xs text-muted-foreground">{req.acceptanceCriteria}</p>
                            </div>
                          )}
                          {req.businessValue && (
                            <div>
                              <h5 className="font-medium text-sm">Business Value:</h5>
                              <p className="text-xs text-muted-foreground">{req.businessValue}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>Type: {req.type}</div>
                          <div>Complexity: {req.complexity}</div>
                          {req.estimatedHours && <div>Est: {req.estimatedHours}h</div>}
                          {req.actualHours && <div>Act: {req.actualHours}h</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test-cases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Cases - {selectedProjectData.name}</CardTitle>
                <CardDescription>
                  Test cases with execution status and traceability to requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testCases.map((tc: TestCase) => (
                    <div key={tc.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{tc.testCaseId}</Badge>
                            {tc.requirementId && (
                              <Badge variant="secondary">{tc.requirementId}</Badge>
                            )}
                            <Badge variant={
                              tc.status === "passed" ? "default" :
                              tc.status === "failed" ? "destructive" :
                              tc.status === "blocked" ? "destructive" : "outline"
                            }>
                              {tc.status}
                            </Badge>
                            <Badge variant={getPriorityBadgeVariant(tc.priority)}>
                              {tc.priority}
                            </Badge>
                          </div>
                          <h4 className="font-semibold">{tc.title}</h4>
                          <p className="text-sm text-muted-foreground">{tc.description}</p>
                          {tc.expectedResult && (
                            <div>
                              <h5 className="font-medium text-sm">Expected Result:</h5>
                              <p className="text-xs text-muted-foreground">{tc.expectedResult}</p>
                            </div>
                          )}
                          {tc.actualResult && (
                            <div>
                              <h5 className="font-medium text-sm">Actual Result:</h5>
                              <p className="text-xs text-muted-foreground">{tc.actualResult}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>Type: {tc.type}</div>
                          {tc.executedBy && <div>By: {tc.executedBy}</div>}
                          {tc.executedAt && (
                            <div>Executed: {format(new Date(tc.executedAt), "MMM dd")}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>UAT Sessions - {selectedProjectData.name}</CardTitle>
                <CardDescription>
                  User acceptance testing sessions with participant feedback and approval status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uatSessions.map((uat: UatSession) => (
                    <div key={uat.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{uat.sessionId}</Badge>
                            <Badge variant={
                              uat.status === "completed" ? "default" :
                              uat.status === "in_progress" ? "secondary" : "outline"
                            }>
                              {uat.status}
                            </Badge>
                            {uat.approved && (
                              <Badge variant="default">Approved</Badge>
                            )}
                          </div>
                          <h4 className="font-semibold">{uat.name}</h4>
                          <p className="text-sm text-muted-foreground">{uat.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <div>
                              Period: {format(new Date(uat.startDate), "MMM dd")} - {format(new Date(uat.endDate), "MMM dd, yyyy")}
                            </div>
                            {uat.participants && Array.isArray(uat.participants) && (
                              <div>Participants: {uat.participants.length}</div>
                            )}
                            {uat.overallRating && (
                              <div>Rating: {uat.overallRating}/5</div>
                            )}
                          </div>
                          {uat.notes && (
                            <p className="text-xs text-muted-foreground italic">{uat.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {uat.approvedBy && (
                            <div className="text-xs text-muted-foreground">
                              Approved by: {uat.approvedBy}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment - {selectedProjectData.name}</CardTitle>
                <CardDescription>
                  Project risks with probability, impact analysis, and mitigation strategies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {risks.map((risk: RiskAssessment) => (
                    <div key={risk.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{risk.riskId}</Badge>
                            <Badge variant={getRiskBadgeVariant(risk.riskLevel)}>
                              {risk.riskLevel} risk
                            </Badge>
                            <Badge variant="secondary">{risk.category}</Badge>
                            <Badge variant={
                              risk.status === "closed" ? "default" :
                              risk.status === "mitigating" ? "secondary" : "outline"
                            }>
                              {risk.status}
                            </Badge>
                          </div>
                          <h4 className="font-semibold">{risk.title}</h4>
                          <p className="text-sm text-muted-foreground">{risk.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="font-medium">Probability:</span> {risk.probability}
                            </div>
                            <div>
                              <span className="font-medium">Impact:</span> {risk.impact}
                            </div>
                          </div>
                          {risk.mitigation && (
                            <div>
                              <h5 className="font-medium text-sm">Mitigation:</h5>
                              <p className="text-xs text-muted-foreground">{risk.mitigation}</p>
                            </div>
                          )}
                          {risk.contingency && (
                            <div>
                              <h5 className="font-medium text-sm">Contingency:</h5>
                              <p className="text-xs text-muted-foreground">{risk.contingency}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {risk.owner && <div>Owner: {risk.owner}</div>}
                          {risk.reviewDate && (
                            <div>Review: {format(new Date(risk.reviewDate), "MMM dd")}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis - {selectedProjectData.name}</CardTitle>
                <CardDescription>
                  Project cost estimates and budget tracking by category.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Cost Summary */}
                  {costSummary && (
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Estimated</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            ${costSummary.totalEstimated?.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Actual Spent</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            ${costSummary.totalActual?.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Variance</CardTitle>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            ${(costSummary.totalEstimated - costSummary.totalActual)?.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Cost Estimates */}
                  <div className="space-y-4">
                    {costEstimates.map((estimate: CostEstimate) => (
                      <div key={estimate.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{estimate.category}</Badge>
                              <h4 className="font-semibold">{estimate.item}</h4>
                            </div>
                            {estimate.description && (
                              <p className="text-sm text-muted-foreground">{estimate.description}</p>
                            )}
                            <div className="text-xs text-muted-foreground">
                              <div>Quantity: {estimate.quantity}</div>
                              <div>Unit Cost: ${estimate.unitCost?.toLocaleString()}</div>
                              {estimate.contingency > 0 && (
                                <div>Contingency: {estimate.contingency}%</div>
                              )}
                              {estimate.vendor && <div>Vendor: {estimate.vendor}</div>}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              ${estimate.finalCost?.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Base: ${estimate.totalCost?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}