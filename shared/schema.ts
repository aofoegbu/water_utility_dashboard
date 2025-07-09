import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for role-based access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("analyst"), // analyst, supervisor, admin
  fullName: text("full_name").notNull(),
  department: text("department").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Water usage metrics
export const waterUsage = pgTable("water_usage", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  gallons: real("gallons").notNull(),
  pressure: real("pressure").notNull(), // PSI
  flowRate: real("flow_rate").notNull(), // GPM
  temperature: real("temperature"), // Fahrenheit
  qualityMetrics: jsonb("quality_metrics"), // pH, chlorine, etc.
});

// Leak detection alerts
export const leaks = pgTable("leaks", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  severity: text("severity").notNull(), // low, medium, high, critical
  status: text("status").notNull().default("active"), // active, investigating, resolved
  detectedAt: timestamp("detected_at").notNull(),
  resolvedAt: timestamp("resolved_at"),
  estimatedGallonsLost: real("estimated_gallons_lost"),
  assignedTechnician: text("assigned_technician"),
  notes: text("notes"),
});

// Maintenance tasks and scheduling
export const maintenance = pgTable("maintenance", {
  id: serial("id").primaryKey(),
  taskType: text("task_type").notNull(), // inspection, repair, replacement, cleaning
  location: text("location").notNull(),
  priority: text("priority").notNull(), // low, normal, high, critical
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  scheduledDate: timestamp("scheduled_date").notNull(),
  completedDate: timestamp("completed_date"),
  assignedTechnician: text("assigned_technician").notNull(),
  estimatedDuration: integer("estimated_duration"), // minutes
  description: text("description").notNull(),
  notes: text("notes"),
  cost: real("cost"),
});

// System alerts and notifications
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // leak, pressure, flow, maintenance, system
  severity: text("severity").notNull(), // info, warning, critical
  location: text("location").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  isRead: boolean("is_read").default(false),
  resolvedAt: timestamp("resolved_at"),
});

// System activity log
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull(),
  technician: text("technician"),
  timestamp: timestamp("timestamp").notNull(),
  details: text("details"),
});

