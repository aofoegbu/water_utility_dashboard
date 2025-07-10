import { db } from "./db";
import { users, waterUsage, leaks, maintenance, alerts, activities } from "@shared/schema";

export async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...");

    // Clear existing data
    await db.delete(activities);
    await db.delete(alerts);
    await db.delete(maintenance);
    await db.delete(leaks);
    await db.delete(waterUsage);
    await db.delete(users);

    // Seed users
    const sampleUsers = [
      {
        username: "admin",
        password: "admin123", // In production, this would be hashed
        role: "admin" as const,
        fullName: "System Administrator",
        department: "IT Operations"
      },
      {
        username: "analyst",
        password: "analyst123", // In production, this would be hashed
        role: "analyst" as const,
        fullName: "Water Systems Analyst",
        department: "Water Operations"
      },
      {
        username: "supervisor",
        password: "supervisor123", // In production, this would be hashed
        role: "supervisor" as const,
        fullName: "Operations Supervisor",
        department: "Field Operations"
      }
    ];

    await db.insert(users).values(sampleUsers);

    // Seed water usage data (last 30 days)
    const waterUsageData = [];
    const locations = [
      "Downtown Treatment Plant",
      "North Reno Station",
      "Sparks Distribution Center",
      "South Valley Pump Station",
      "Mt. Rose Treatment Facility"
    ];

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      for (const location of locations) {
        for (let hour = 0; hour < 24; hour += 6) {
          const timestamp = new Date(date);
          timestamp.setHours(hour, 0, 0, 0);
          
          waterUsageData.push({
            location,
            gallons: Math.floor(Math.random() * 10000) + 5000,
            pressure: Math.floor(Math.random() * 20) + 40,
            flowRate: Math.floor(Math.random() * 500) + 200,
            timestamp,
            temperature: Math.floor(Math.random() * 15) + 55,
            qualityMetrics: {
              ph: (Math.random() * 2 + 6.5).toFixed(1),
              chlorine: (Math.random() * 2 + 1).toFixed(2),
              turbidity: (Math.random() * 0.5).toFixed(2)
            }
          });
        }
      }
    }

    await db.insert(waterUsage).values(waterUsageData);

    // Seed leak data
    const leakData = [
      {
        location: "Main Street & 4th Avenue",
        severity: "high" as const,
        detectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "active" as const,
        estimatedGallonsLost: 5000,
        assignedTechnician: "John Smith",
        notes: "Large leak detected in main distribution line"
      },
      {
        location: "Residential Area - Pine St",
        severity: "medium" as const,
        detectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "resolved" as const,
        estimatedGallonsLost: 1200,
        assignedTechnician: "Sarah Johnson",
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notes: "Service line leak repaired"
      },
      {
        location: "Industrial District - Factory Row",
        severity: "critical" as const,
        detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        status: "active" as const,
        estimatedGallonsLost: 15000,
        assignedTechnician: "Mike Wilson",
        notes: "Major leak requires immediate attention"
      }
    ];

    await db.insert(leaks).values(leakData);

    // Seed maintenance data
    const maintenanceData = [
      {
        taskType: "inspection",
        location: "North Pump Station",
        scheduledDate: new Date(),
        status: "pending" as const,
        assignedTechnician: "Alex Chen",
        priority: "medium" as const,
        estimatedDuration: 120,
        description: "Quarterly pump inspection due",
        notes: "Quarterly pump inspection due"
      },
      {
        taskType: "repair",
        location: "Downtown Treatment Plant",
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "scheduled" as const,
        assignedTechnician: "Lisa Rodriguez",
        priority: "high" as const,
        estimatedDuration: 240,
        description: "Replace worn valve assembly",
        notes: "Replace worn valve assembly"
      },
      {
        taskType: "calibration",
        location: "South Valley Pump Station",
        scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: "completed" as const,
        assignedTechnician: "David Kim",
        priority: "low" as const,
        completedDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        estimatedDuration: 90,
        description: "Flow meter calibration",
        cost: 350,
        notes: "Flow meter calibration completed successfully"
      }
    ];

    await db.insert(maintenance).values(maintenanceData);

    // Seed alerts
    const alertData = [
      {
        type: "pressure",
        severity: "critical" as const,
        location: "Main Distribution Line",
        message: "Pressure drop detected below critical threshold",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false
      },
      {
        type: "quality",
        severity: "warning" as const,
        location: "North Treatment Plant",
        message: "Chlorine levels approaching minimum threshold",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false
      },
      {
        type: "leak",
        severity: "high" as const,
        location: "Industrial District - Factory Row",
        message: "Major leak detected requiring immediate response",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isRead: false
      },
      {
        type: "maintenance",
        severity: "info" as const,
        location: "South Valley Pump Station",
        message: "Scheduled maintenance completed successfully",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isRead: true,
        resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ];

    await db.insert(alerts).values(alertData);

    // Seed activity data
    const activityData = [
      {
        eventType: "leak_reported",
        location: "Industrial District - Factory Row",
        status: "critical",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        technician: "System",
        details: "New leak reported - severity: critical, estimatedLoss: 15000"
      },
      {
        eventType: "maintenance_completed",
        location: "South Valley Pump Station",
        status: "completed",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        technician: "David Kim",
        details: "Flow meter calibration completed - duration: 90 minutes, cost: $350"
      },
      {
        eventType: "alert_generated",
        location: "Main Distribution Line",
        status: "active",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        technician: "System",
        details: "Pressure alert triggered - alertType: pressure, severity: critical"
      },
      {
        eventType: "quality_test",
        location: "Downtown Treatment Plant",
        status: "completed",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        technician: "Lab Tech",
        details: "Water quality test completed - pH: 7.2, chlorine: 2.1, turbidity: 0.15"
      }
    ];

    await db.insert(activities).values(activityData);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}