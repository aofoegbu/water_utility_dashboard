import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWaterUsageSchema, insertLeakSchema, insertMaintenanceSchema, insertAlertSchema, insertActivitySchema, 
  loginSchema, registerSchema,
  insertProjectSchema, insertRequirementSchema, insertTestCaseSchema, insertUatSessionSchema,
  insertStakeholderSchema, insertRiskAssessmentSchema, insertCostEstimateSchema
} from "@shared/schema";
import { generatePDFReport, generateCSVReport } from "./services/report-generator";
import bcrypt from "bcrypt";
import session from "express-session";

// Session configuration
declare module 'express-session' {
  interface SessionData {
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
      fullName: string;
      department: string;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: true, // Create session for unauthenticated users
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true, // Keep httpOnly for security
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax', // Lax is better for same-origin
      domain: undefined, // Don't set domain for localhost
    }
  }));

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  // Authentication routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        role: 'analyst'
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Set session
      req.session.user = userWithoutPassword;
      
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }
        
        res.status(201).json({ 
          message: 'User registered successfully',
          user: userWithoutPassword
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        message: 'Registration failed',
        details: error instanceof Error ? error.message : error 
      });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check password
      const validPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      
      // Set session
      req.session.user = userWithoutPassword;
      
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session save failed' });
        }
        
        res.json({ 
          message: 'Login successful',
          user: userWithoutPassword
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ 
        message: 'Login failed',
        details: error instanceof Error ? error.message : error 
      });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  app.get('/api/auth/user', (req: Request, res: Response) => {
    if (req.session.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });
  
  // Dashboard KPI endpoints
  app.get("/api/dashboard/kpis", async (req: Request, res: Response) => {
    try {
      const [usageStats, activeLeaks, pendingMaintenance, unreadAlerts] = await Promise.all([
        storage.getUsageStatistics(),
        storage.getActiveLeaksCount(),
        storage.getPendingMaintenanceCount(),
        storage.getUnreadAlertsCount()
      ]);

      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const usageChange = usageStats.totalYesterday > 0 
        ? ((usageStats.totalToday - usageStats.totalYesterday) / usageStats.totalYesterday * 100)
        : 0;

      res.json({
        totalUsageToday: (usageStats.totalToday / 1000000).toFixed(1),
        usageChange: usageChange.toFixed(1),
        activeLeaks,
        systemPressure: Math.round(usageStats.averagePressure),
        pendingMaintenance,
        unreadAlerts
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard KPIs" });
    }
  });

  // Water usage endpoints
  app.get("/api/water-usage", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, location } = req.query;
      const filters: any = {};
      
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (location) filters.location = location as string;
      
      const usage = await storage.getWaterUsage(filters);
      res.json(usage);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch water usage data" });
    }
  });

  app.post("/api/water-usage", async (req: Request, res: Response) => {
    try {
      const processedData = {
        ...req.body,
        timestamp: req.body.timestamp || new Date()
      };
      
      const validatedData = insertWaterUsageSchema.parse(processedData);
      const usage = await storage.createWaterUsage(validatedData);
      res.status(201).json(usage);
    } catch (error) {
      console.error("Water usage validation error:", error);
      res.status(400).json({ message: "Invalid water usage data", details: error instanceof Error ? error.message : error });
    }
  });

  app.get("/api/water-usage/chart-data/:period?", async (req: Request, res: Response) => {
    try {
      const period = req.params.period || "7D";
      const endDate = new Date();
      let startDate: Date;
      
      // Parse the period parameter
      if (period === "7D") {
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === "30D") {
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      const usage = await storage.getWaterUsage({ startDate, endDate });
      
      // Group by day and calculate daily totals
      const dailyUsage = usage.reduce((acc, record) => {
        const day = record.timestamp.toLocaleDateString('en-US', { weekday: 'short' });
        if (!acc[day]) acc[day] = 0;
        acc[day] += record.gallons / 1000000; // Convert to millions
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.entries(dailyUsage).map(([day, gallons]) => ({
        day,
        gallons: parseFloat(gallons.toFixed(1))
      }));

      res.json(chartData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Leak management endpoints
  app.get("/api/leaks", async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const leaks = await storage.getLeaks(status as string);
      res.json(leaks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaks" });
    }
  });

  app.post("/api/leaks", async (req: Request, res: Response) => {
    try {
      const processedData = {
        ...req.body,
        detectedAt: req.body.detectedAt || new Date(),
        resolvedAt: req.body.resolvedAt || null
      };
      
      const validatedData = insertLeakSchema.parse(processedData);
      const leak = await storage.createLeak(validatedData);
      res.status(201).json(leak);
    } catch (error) {
      console.error("Leak validation error:", error);
      res.status(400).json({ message: "Invalid leak data", details: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/leaks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const leak = await storage.updateLeak(id, updates);
      
      if (!leak) {
        return res.status(404).json({ message: "Leak not found" });
      }
      
      res.json(leak);
    } catch (error) {
      res.status(400).json({ message: "Failed to update leak" });
    }
  });

  // Maintenance endpoints
  app.get("/api/maintenance", async (req: Request, res: Response) => {
    try {
      const { status, date } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status as string;
      if (date) filters.date = new Date(date as string);
      
      const maintenance = await storage.getMaintenance(filters);
      res.json(maintenance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch maintenance tasks" });
    }
  });

  app.get("/api/maintenance/today", async (req: Request, res: Response) => {
    try {
      const tasks = await storage.getTodaysMaintenance();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's maintenance" });
    }
  });

  app.post("/api/maintenance", async (req: Request, res: Response) => {
    try {
      const processedData = {
        ...req.body,
        scheduledDate: req.body.scheduledDate || new Date(),
        completedDate: req.body.completedDate || null
      };
      
      const validatedData = insertMaintenanceSchema.parse(processedData);
      const task = await storage.createMaintenance(validatedData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Maintenance validation error:", error);
      res.status(400).json({ message: "Invalid maintenance data", details: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/maintenance/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid maintenance task ID" });
      }
      
      // Convert date strings to Date objects for database compatibility
      const processedUpdates = { ...updates };
      if (processedUpdates.completedDate && typeof processedUpdates.completedDate === 'string') {
        processedUpdates.completedDate = new Date(processedUpdates.completedDate);
      }
      if (processedUpdates.scheduledDate && typeof processedUpdates.scheduledDate === 'string') {
        processedUpdates.scheduledDate = new Date(processedUpdates.scheduledDate);
      }
      
      const task = await storage.updateMaintenance(id, processedUpdates);
      
      if (!task) {
        return res.status(404).json({ message: "Maintenance task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error('Maintenance update error:', error);
      res.status(400).json({ 
        message: "Failed to update maintenance task",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Alerts endpoints
  app.get("/api/alerts", async (req: Request, res: Response) => {
    try {
      const { unreadOnly } = req.query;
      const alerts = await storage.getAlerts(unreadOnly === 'true');
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req: Request, res: Response) => {
    try {
      const processedData = {
        ...req.body,
        timestamp: req.body.timestamp || new Date(),
        resolvedAt: req.body.resolvedAt || null
      };
      
      const validatedData = insertAlertSchema.parse(processedData);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      console.error("Alert validation error:", error);
      res.status(400).json({ message: "Invalid alert data", details: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/alerts/:id/read", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markAlertAsRead(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to mark alert as read" });
    }
  });

  // Activities endpoint
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const { limit } = req.query;
      const activities = await storage.getRecentActivities(
        limit ? parseInt(limit as string) : 10
      );
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req: Request, res: Response) => {
    try {
      const processedData = {
        ...req.body,
        timestamp: req.body.timestamp || new Date()
      };
      
      const validatedData = insertActivitySchema.parse(processedData);
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      console.error("Activity validation error:", error);
      res.status(400).json({ message: "Invalid activity data", details: error instanceof Error ? error.message : error });
    }
  });

  // ===== PROJECT MANAGEMENT ROUTES =====
  
  // Projects endpoints
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Project validation error:", error);
      res.status(400).json({ message: "Invalid project data", details: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateProject(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Failed to update project" });
    }
  });

  // Requirements endpoints
  app.get("/api/requirements", async (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;
      const requirements = await storage.getRequirements(projectId as string);
      res.json(requirements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch requirements" });
    }
  });

  app.post("/api/requirements", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRequirementSchema.parse(req.body);
      const requirement = await storage.createRequirement(validatedData);
      res.status(201).json(requirement);
    } catch (error) {
      console.error("Requirement validation error:", error);
      res.status(400).json({ message: "Invalid requirement data", details: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/requirements/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateRequirement(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Requirement not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Failed to update requirement" });
    }
  });

  // Test cases endpoints
  app.get("/api/test-cases", async (req: Request, res: Response) => {
    try {
      const { projectId, requirementId } = req.query;
      const testCases = await storage.getTestCases(projectId as string, requirementId as string);
      res.json(testCases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch test cases" });
    }
  });

  app.post("/api/test-cases", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTestCaseSchema.parse(req.body);
      const testCase = await storage.createTestCase(validatedData);
      res.status(201).json(testCase);
    } catch (error) {
      console.error("Test case validation error:", error);
      res.status(400).json({ message: "Invalid test case data", details: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/test-cases/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateTestCase(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Test case not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Failed to update test case" });
    }
  });

  // UAT sessions endpoints
  app.get("/api/uat-sessions", async (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;
      const sessions = await storage.getUatSessions(projectId as string);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch UAT sessions" });
    }
  });

  app.post("/api/uat-sessions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUatSessionSchema.parse(req.body);
      const session = await storage.createUatSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      console.error("UAT session validation error:", error);
      res.status(400).json({ message: "Invalid UAT session data", details: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/uat-sessions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateUatSession(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "UAT session not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Failed to update UAT session" });
    }
  });

  // Stakeholders endpoints
  app.get("/api/stakeholders", async (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;
      const stakeholders = await storage.getStakeholders(projectId as string);
      res.json(stakeholders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stakeholders" });
    }
  });

  app.post("/api/stakeholders", async (req: Request, res: Response) => {
    try {
      const validatedData = insertStakeholderSchema.parse(req.body);
      const stakeholder = await storage.createStakeholder(validatedData);
      res.status(201).json(stakeholder);
    } catch (error) {
      console.error("Stakeholder validation error:", error);
      res.status(400).json({ message: "Invalid stakeholder data", details: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/stakeholders/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateStakeholder(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Stakeholder not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Failed to update stakeholder" });
    }
  });

  // Risk assessments endpoints
  app.get("/api/risks", async (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;
      const risks = await storage.getRiskAssessments(projectId as string);
      res.json(risks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch risk assessments" });
    }
  });

  app.post("/api/risks", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRiskAssessmentSchema.parse(req.body);
      const risk = await storage.createRiskAssessment(validatedData);
      res.status(201).json(risk);
    } catch (error) {
      console.error("Risk assessment validation error:", error);
      res.status(400).json({ message: "Invalid risk data", details: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/risks/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateRiskAssessment(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Risk assessment not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Failed to update risk assessment" });
    }
  });

  // Cost estimates endpoints
  app.get("/api/cost-estimates", async (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;
      const estimates = await storage.getCostEstimates(projectId as string);
      res.json(estimates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cost estimates" });
    }
  });

  app.post("/api/cost-estimates", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCostEstimateSchema.parse(req.body);
      const estimate = await storage.createCostEstimate(validatedData);
      res.status(201).json(estimate);
    } catch (error) {
      console.error("Cost estimate validation error:", error);
      res.status(400).json({ message: "Invalid cost estimate data", details: error instanceof Error ? error.message : error });
    }
  });

  app.patch("/api/cost-estimates/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateCostEstimate(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Cost estimate not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: "Failed to update cost estimate" });
    }
  });

  // Project cost summary endpoint
  app.get("/api/projects/:projectId/cost-summary", async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const costSummary = await storage.getProjectCostSummary(projectId);
      res.json(costSummary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project cost summary" });
    }
  });

  // Report generation endpoints
  app.post("/api/reports/generate", async (req: Request, res: Response) => {
    try {
      const { reportType, format, startDate, endDate } = req.body;
      
      if (!reportType || !format) {
        return res.status(400).json({ message: "Report type and format are required" });
      }

      const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      let reportData;
      let filename;

      switch (format.toLowerCase()) {
        case 'pdf':
          reportData = await generatePDFReport(reportType, start, end, storage);
          filename = `${reportType}_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.pdf`;
          res.setHeader('Content-Type', 'application/pdf');
          break;
        case 'csv':
          reportData = await generateCSVReport(reportType, start, end, storage);
          filename = `${reportType}_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.csv`;
          res.setHeader('Content-Type', 'text/csv');
          break;
        default:
          return res.status(400).json({ message: "Unsupported format" });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(reportData);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