// Project management tables
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull().unique(), // PROJ-001, etc.
  name: text("name").notNull(),
  description: text("description"),
  methodology: text("methodology").notNull().default("agile"), // agile, waterfall, hybrid
  status: text("status").notNull().default("planning"), // planning, active, on_hold, completed, cancelled
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  actualStartDate: timestamp("actual_start_date"),
  actualEndDate: timestamp("actual_end_date"),
  projectManager: text("project_manager").notNull(),
  sponsor: text("sponsor"),
  budget: real("budget"),
  actualCost: real("actual_cost"),
  percentComplete: integer("percent_complete").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const requirements = pgTable("requirements", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull(),
  requirementId: text("requirement_id").notNull().unique(), // REQ-001, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("functional"), // functional, non_functional, business, technical
  priority: text("priority").notNull().default("medium"), // must_have, should_have, could_have, wont_have
  status: text("status").notNull().default("draft"), // draft, approved, implemented, tested, accepted
  source: text("source"), // stakeholder who provided requirement
  acceptanceCriteria: text("acceptance_criteria"),
  businessValue: text("business_value"),
  complexity: text("complexity").default("medium"), // low, medium, high
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const testCases = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull(),
  requirementId: text("requirement_id"),
  testCaseId: text("test_case_id").notNull().unique(), // TC-001, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().default("functional"), // functional, integration, system, uat, regression
  priority: text("priority").notNull().default("medium"), // low, medium, high, critical
  status: text("status").notNull().default("not_executed"), // not_executed, passed, failed, blocked, skipped
  preconditions: text("preconditions"),
  testSteps: jsonb("test_steps"), // array of step objects
  expectedResult: text("expected_result"),
  actualResult: text("actual_result"),
  testData: text("test_data"),
  executedBy: text("executed_by"),
  executedAt: timestamp("executed_at"),
  defectId: text("defect_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const uatSessions = pgTable("uat_sessions", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull(),
  sessionId: text("session_id").notNull().unique(), // UAT-001, etc.
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("planning"), // planning, in_progress, completed, cancelled
  participants: jsonb("participants"), // array of participant objects
  testCases: text("test_cases").array(), // array of test case IDs
  feedback: jsonb("feedback"), // array of feedback objects
  overallRating: real("overall_rating"),
  approved: boolean("approved").default(false),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stakeholders = pgTable("stakeholders", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  department: text("department"),
  email: text("email"),
  phone: text("phone"),
  influence: text("influence").notNull().default("medium"), // low, medium, high
  interest: text("interest").notNull().default("medium"), // low, medium, high
  communicationPreference: text("communication_preference").default("email"), // email, phone, meeting, slack
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull(),
  riskId: text("risk_id").notNull().unique(), // RISK-001, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // technical, schedule, budget, resource, external, quality
  probability: text("probability").notNull(), // very_low, low, medium, high, very_high
  impact: text("impact").notNull(), // very_low, low, medium, high, very_high
  riskLevel: text("risk_level").notNull(), // low, medium, high, critical
  status: text("status").notNull().default("identified"), // identified, analyzing, mitigating, monitoring, closed
  mitigation: text("mitigation"),
  contingency: text("contingency"),
  owner: text("owner"),
  reviewDate: timestamp("review_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const costEstimates = pgTable("cost_estimates", {
  id: serial("id").primaryKey(),
  projectId: text("project_id").notNull(),
  category: text("category").notNull(), // labor, hardware, software, training, travel, other
  item: text("item").notNull(),
  description: text("description"),
  quantity: integer("quantity").default(1),
  unitCost: real("unit_cost").notNull(),
  totalCost: real("total_cost").notNull(),
  contingency: real("contingency").default(0), // percentage
  finalCost: real("final_cost").notNull(),
  vendor: text("vendor"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas with string dates that will be converted to Date objects
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  department: z.string().min(1, "Department is required"),
});
export const insertWaterUsageSchema = createInsertSchema(waterUsage).omit({ id: true }).extend({
  timestamp: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val).optional()
});
export const insertLeakSchema = createInsertSchema(leaks).omit({ id: true }).extend({
  detectedAt: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val).optional(),
  resolvedAt: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional()
});
export const insertMaintenanceSchema = createInsertSchema(maintenance).omit({ id: true }).extend({
  scheduledDate: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val).optional(),
  completedDate: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional()
});
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true }).extend({
  timestamp: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val).optional(),
  resolvedAt: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional()
});
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true }).extend({
  timestamp: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val).optional()
});

// Project management insert schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  startDate: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
  endDate: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
  actualStartDate: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional(),
  actualEndDate: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional()
});

export const insertRequirementSchema = createInsertSchema(requirements).omit({ id: true, createdAt: true, updatedAt: true });

export const insertTestCaseSchema = createInsertSchema(testCases).omit({ id: true, createdAt: true }).extend({
  executedAt: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional()
});

export const insertUatSessionSchema = createInsertSchema(uatSessions).omit({ id: true, createdAt: true }).extend({
  startDate: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val),
  endDate: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val),
  approvedAt: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional()
});

export const insertStakeholderSchema = createInsertSchema(stakeholders).omit({ id: true, createdAt: true });

export const insertRiskAssessmentSchema = createInsertSchema(riskAssessments).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  reviewDate: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === 'string' ? new Date(val) : val;
  }).optional()
});

export const insertCostEstimateSchema = createInsertSchema(costEstimates).omit({ id: true, createdAt: true });

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type WaterUsage = typeof waterUsage.$inferSelect;
export type InsertWaterUsage = z.infer<typeof insertWaterUsageSchema>;
export type Leak = typeof leaks.$inferSelect;
export type InsertLeak = z.infer<typeof insertLeakSchema>;
export type Maintenance = typeof maintenance.$inferSelect;
export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Project management types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Requirement = typeof requirements.$inferSelect;
export type InsertRequirement = z.infer<typeof insertRequirementSchema>;
export type TestCase = typeof testCases.$inferSelect;
export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type UatSession = typeof uatSessions.$inferSelect;
export type InsertUatSession = z.infer<typeof insertUatSessionSchema>;
export type Stakeholder = typeof stakeholders.$inferSelect;
export type InsertStakeholder = z.infer<typeof insertStakeholderSchema>;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type InsertRiskAssessment = z.infer<typeof insertRiskAssessmentSchema>;
export type CostEstimate = typeof costEstimates.$inferSelect;
export type InsertCostEstimate = z.infer<typeof insertCostEstimateSchema>;
