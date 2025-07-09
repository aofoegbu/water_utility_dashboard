import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "../server/storage";

describe("Water Utility API", () => {
  beforeEach(() => {
    // Reset storage before each test
    // In a real implementation, you might want to create a fresh storage instance
  });

  describe("Water Usage", () => {
    it("should create water usage record", async () => {
      const usageData = {
        location: "Test Plant",
        timestamp: new Date(),
        gallons: 1000000,
        pressure: 75,
        flowRate: 1200,
        temperature: 70,
        qualityMetrics: { pH: 7.0, chlorine: 0.5 }
      };

      const result = await storage.createWaterUsage(usageData);
      
      expect(result).toMatchObject(usageData);
      expect(result.id).toBeDefined();
    });

    it("should retrieve water usage with filters", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-01-31");
      
      const usage = await storage.getWaterUsage({ 
        startDate, 
        endDate, 
        location: "North" 
      });
      
      expect(Array.isArray(usage)).toBe(true);
      usage.forEach(record => {
        expect(record.timestamp).toBeInstanceOf(Date);
        expect(record.timestamp.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(record.timestamp.getTime()).toBeLessThanOrEqual(endDate.getTime());
        expect(record.location).toContain("North");
      });
    });

    it("should calculate usage statistics", async () => {
      const stats = await storage.getUsageStatistics();
      
      expect(stats).toHaveProperty("totalToday");
      expect(stats).toHaveProperty("totalYesterday");
      expect(stats).toHaveProperty("averagePressure");
      expect(stats).toHaveProperty("peakUsageTime");
      
      expect(typeof stats.totalToday).toBe("number");
      expect(typeof stats.totalYesterday).toBe("number");
      expect(typeof stats.averagePressure).toBe("number");
      expect(typeof stats.peakUsageTime).toBe("string");
    });
  });

  describe("Leak Management", () => {
    it("should create leak alert", async () => {
      const leakData = {
        location: "Test Street",
        severity: "high" as const,
        status: "active" as const,
        detectedAt: new Date(),
        estimatedGallonsLost: 500,
        assignedTechnician: "Test Tech"
      };

      const result = await storage.createLeak(leakData);
      
      expect(result).toMatchObject(leakData);
      expect(result.id).toBeDefined();
    });

    it("should update leak status", async () => {
      const leakData = {
        location: "Test Street",
        severity: "high" as const,
        status: "active" as const,
        detectedAt: new Date(),
        estimatedGallonsLost: 500,
        assignedTechnician: "Test Tech"
      };

      const leak = await storage.createLeak(leakData);
      const updated = await storage.updateLeak(leak.id, { 
        status: "resolved", 
        resolvedAt: new Date() 
      });
      
      expect(updated?.status).toBe("resolved");
      expect(updated?.resolvedAt).toBeInstanceOf(Date);
    });

    it("should count active leaks", async () => {
      const count = await storage.getActiveLeaksCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Maintenance Management", () => {
    it("should create maintenance task", async () => {
      const maintenanceData = {
        taskType: "inspection" as const,
        location: "Test Plant",
        priority: "normal" as const,
        status: "pending" as const,
        scheduledDate: new Date(),
        assignedTechnician: "Test Tech",
        estimatedDuration: 120,
        description: "Test inspection"
      };

      const result = await storage.createMaintenance(maintenanceData);
      
      expect(result).toMatchObject(maintenanceData);
      expect(result.id).toBeDefined();
    });

    it("should retrieve today's maintenance", async () => {
      const tasks = await storage.getTodaysMaintenance();
      
      expect(Array.isArray(tasks)).toBe(true);
      tasks.forEach(task => {
        const today = new Date();
        const taskDate = new Date(task.scheduledDate);
        expect(taskDate.toDateString()).toBe(today.toDateString());
      });
    });

    it("should count pending maintenance", async () => {
      const count = await storage.getPendingMaintenanceCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Alerts System", () => {
    it("should create alert", async () => {
      const alertData = {
        type: "leak" as const,
        severity: "critical" as const,
        location: "Test Location",
        message: "Test alert message",
        timestamp: new Date(),
        isRead: false
      };

      const result = await storage.createAlert(alertData);
      
      expect(result).toMatchObject(alertData);
      expect(result.id).toBeDefined();
    });

    it("should mark alert as read", async () => {
      const alertData = {
        type: "leak" as const,
        severity: "critical" as const,
        location: "Test Location",
        message: "Test alert message",
        timestamp: new Date(),
        isRead: false
      };

      const alert = await storage.createAlert(alertData);
      await storage.markAlertAsRead(alert.id);
      
      const alerts = await storage.getAlerts();
      const updatedAlert = alerts.find(a => a.id === alert.id);
      expect(updatedAlert?.isRead).toBe(true);
    });

    it("should count unread alerts", async () => {
      const count = await storage.getUnreadAlertsCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe("User Management", () => {
    it("should create user", async () => {
      const userData = {
        username: "test.user",
        password: "testpass123",
        role: "analyst" as const,
        fullName: "Test User",
        department: "MIS"
      };

      const result = await storage.createUser(userData);
      
      expect(result).toMatchObject(userData);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should find user by username", async () => {
      const userData = {
        username: "unique.user",
        password: "testpass123",
        role: "analyst" as const,
        fullName: "Unique User",
        department: "MIS"
      };

      await storage.createUser(userData);
      const found = await storage.getUserByUsername("unique.user");
      
      expect(found).toBeDefined();
      expect(found?.username).toBe("unique.user");
    });
  });
});
