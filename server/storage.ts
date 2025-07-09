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
    const newUsage: WaterUsage = { ...usage, id };
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
    const newLeak: Leak = { ...leak, id };
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
    const newTask: Maintenance = { ...task, id };
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
    const newAlert: Alert = { ...alert, id };
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
    const newActivity: Activity = { ...activity, id };
    this.activities.set(id, newActivity);
    return newActivity;
  }
}

export const storage = new MemStorage();
