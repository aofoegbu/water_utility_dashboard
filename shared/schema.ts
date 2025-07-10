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
  timestamp: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val)
});
export const insertLeakSchema = createInsertSchema(leaks).omit({ id: true }).extend({
  detectedAt: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val),
  resolvedAt: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val).optional()
});
export const insertMaintenanceSchema = createInsertSchema(maintenance).omit({ id: true }).extend({
  scheduledDate: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val),
  completedDate: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val).optional()
});
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true }).extend({
  timestamp: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val),
  resolvedAt: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val).optional()
});
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true }).extend({
  timestamp: z.string().or(z.date()).transform((val) => typeof val === 'string' ? new Date(val) : val)
});

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
