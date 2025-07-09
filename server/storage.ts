import { 
  users, waterUsage, leaks, maintenance, alerts, activities,
  type User, type InsertUser, type WaterUsage, type InsertWaterUsage,
  type Leak, type InsertLeak, type Maintenance, type InsertMaintenance,
  type Alert, type InsertAlert, type Activity, type InsertActivity
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private waterUsage: Map<number, WaterUsage> = new Map();
  private leaks: Map<number, Leak> = new Map();
  private maintenance: Map<number, Maintenance> = new Map();
  private alerts: Map<number, Alert> = new Map();
  private activities: Map<number, Activity> = new Map();
  private currentId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample user
    this.createUser({
      username: "john.analyst",
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
}

export const storage = new DatabaseStorage();
