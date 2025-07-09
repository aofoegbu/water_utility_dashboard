import { 
  users, waterUsage, leaks, maintenance, alerts, activities,
  projects, requirements, testCases, uatSessions, stakeholders, riskAssessments, costEstimates,
  sqlQueries, queryExecutions, queryTemplates,
  type User, type InsertUser, type WaterUsage, type InsertWaterUsage,
  type Leak, type InsertLeak, type Maintenance, type InsertMaintenance,
  type Alert, type InsertAlert, type Activity, type InsertActivity,
  type Project, type InsertProject, type Requirement, type InsertRequirement,
  type TestCase, type InsertTestCase, type UatSession, type InsertUatSession,
  type Stakeholder, type InsertStakeholder, type RiskAssessment, type InsertRiskAssessment,
  type CostEstimate, type InsertCostEstimate,
  type SqlQuery, type InsertSqlQuery, type QueryExecution, type InsertQueryExecution,
  type QueryTemplate, type InsertQueryTemplate
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Water usage
  getWaterUsage(filters?: { startDate?: Date; endDate?: Date; location?: string }): Promise<WaterUsage[]>;
  createWaterUsage(usage: InsertWaterUsage): Promise<WaterUsage>;
  getUsageStatistics(): Promise<{
    totalToday: number;
    totalYesterday: number;
    averagePressure: number;
    peakUsageTime: string;
  }>;
  
  // Leak management
  getLeaks(status?: string): Promise<Leak[]>;
  createLeak(leak: InsertLeak): Promise<Leak>;
  updateLeak(id: number, updates: Partial<Leak>): Promise<Leak | undefined>;
  getActiveLeaksCount(): Promise<number>;
  
  // Maintenance
  getMaintenance(filters?: { status?: string; date?: Date }): Promise<Maintenance[]>;
  createMaintenance(task: InsertMaintenance): Promise<Maintenance>;
  updateMaintenance(id: number, updates: Partial<Maintenance>): Promise<Maintenance | undefined>;
  getTodaysMaintenance(): Promise<Maintenance[]>;
  getPendingMaintenanceCount(): Promise<number>;
  
  // Alerts
  getAlerts(unreadOnly?: boolean): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<void>;
  getUnreadAlertsCount(): Promise<number>;
  
  // Activities
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Project management
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectByProjectId(projectId: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  
  // Requirements
  getRequirements(projectId?: string): Promise<Requirement[]>;
  getRequirement(id: number): Promise<Requirement | undefined>;
  createRequirement(requirement: InsertRequirement): Promise<Requirement>;
  updateRequirement(id: number, updates: Partial<Requirement>): Promise<Requirement | undefined>;
  
  // Test cases
  getTestCases(projectId?: string, requirementId?: string): Promise<TestCase[]>;
  getTestCase(id: number): Promise<TestCase | undefined>;
  createTestCase(testCase: InsertTestCase): Promise<TestCase>;
  updateTestCase(id: number, updates: Partial<TestCase>): Promise<TestCase | undefined>;
  
  // UAT sessions
  getUatSessions(projectId?: string): Promise<UatSession[]>;
  getUatSession(id: number): Promise<UatSession | undefined>;
  createUatSession(session: InsertUatSession): Promise<UatSession>;
  updateUatSession(id: number, updates: Partial<UatSession>): Promise<UatSession | undefined>;
  
  // Stakeholders
  getStakeholders(projectId?: string): Promise<Stakeholder[]>;
  createStakeholder(stakeholder: InsertStakeholder): Promise<Stakeholder>;
  updateStakeholder(id: number, updates: Partial<Stakeholder>): Promise<Stakeholder | undefined>;
  
  // Risk assessments
  getRiskAssessments(projectId?: string): Promise<RiskAssessment[]>;
  createRiskAssessment(risk: InsertRiskAssessment): Promise<RiskAssessment>;
  updateRiskAssessment(id: number, updates: Partial<RiskAssessment>): Promise<RiskAssessment | undefined>;
  
  // Cost estimates
  getCostEstimates(projectId?: string): Promise<CostEstimate[]>;
  createCostEstimate(estimate: InsertCostEstimate): Promise<CostEstimate>;
  updateCostEstimate(id: number, updates: Partial<CostEstimate>): Promise<CostEstimate | undefined>;
  getProjectCostSummary(projectId: string): Promise<{
    totalEstimated: number;
    totalActual: number;
    byCategory: Array<{ category: string; estimated: number; actual: number }>;
  }>;

  // SQL Report Generator
  getSqlQueries(): Promise<SqlQuery[]>;
  getSqlQuery(id: number): Promise<SqlQuery | undefined>;
  createSqlQuery(query: InsertSqlQuery): Promise<SqlQuery>;
  getSqlQueryTemplates(): Promise<QueryTemplate[]>;
  createQueryExecution(execution: InsertQueryExecution): Promise<QueryExecution>;
  executeSqlQuery(sql: string): Promise<{ columns: string[]; rows: any[]; rowCount: number }>;
  getDatabaseSchema(): Promise<Array<{ table: string; columns: Array<{ name: string; type: string; nullable: boolean; primaryKey: boolean }> }>>;
  exportToCSV(data: any[]): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private waterUsage: Map<number, WaterUsage> = new Map();
  private leaks: Map<number, Leak> = new Map();
  private maintenance: Map<number, Maintenance> = new Map();
  private alerts: Map<number, Alert> = new Map();
  private activities: Map<number, Activity> = new Map();
  
  // Project management storage
  private projects: Map<number, Project> = new Map();
  private requirements: Map<number, Requirement> = new Map();
  private testCases: Map<number, TestCase> = new Map();
  private uatSessions: Map<number, UatSession> = new Map();
  private stakeholders: Map<number, Stakeholder> = new Map();
  private riskAssessments: Map<number, RiskAssessment> = new Map();
  private costEstimates: Map<number, CostEstimate> = new Map();
  
  // SQL Report Generator storage
  private sqlQueries: Map<number, SqlQuery> = new Map();
  private queryExecutions: Map<number, QueryExecution> = new Map();
  private queryTemplates: Map<number, QueryTemplate> = new Map();
  
  private currentId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample user
    this.createUser({
      username: "john.analyst",
      email: "john.analyst@ogelo.com",
      password: "password123",
      role: "analyst",
      fullName: "John Analyst",
      department: "MIS"
    });

    // Create sample data for demonstration
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Water usage data
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      this.createWaterUsage({
        location: "North Treatment Plant",
        timestamp: date,
        gallons: 2000000 + Math.random() * 500000,
        pressure: 75 + Math.random() * 10,
        flowRate: 1500 + Math.random() * 300,
        temperature: 65 + Math.random() * 10,
        qualityMetrics: { pH: 7.2, chlorine: 0.8 }
      });
    }

    // Active leaks
    this.createLeak({
      location: "Main St & 4th Ave",
      severity: "critical",
      status: "active",
      detectedAt: new Date(now.getTime() - 60 * 60 * 1000),
      estimatedGallonsLost: 1500,
      assignedTechnician: "Mike Johnson",
      notes: "Major leak causing pressure drop"
    });

    this.createLeak({
      location: "Pine Street Sector",
      severity: "medium",
      status: "investigating",
      detectedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      estimatedGallonsLost: 200,
      assignedTechnician: "Sarah Chen"
    });

    // Maintenance tasks
    this.createMaintenance({
      taskType: "inspection",
      location: "North Treatment Plant",
      priority: "high",
      status: "pending",
      scheduledDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      assignedTechnician: "Sarah Chen",
      estimatedDuration: 120,
      description: "Pump Station Inspection"
    });

    this.createMaintenance({
      taskType: "repair",
      location: "Downtown District",
      priority: "normal",
      status: "pending",
      scheduledDate: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      assignedTechnician: "Mike Johnson",
      estimatedDuration: 180,
      description: "Valve Replacement"
    });

    // Recent alerts
    this.createAlert({
      type: "pressure",
      severity: "critical",
      location: "Pine Street Station 7",
      message: "High Pressure Detected",
      timestamp: new Date(now.getTime() - 15 * 60 * 1000),
      isRead: false
    });

    this.createAlert({
      type: "flow",
      severity: "warning",
      location: "Riverside District",
      message: "Low Flow Detected",
      timestamp: new Date(now.getTime() - 32 * 60 * 1000),
      isRead: false
    });

    // Sample project data
    this.createProject({
      projectId: "PROJ-001",
      name: "Water Quality Management System",
      description: "Implement comprehensive water quality monitoring and alerting system for municipal water supply",
      methodology: "agile",
      status: "active",
      priority: "high",
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      projectManager: "Augustine Ogelo",
      sponsor: "City Water Department",
      budget: 250000,
      actualCost: 125000,
      percentComplete: 65
    });

    this.createProject({
      projectId: "PROJ-002",
      name: "Customer Portal Enhancement",
      description: "Modernize customer self-service portal with billing integration and service requests",
      methodology: "waterfall",
      status: "planning",
      priority: "medium",
      startDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
      projectManager: "Sarah Martinez",
      sponsor: "Customer Service Division",
      budget: 180000,
      actualCost: 0,
      percentComplete: 15
    });

    // Sample requirements
    this.createRequirement({
      projectId: "PROJ-001",
      requirementId: "REQ-001",
      title: "Real-time Water Quality Dashboard",
      description: "System must display real-time water quality metrics including pH, chlorine levels, turbidity, and temperature",
      type: "functional",
      priority: "must_have",
      status: "implemented",
      source: "Water Quality Supervisor",
      acceptanceCriteria: "Dashboard updates every 30 seconds, displays historical trends for 7 days, alerts when values exceed thresholds",
      businessValue: "Enables proactive quality management and regulatory compliance",
      complexity: "medium",
      estimatedHours: 80,
      actualHours: 85
    });

    this.createRequirement({
      projectId: "PROJ-001",
      requirementId: "REQ-002",
      title: "Automated Alert System",
      description: "System must automatically generate alerts when water quality parameters exceed EPA standards",
      type: "functional",
      priority: "must_have",
      status: "tested",
      source: "Compliance Manager",
      acceptanceCriteria: "Alerts generated within 60 seconds, notifications sent via email and SMS, escalation after 15 minutes",
      businessValue: "Ensures rapid response to quality issues and regulatory compliance",
      complexity: "high",
      estimatedHours: 120,
      actualHours: 95
    });

    // Sample test cases
    this.createTestCase({
      projectId: "PROJ-001",
      requirementId: "REQ-001",
      testCaseId: "TC-001",
      title: "Dashboard Data Refresh Test",
      description: "Verify dashboard updates with fresh data every 30 seconds",
      type: "functional",
      priority: "high",
      status: "passed",
      preconditions: "Dashboard is loaded and connected to data source",
      testSteps: [
        { step: 1, action: "Load dashboard page", expected: "Dashboard loads successfully" },
        { step: 2, action: "Wait 30 seconds", expected: "Data refreshes automatically" },
        { step: 3, action: "Verify timestamp updated", expected: "Last updated timestamp shows current time" }
      ],
      expectedResult: "Dashboard shows fresh data with updated timestamp",
      actualResult: "Data refreshed successfully within 28 seconds",
      executedBy: "QA Team",
      executedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      notes: "Test passed, slightly faster than required"
    });

    // Sample UAT session
    this.createUatSession({
      projectId: "PROJ-001",
      sessionId: "UAT-001",
      name: "Water Quality Dashboard UAT - Phase 1",
      description: "User acceptance testing for basic dashboard functionality with operations team",
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      status: "completed",
      participants: [
        { name: "John Martinez", role: "Operations Supervisor", department: "Operations", email: "j.martinez@waterutil.gov" },
        { name: "Lisa Wong", role: "Field Technician", department: "Quality Control", email: "l.wong@waterutil.gov" },
        { name: "Robert Kim", role: "System Administrator", department: "IT", email: "r.kim@waterutil.gov" }
      ],
      testCases: ["TC-001"],
      feedback: [
        {
          participant: "John Martinez",
          rating: 4,
          comments: "Interface is intuitive, but alerts need to be more prominent",
          issues: ["Alert visibility needs improvement", "Need mobile app access"]
        },
        {
          participant: "Lisa Wong", 
          rating: 5,
          comments: "Excellent real-time updates, much better than old system",
          issues: []
        }
      ],
      overallRating: 4.3,
      approved: true,
      approvedBy: "John Martinez",
      approvedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      notes: "Approved with minor enhancements for alert visibility"
    });

    // Sample stakeholders
    this.createStakeholder({
      projectId: "PROJ-001",
      name: "Augustine Ogelo",
      role: "Project Manager",
      department: "MIS",
      email: "a.ogelo@waterutil.gov",
      phone: "555-0101",
      influence: "high",
      interest: "high",
      communicationPreference: "email"
    });

    this.createStakeholder({
      projectId: "PROJ-001",
      name: "Michael Thompson",
      role: "Water Quality Supervisor",
      department: "Operations",
      email: "m.thompson@waterutil.gov",
      phone: "555-0102",
      influence: "high",
      interest: "high",
      communicationPreference: "phone"
    });

    // Sample risk assessments
    this.createRiskAssessment({
      projectId: "PROJ-001",
      riskId: "RISK-001",
      title: "Data Integration Complexity",
      description: "Legacy SCADA system integration may require custom interfaces and data transformation",
      category: "technical",
      probability: "medium",
      impact: "high",
      riskLevel: "high",
      status: "mitigating",
      mitigation: "Engage SCADA vendor for API development, allocate additional integration time",
      contingency: "Implement manual data entry interface as backup",
      owner: "Augustine Ogelo",
      reviewDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    });

    // Sample cost estimates
    this.createCostEstimate({
      projectId: "PROJ-001",
      category: "labor",
      item: "Senior Developer",
      description: "Full-stack developer for 6 months",
      quantity: 6,
      unitCost: 12000,
      totalCost: 72000,
      contingency: 10,
      finalCost: 79200,
      vendor: "Internal Staff"
    });

    this.createCostEstimate({
      projectId: "PROJ-001",
      category: "software",
      item: "Database Monitoring Tools",
      description: "PostgreSQL monitoring and analytics software licenses",
      quantity: 1,
      unitCost: 15000,
      totalCost: 15000,
      contingency: 5,
      finalCost: 15750,
      vendor: "DataDog"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser,
      role: insertUser.role || "analyst",
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getWaterUsage(filters?: { startDate?: Date; endDate?: Date; location?: string }): Promise<WaterUsage[]> {
    let usage = Array.from(this.waterUsage.values());
    
    if (filters) {
      if (filters.startDate) {
        usage = usage.filter(u => u.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        usage = usage.filter(u => u.timestamp <= filters.endDate!);
      }
      if (filters.location) {
        usage = usage.filter(u => u.location.includes(filters.location!));
      }
    }
    
    return usage.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createWaterUsage(usage: InsertWaterUsage): Promise<WaterUsage> {
    const id = this.currentId++;
    const newUsage: WaterUsage = { 
      ...usage, 
      id,
      temperature: usage.temperature || null,
      qualityMetrics: usage.qualityMetrics || null
    };
    this.waterUsage.set(id, newUsage);
    return newUsage;
  }

  async getUsageStatistics(): Promise<{
    totalToday: number;
    totalYesterday: number;
    averagePressure: number;
    peakUsageTime: string;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const usage = Array.from(this.waterUsage.values());
    const todayUsage = usage.filter(u => u.timestamp >= today);
    const yesterdayUsage = usage.filter(u => u.timestamp >= yesterday && u.timestamp < today);
    
    return {
      totalToday: todayUsage.reduce((sum, u) => sum + u.gallons, 0),
      totalYesterday: yesterdayUsage.reduce((sum, u) => sum + u.gallons, 0),
      averagePressure: usage.reduce((sum, u) => sum + u.pressure, 0) / usage.length,
      peakUsageTime: "2:00 PM"
    };
  }

  async getLeaks(status?: string): Promise<Leak[]> {
    let leaks = Array.from(this.leaks.values());
    if (status) {
      leaks = leaks.filter(l => l.status === status);
    }
    return leaks.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  async createLeak(leak: InsertLeak): Promise<Leak> {
    const id = this.currentId++;
    const newLeak: Leak = { 
      ...leak, 
      id,
      status: leak.status || "active",
      resolvedAt: leak.resolvedAt || null,
      estimatedGallonsLost: leak.estimatedGallonsLost || null,
      assignedTechnician: leak.assignedTechnician || null,
      notes: leak.notes || null
    };
    this.leaks.set(id, newLeak);
    
    // Create alert for new leak
    await this.createAlert({
      type: "leak",
      severity: leak.severity === "critical" ? "critical" : "warning",
      location: leak.location,
      message: `Leak Detected at ${leak.location}`,
      timestamp: leak.detectedAt,
      isRead: false
    });
    
    return newLeak;
  }

  async updateLeak(id: number, updates: Partial<Leak>): Promise<Leak | undefined> {
    const leak = this.leaks.get(id);
    if (!leak) return undefined;
    
    const updated = { ...leak, ...updates };
    this.leaks.set(id, updated);
    return updated;
  }

  async getActiveLeaksCount(): Promise<number> {
    return Array.from(this.leaks.values()).filter(l => l.status === "active").length;
  }

  async getMaintenance(filters?: { status?: string; date?: Date }): Promise<Maintenance[]> {
    let tasks = Array.from(this.maintenance.values());
    
    if (filters) {
      if (filters.status) {
        tasks = tasks.filter(m => m.status === filters.status);
      }
      if (filters.date) {
        const filterDate = new Date(filters.date.getFullYear(), filters.date.getMonth(), filters.date.getDate());
        const nextDay = new Date(filterDate.getTime() + 24 * 60 * 60 * 1000);
        tasks = tasks.filter(m => m.scheduledDate >= filterDate && m.scheduledDate < nextDay);
      }
    }
    
    return tasks.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }

  async createMaintenance(task: InsertMaintenance): Promise<Maintenance> {
    const id = this.currentId++;
    const newTask: Maintenance = { 
      ...task, 
      id,
      status: task.status || "pending",
      completedDate: task.completedDate || null,
      estimatedDuration: task.estimatedDuration || null,
      notes: task.notes || null,
      cost: task.cost || null
    };
    this.maintenance.set(id, newTask);
    return newTask;
  }

  async updateMaintenance(id: number, updates: Partial<Maintenance>): Promise<Maintenance | undefined> {
    const task = this.maintenance.get(id);
    if (!task) return undefined;
    
    const updated = { ...task, ...updates };
    this.maintenance.set(id, updated);
    return updated;
  }

  async getTodaysMaintenance(): Promise<Maintenance[]> {
    return this.getMaintenance({ date: new Date() });
  }

  async getPendingMaintenanceCount(): Promise<number> {
    return Array.from(this.maintenance.values()).filter(m => m.status === "pending").length;
  }

  async getAlerts(unreadOnly?: boolean): Promise<Alert[]> {
    let alerts = Array.from(this.alerts.values());
    if (unreadOnly) {
      alerts = alerts.filter(a => !a.isRead);
    }
    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.currentId++;
    const newAlert: Alert = { 
      ...alert, 
      id,
      isRead: alert.isRead || false,
      resolvedAt: alert.resolvedAt || null
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  async markAlertAsRead(id: number): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.isRead = true;
      this.alerts.set(id, alert);
    }
  }

  async getUnreadAlertsCount(): Promise<number> {
    return Array.from(this.alerts.values()).filter(a => !a.isRead).length;
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentId++;
    const newActivity: Activity = { 
      ...activity, 
      id,
      technician: activity.technician || null,
      details: activity.details || null
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  // Project management methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => 
      b.createdAt!.getTime() - a.createdAt!.getTime()
    );
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectByProjectId(projectId: string): Promise<Project | undefined> {
    return Array.from(this.projects.values()).find(p => p.projectId === projectId);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentId++;
    const newProject: Project = {
      ...project,
      id,
      status: project.status || "planning",
      priority: project.priority || "medium",
      methodology: project.methodology || "agile",
      percentComplete: project.percentComplete || 0,
      startDate: project.startDate || null,
      endDate: project.endDate || null,
      actualStartDate: project.actualStartDate || null,
      actualEndDate: project.actualEndDate || null,
      sponsor: project.sponsor || null,
      budget: project.budget || null,
      actualCost: project.actualCost || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updated = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updated);
    return updated;
  }

  async getRequirements(projectId?: string): Promise<Requirement[]> {
    let requirements = Array.from(this.requirements.values());
    if (projectId) {
      requirements = requirements.filter(r => r.projectId === projectId);
    }
    return requirements.sort((a, b) => a.requirementId.localeCompare(b.requirementId));
  }

  async getRequirement(id: number): Promise<Requirement | undefined> {
    return this.requirements.get(id);
  }

  async createRequirement(requirement: InsertRequirement): Promise<Requirement> {
    const id = this.currentId++;
    const newRequirement: Requirement = {
      ...requirement,
      id,
      type: requirement.type || "functional",
      priority: requirement.priority || "medium",
      status: requirement.status || "draft",
      source: requirement.source || null,
      acceptanceCriteria: requirement.acceptanceCriteria || null,
      businessValue: requirement.businessValue || null,
      complexity: requirement.complexity || "medium",
      estimatedHours: requirement.estimatedHours || null,
      actualHours: requirement.actualHours || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.requirements.set(id, newRequirement);
    return newRequirement;
  }

  async updateRequirement(id: number, updates: Partial<Requirement>): Promise<Requirement | undefined> {
    const requirement = this.requirements.get(id);
    if (!requirement) return undefined;
    
    const updated = { ...requirement, ...updates, updatedAt: new Date() };
    this.requirements.set(id, updated);
    return updated;
  }

  async getTestCases(projectId?: string, requirementId?: string): Promise<TestCase[]> {
    let testCases = Array.from(this.testCases.values());
    if (projectId) {
      testCases = testCases.filter(tc => tc.projectId === projectId);
    }
    if (requirementId) {
      testCases = testCases.filter(tc => tc.requirementId === requirementId);
    }
    return testCases.sort((a, b) => a.testCaseId.localeCompare(b.testCaseId));
  }

  async getTestCase(id: number): Promise<TestCase | undefined> {
    return this.testCases.get(id);
  }

  async createTestCase(testCase: InsertTestCase): Promise<TestCase> {
    const id = this.currentId++;
    const newTestCase: TestCase = {
      ...testCase,
      id,
      requirementId: testCase.requirementId || null,
      type: testCase.type || "functional",
      priority: testCase.priority || "medium",
      status: testCase.status || "not_executed",
      preconditions: testCase.preconditions || null,
      testSteps: testCase.testSteps || null,
      expectedResult: testCase.expectedResult || null,
      actualResult: testCase.actualResult || null,
      testData: testCase.testData || null,
      executedBy: testCase.executedBy || null,
      executedAt: testCase.executedAt || null,
      defectId: testCase.defectId || null,
      notes: testCase.notes || null,
      createdAt: new Date()
    };
    this.testCases.set(id, newTestCase);
    return newTestCase;
  }

  async updateTestCase(id: number, updates: Partial<TestCase>): Promise<TestCase | undefined> {
    const testCase = this.testCases.get(id);
    if (!testCase) return undefined;
    
    const updated = { ...testCase, ...updates };
    if (updates.status && updates.status !== 'not_executed') {
      updated.executedAt = new Date();
    }
    this.testCases.set(id, updated);
    return updated;
  }

  async getUatSessions(projectId?: string): Promise<UatSession[]> {
    let sessions = Array.from(this.uatSessions.values());
    if (projectId) {
      sessions = sessions.filter(s => s.projectId === projectId);
    }
    return sessions.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getUatSession(id: number): Promise<UatSession | undefined> {
    return this.uatSessions.get(id);
  }

  async createUatSession(session: InsertUatSession): Promise<UatSession> {
    const id = this.currentId++;
    const newSession: UatSession = {
      ...session,
      id,
      status: session.status || "planning",
      participants: session.participants || null,
      testCases: session.testCases || null,
      feedback: session.feedback || null,
      overallRating: session.overallRating || null,
      approved: session.approved || false,
      approvedBy: session.approvedBy || null,
      approvedAt: session.approvedAt || null,
      notes: session.notes || null,
      createdAt: new Date()
    };
    this.uatSessions.set(id, newSession);
    return newSession;
  }

  async updateUatSession(id: number, updates: Partial<UatSession>): Promise<UatSession | undefined> {
    const session = this.uatSessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates };
    this.uatSessions.set(id, updated);
    return updated;
  }

  async getStakeholders(projectId?: string): Promise<Stakeholder[]> {
    let stakeholders = Array.from(this.stakeholders.values());
    if (projectId) {
      stakeholders = stakeholders.filter(s => s.projectId === projectId);
    }
    return stakeholders.sort((a, b) => a.name.localeCompare(b.name));
  }

  async createStakeholder(stakeholder: InsertStakeholder): Promise<Stakeholder> {
    const id = this.currentId++;
    const newStakeholder: Stakeholder = {
      ...stakeholder,
      id,
      department: stakeholder.department || null,
      email: stakeholder.email || null,
      phone: stakeholder.phone || null,
      influence: stakeholder.influence || "medium",
      interest: stakeholder.interest || "medium",
      communicationPreference: stakeholder.communicationPreference || "email",
      notes: stakeholder.notes || null,
      createdAt: new Date()
    };
    this.stakeholders.set(id, newStakeholder);
    return newStakeholder;
  }

  async updateStakeholder(id: number, updates: Partial<Stakeholder>): Promise<Stakeholder | undefined> {
    const stakeholder = this.stakeholders.get(id);
    if (!stakeholder) return undefined;
    
    const updated = { ...stakeholder, ...updates };
    this.stakeholders.set(id, updated);
    return updated;
  }

  async getRiskAssessments(projectId?: string): Promise<RiskAssessment[]> {
    let risks = Array.from(this.riskAssessments.values());
    if (projectId) {
      risks = risks.filter(r => r.projectId === projectId);
    }
    return risks.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createRiskAssessment(risk: InsertRiskAssessment): Promise<RiskAssessment> {
    const id = this.currentId++;
    const newRisk: RiskAssessment = {
      ...risk,
      id,
      status: risk.status || "identified",
      mitigation: risk.mitigation || null,
      contingency: risk.contingency || null,
      owner: risk.owner || null,
      reviewDate: risk.reviewDate || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.riskAssessments.set(id, newRisk);
    return newRisk;
  }

  async updateRiskAssessment(id: number, updates: Partial<RiskAssessment>): Promise<RiskAssessment | undefined> {
    const risk = this.riskAssessments.get(id);
    if (!risk) return undefined;
    
    const updated = { ...risk, ...updates, updatedAt: new Date() };
    this.riskAssessments.set(id, updated);
    return updated;
  }

  async getCostEstimates(projectId?: string): Promise<CostEstimate[]> {
    let estimates = Array.from(this.costEstimates.values());
    if (projectId) {
      estimates = estimates.filter(e => e.projectId === projectId);
    }
    return estimates.sort((a, b) => a.category.localeCompare(b.category));
  }

  async createCostEstimate(estimate: InsertCostEstimate): Promise<CostEstimate> {
    const id = this.currentId++;
    const newEstimate: CostEstimate = {
      ...estimate,
      id,
      description: estimate.description || null,
      quantity: estimate.quantity || 1,
      contingency: estimate.contingency || 0,
      vendor: estimate.vendor || null,
      notes: estimate.notes || null,
      createdAt: new Date()
    };
    this.costEstimates.set(id, newEstimate);
    return newEstimate;
  }

  async updateCostEstimate(id: number, updates: Partial<CostEstimate>): Promise<CostEstimate | undefined> {
    const estimate = this.costEstimates.get(id);
    if (!estimate) return undefined;
    
    const updated = { ...estimate, ...updates };
    this.costEstimates.set(id, updated);
    return updated;
  }

  async getProjectCostSummary(projectId: string): Promise<{
    totalEstimated: number;
    totalActual: number;
    byCategory: Array<{ category: string; estimated: number; actual: number }>;
  }> {
    const estimates = await this.getCostEstimates(projectId);
    const project = await this.getProjectByProjectId(projectId);
    
    const totalEstimated = estimates.reduce((sum, est) => sum + est.finalCost, 0);
    const totalActual = project?.actualCost || 0;
    
    const byCategory = estimates.reduce((acc, est) => {
      const existing = acc.find(c => c.category === est.category);
      if (existing) {
        existing.estimated += est.finalCost;
      } else {
        acc.push({ category: est.category, estimated: est.finalCost, actual: 0 });
      }
      return acc;
    }, [] as Array<{ category: string; estimated: number; actual: number }>);
    
    return { totalEstimated, totalActual, byCategory };
  }
}

import { db } from "./db";
import { eq, desc, count, sum, avg, and, gte, lte } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || "analyst"
      })
      .returning();
    return user;
  }

  async getWaterUsage(filters?: { startDate?: Date; endDate?: Date; location?: string }): Promise<WaterUsage[]> {
    let query = db.select().from(waterUsage);
    
    const conditions = [];
    if (filters?.startDate) {
      conditions.push(gte(waterUsage.timestamp, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(waterUsage.timestamp, filters.endDate));
    }
    if (filters?.location) {
      conditions.push(eq(waterUsage.location, filters.location));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const usage = await query.orderBy(desc(waterUsage.timestamp));
    return usage;
  }

  async createWaterUsage(usage: InsertWaterUsage): Promise<WaterUsage> {
    const [newUsage] = await db
      .insert(waterUsage)
      .values({
        ...usage,
        temperature: usage.temperature || null,
        qualityMetrics: usage.qualityMetrics || null
      })
      .returning();
    return newUsage;
  }

  async getUsageStatistics(): Promise<{
    totalToday: number;
    totalYesterday: number;
    averagePressure: number;
    peakUsageTime: string;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

    const [todayUsage] = await db
      .select({ total: sum(waterUsage.gallons) })
      .from(waterUsage)
      .where(gte(waterUsage.timestamp, today));

    const [yesterdayUsage] = await db
      .select({ total: sum(waterUsage.gallons) })
      .from(waterUsage)
      .where(and(
        gte(waterUsage.timestamp, yesterday),
        lte(waterUsage.timestamp, today)
      ));

    const [avgPressure] = await db
      .select({ avg: avg(waterUsage.pressure) })
      .from(waterUsage)
      .where(gte(waterUsage.timestamp, yesterday));

    return {
      totalToday: Number(todayUsage.total) || 0,
      totalYesterday: Number(yesterdayUsage.total) || 0,
      averagePressure: Number(avgPressure.avg) || 0,
      peakUsageTime: "10:00 AM" // This would need more complex query in real implementation
    };
  }

  async getLeaks(status?: string): Promise<Leak[]> {
    let query = db.select().from(leaks);
    
    if (status) {
      query = query.where(eq(leaks.status, status)) as any;
    }
    
    const leaksList = await query.orderBy(desc(leaks.detectedAt));
    return leaksList;
  }

  async createLeak(leak: InsertLeak): Promise<Leak> {
    const [newLeak] = await db
      .insert(leaks)
      .values({
        ...leak,
        status: leak.status || "active",
        resolvedAt: leak.resolvedAt || null,
        estimatedGallonsLost: leak.estimatedGallonsLost || null,
        assignedTechnician: leak.assignedTechnician || null,
        notes: leak.notes || null
      })
      .returning();

    // Create alert for new leak
    await this.createAlert({
      type: "leak",
      severity: leak.severity === "critical" ? "critical" : "warning",
      location: leak.location,
      message: `Leak Detected at ${leak.location}`,
      timestamp: leak.detectedAt,
      isRead: false
    });

    return newLeak;
  }

  async updateLeak(id: number, updates: Partial<Leak>): Promise<Leak | undefined> {
    const [updatedLeak] = await db
      .update(leaks)
      .set(updates)
      .where(eq(leaks.id, id))
      .returning();
    return updatedLeak || undefined;
  }

  async getActiveLeaksCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(leaks)
      .where(eq(leaks.status, "active"));
    return result.count;
  }

  async getMaintenance(filters?: { status?: string; date?: Date }): Promise<Maintenance[]> {
    let query = db.select().from(maintenance);
    
    const conditions = [];
    if (filters?.status) {
      conditions.push(eq(maintenance.status, filters.status));
    }
    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(and(
        gte(maintenance.scheduledDate, startOfDay),
        lte(maintenance.scheduledDate, endOfDay)
      ));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const tasks = await query.orderBy(maintenance.scheduledDate);
    return tasks;
  }

  async createMaintenance(task: InsertMaintenance): Promise<Maintenance> {
    const [newTask] = await db
      .insert(maintenance)
      .values({
        ...task,
        scheduledDate: task.scheduledDate || new Date(),
        status: task.status || "pending",
        completedDate: task.completedDate || null,
        estimatedDuration: task.estimatedDuration || null,
        notes: task.notes || null,
        cost: task.cost || null
      })
      .returning();
    return newTask;
  }

  async updateMaintenance(id: number, updates: Partial<Maintenance>): Promise<Maintenance | undefined> {
    const [updatedTask] = await db
      .update(maintenance)
      .set(updates)
      .where(eq(maintenance.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async getTodaysMaintenance(): Promise<Maintenance[]> {
    const today = new Date();
    return this.getMaintenance({ date: today });
  }

  async getPendingMaintenanceCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(maintenance)
      .where(eq(maintenance.status, "pending"));
    return result.count;
  }

  async getAlerts(unreadOnly?: boolean): Promise<Alert[]> {
    let query = db.select().from(alerts);
    
    if (unreadOnly) {
      query = query.where(eq(alerts.isRead, false)) as any;
    }
    
    const alertsList = await query.orderBy(desc(alerts.timestamp));
    return alertsList;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db
      .insert(alerts)
      .values({
        ...alert,
        timestamp: alert.timestamp || new Date(),
        isRead: alert.isRead || false,
        resolvedAt: alert.resolvedAt || null
      })
      .returning();
    return newAlert;
  }

  async markAlertAsRead(id: number): Promise<void> {
    await db
      .update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, id));
  }

  async getUnreadAlertsCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(alerts)
      .where(eq(alerts.isRead, false));
    return result.count;
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    const activitiesList = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.timestamp))
      .limit(limit);
    return activitiesList;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values({
        ...activity,
        timestamp: activity.timestamp || new Date(),
        technician: activity.technician || null,
        details: activity.details || null
      })
      .returning();
    return newActivity;
  }

  // Project management methods
  async getProjects(): Promise<Project[]> {
    const projectsList = await db.select().from(projects).orderBy(desc(projects.createdAt));
    return projectsList;
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectByProjectId(projectId: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.projectId, projectId));
    return project || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values({
        ...project,
        status: project.status || "planning",
        priority: project.priority || "medium",
        methodology: project.methodology || "agile",
        percentComplete: project.percentComplete || 0,
        startDate: project.startDate || null,
        endDate: project.endDate || null,
        actualStartDate: project.actualStartDate || null,
        actualEndDate: project.actualEndDate || null,
        sponsor: project.sponsor || null,
        budget: project.budget || null,
        actualCost: project.actualCost || null
      })
      .returning();
    return newProject;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return updatedProject || undefined;
  }

  async getRequirements(projectId?: string): Promise<Requirement[]> {
    let query = db.select().from(requirements);
    
    if (projectId) {
      query = query.where(eq(requirements.projectId, projectId)) as any;
    }
    
    const requirementsList = await query.orderBy(requirements.requirementId);
    return requirementsList;
  }

  async getRequirement(id: number): Promise<Requirement | undefined> {
    const [requirement] = await db.select().from(requirements).where(eq(requirements.id, id));
    return requirement || undefined;
  }

  async createRequirement(requirement: InsertRequirement): Promise<Requirement> {
    const [newRequirement] = await db
      .insert(requirements)
      .values({
        ...requirement,
        type: requirement.type || "functional",
        priority: requirement.priority || "medium",
        status: requirement.status || "draft",
        source: requirement.source || null,
        acceptanceCriteria: requirement.acceptanceCriteria || null,
        businessValue: requirement.businessValue || null,
        complexity: requirement.complexity || "medium",
        estimatedHours: requirement.estimatedHours || null,
        actualHours: requirement.actualHours || null
      })
      .returning();
    return newRequirement;
  }

  async updateRequirement(id: number, updates: Partial<Requirement>): Promise<Requirement | undefined> {
    const [updatedRequirement] = await db
      .update(requirements)
      .set(updates)
      .where(eq(requirements.id, id))
      .returning();
    return updatedRequirement || undefined;
  }

  async getTestCases(projectId?: string, requirementId?: string): Promise<TestCase[]> {
    let query = db.select().from(testCases);
    
    const conditions = [];
    if (projectId) {
      conditions.push(eq(testCases.projectId, projectId));
    }
    if (requirementId) {
      conditions.push(eq(testCases.requirementId, requirementId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const testCasesList = await query.orderBy(testCases.testCaseId);
    return testCasesList;
  }

  async getTestCase(id: number): Promise<TestCase | undefined> {
    const [testCase] = await db.select().from(testCases).where(eq(testCases.id, id));
    return testCase || undefined;
  }

  async createTestCase(testCase: InsertTestCase): Promise<TestCase> {
    const [newTestCase] = await db
      .insert(testCases)
      .values({
        ...testCase,
        requirementId: testCase.requirementId || null,
        type: testCase.type || "functional",
        priority: testCase.priority || "medium",
        status: testCase.status || "not_executed",
        preconditions: testCase.preconditions || null,
        testSteps: testCase.testSteps || null,
        expectedResult: testCase.expectedResult || null,
        actualResult: testCase.actualResult || null,
        testData: testCase.testData || null,
        executedBy: testCase.executedBy || null,
        executedAt: testCase.executedAt || null,
        defectId: testCase.defectId || null,
        notes: testCase.notes || null
      })
      .returning();
    return newTestCase;
  }

  async updateTestCase(id: number, updates: Partial<TestCase>): Promise<TestCase | undefined> {
    const updateData = { ...updates };
    if (updates.status && updates.status !== 'not_executed') {
      updateData.executedAt = new Date();
    }
    
    const [updatedTestCase] = await db
      .update(testCases)
      .set(updateData)
      .where(eq(testCases.id, id))
      .returning();
    return updatedTestCase || undefined;
  }

  async getUatSessions(projectId?: string): Promise<UatSession[]> {
    let query = db.select().from(uatSessions);
    
    if (projectId) {
      query = query.where(eq(uatSessions.projectId, projectId)) as any;
    }
    
    const sessions = await query.orderBy(desc(uatSessions.createdAt));
    return sessions;
  }

  async getUatSession(id: number): Promise<UatSession | undefined> {
    const [session] = await db.select().from(uatSessions).where(eq(uatSessions.id, id));
    return session || undefined;
  }

  async createUatSession(session: InsertUatSession): Promise<UatSession> {
    const [newSession] = await db
      .insert(uatSessions)
      .values({
        ...session,
        status: session.status || "planning",
        participants: session.participants || null,
        testCases: session.testCases || null,
        feedback: session.feedback || null,
        overallRating: session.overallRating || null,
        approved: session.approved || false,
        approvedBy: session.approvedBy || null,
        approvedAt: session.approvedAt || null,
        notes: session.notes || null
      })
      .returning();
    return newSession;
  }

  async updateUatSession(id: number, updates: Partial<UatSession>): Promise<UatSession | undefined> {
    const [updatedSession] = await db
      .update(uatSessions)
      .set(updates)
      .where(eq(uatSessions.id, id))
      .returning();
    return updatedSession || undefined;
  }

  async getStakeholders(projectId?: string): Promise<Stakeholder[]> {
    let query = db.select().from(stakeholders);
    
    if (projectId) {
      query = query.where(eq(stakeholders.projectId, projectId)) as any;
    }
    
    const stakeholdersList = await query.orderBy(stakeholders.name);
    return stakeholdersList;
  }

  async createStakeholder(stakeholder: InsertStakeholder): Promise<Stakeholder> {
    const [newStakeholder] = await db
      .insert(stakeholders)
      .values({
        ...stakeholder,
        department: stakeholder.department || null,
        email: stakeholder.email || null,
        phone: stakeholder.phone || null,
        influence: stakeholder.influence || "medium",
        interest: stakeholder.interest || "medium",
        communicationPreference: stakeholder.communicationPreference || "email",
        notes: stakeholder.notes || null
      })
      .returning();
    return newStakeholder;
  }

  async updateStakeholder(id: number, updates: Partial<Stakeholder>): Promise<Stakeholder | undefined> {
    const [updatedStakeholder] = await db
      .update(stakeholders)
      .set(updates)
      .where(eq(stakeholders.id, id))
      .returning();
    return updatedStakeholder || undefined;
  }

  async getRiskAssessments(projectId?: string): Promise<RiskAssessment[]> {
    let query = db.select().from(riskAssessments);
    
    if (projectId) {
      query = query.where(eq(riskAssessments.projectId, projectId)) as any;
    }
    
    const risks = await query.orderBy(desc(riskAssessments.createdAt));
    return risks;
  }

  async createRiskAssessment(risk: InsertRiskAssessment): Promise<RiskAssessment> {
    const [newRisk] = await db
      .insert(riskAssessments)
      .values({
        ...risk,
        status: risk.status || "identified",
        mitigation: risk.mitigation || null,
        contingency: risk.contingency || null,
        owner: risk.owner || null,
        reviewDate: risk.reviewDate || null
      })
      .returning();
    return newRisk;
  }

  async updateRiskAssessment(id: number, updates: Partial<RiskAssessment>): Promise<RiskAssessment | undefined> {
    const [updatedRisk] = await db
      .update(riskAssessments)
      .set(updates)
      .where(eq(riskAssessments.id, id))
      .returning();
    return updatedRisk || undefined;
  }

  async getCostEstimates(projectId?: string): Promise<CostEstimate[]> {
    let query = db.select().from(costEstimates);
    
    if (projectId) {
      query = query.where(eq(costEstimates.projectId, projectId)) as any;
    }
    
    const estimates = await query.orderBy(costEstimates.category);
    return estimates;
  }

  async createCostEstimate(estimate: InsertCostEstimate): Promise<CostEstimate> {
    const [newEstimate] = await db
      .insert(costEstimates)
      .values({
        ...estimate,
        description: estimate.description || null,
        quantity: estimate.quantity || 1,
        contingency: estimate.contingency || 0,
        vendor: estimate.vendor || null,
        notes: estimate.notes || null
      })
      .returning();
    return newEstimate;
  }

  async updateCostEstimate(id: number, updates: Partial<CostEstimate>): Promise<CostEstimate | undefined> {
    const [updatedEstimate] = await db
      .update(costEstimates)
      .set(updates)
      .where(eq(costEstimates.id, id))
      .returning();
    return updatedEstimate || undefined;
  }

  async getProjectCostSummary(projectId: string): Promise<{
    totalEstimated: number;
    totalActual: number;
    byCategory: Array<{ category: string; estimated: number; actual: number }>;
  }> {
    const estimates = await this.getCostEstimates(projectId);
    const project = await this.getProjectByProjectId(projectId);
    
    const totalEstimated = estimates.reduce((sum, est) => sum + est.finalCost, 0);
    const totalActual = project?.actualCost || 0;
    
    const byCategory = estimates.reduce((acc, est) => {
      const existing = acc.find(c => c.category === est.category);
      if (existing) {
        existing.estimated += est.finalCost;
      } else {
        acc.push({ category: est.category, estimated: est.finalCost, actual: 0 });
      }
      return acc;
    }, [] as Array<{ category: string; estimated: number; actual: number }>);
    
    return { totalEstimated, totalActual, byCategory };
  }
}

export const storage = new DatabaseStorage();
