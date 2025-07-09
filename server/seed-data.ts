import { db } from "./db";
import { users, waterUsage, leaks, maintenance, alerts, activities, projects, requirements, testCases, uatSessions, stakeholders, riskAssessments, costEstimates } from "@shared/schema";

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
    
    // Clear project management data
    await db.delete(costEstimates);
    await db.delete(riskAssessments);
    await db.delete(stakeholders);
    await db.delete(uatSessions);
    await db.delete(testCases);
    await db.delete(requirements);
    await db.delete(projects);

    // Seed users
    const sampleUsers = [
      {
        username: "Ogelo",
        email: "augustineogelo1@gmail.com",
        password: "99ogelo1010", // In production, this would be hashed
        role: "analyst" as const,
        fullName: "Augustine Ogelo",
        department: "Water Operations"
      },
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

    // Seed project management data
    const projectData = [
      {
        projectId: "PROJ-001",
        name: "Water Quality Monitoring System",
        description: "Implement automated water quality monitoring with real-time alerts and reporting capabilities",
        methodology: "agile",
        status: "active",
        priority: "high",
        projectManager: "Augustine Ogelo",
        sponsor: "Water Operations Director",
        budget: 250000,
        actualCost: 180000,
        percentComplete: 75,
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        actualStartDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        actualEndDate: null
      },
      {
        projectId: "PROJ-002", 
        name: "Leak Detection System Upgrade",
        description: "Upgrade aging leak detection infrastructure with smart sensors and predictive analytics",
        methodology: "waterfall",
        status: "planning",
        priority: "medium",
        projectManager: "Sarah Johnson",
        sponsor: "Infrastructure Manager",
        budget: 180000,
        actualCost: 25000,
        percentComplete: 15,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        actualStartDate: null,
        actualEndDate: null
      }
    ];

    await db.insert(projects).values(projectData);

    // Seed requirements
    const requirementsData = [
      {
        projectId: "PROJ-001",
        requirementId: "REQ-001",
        title: "Real-time Water Quality Monitoring",
        description: "System must continuously monitor pH, chlorine, turbidity, and temperature with 5-second update intervals",
        type: "functional",
        priority: "high",
        status: "implemented",
        source: "Water Quality Manager",
        acceptanceCriteria: "All sensors provide readings within 5-second intervals with 99.9% uptime",
        businessValue: "Enables immediate response to water quality issues, reducing health risks",
        complexity: "high",
        estimatedHours: 120,
        actualHours: 115
      },
      {
        projectId: "PROJ-001",
        requirementId: "REQ-002",
        title: "Automated Alert System",
        description: "System must generate alerts when water quality parameters exceed defined thresholds",
        type: "functional",
        priority: "high",
        status: "approved",
        source: "Operations Supervisor",
        acceptanceCriteria: "Alerts sent within 30 seconds of threshold breach via email and SMS",
        businessValue: "Reduces response time to quality issues from hours to minutes",
        complexity: "medium",
        estimatedHours: 80,
        actualHours: 75
      },
      {
        projectId: "PROJ-002",
        requirementId: "REQ-003",
        title: "Smart Leak Detection Sensors",
        description: "Deploy IoT sensors capable of detecting micro-leaks in distribution networks",
        type: "functional",
        priority: "high",
        status: "draft",
        source: "Field Operations Team",
        acceptanceCriteria: "Sensors detect leaks down to 0.1 GPM with GPS location accuracy",
        businessValue: "Prevents water loss and reduces emergency repair costs",
        complexity: "high",
        estimatedHours: 200,
        actualHours: null
      }
    ];

    await db.insert(requirements).values(requirementsData);

    // Seed test cases
    const testCasesData = [
      {
        projectId: "PROJ-001",
        requirementId: "REQ-001",
        testCaseId: "TC-001",
        title: "pH Sensor Reading Accuracy",
        description: "Verify pH sensor readings are accurate within ±0.1 pH units",
        type: "functional",
        priority: "high",
        status: "passed",
        preconditions: "pH sensor installed and calibrated",
        testSteps: "1. Set reference pH solution to 7.0\n2. Take sensor reading\n3. Compare with reference",
        expectedResult: "Sensor reading between 6.9 and 7.1",
        actualResult: "Sensor reading: 7.05",
        testData: "Reference solution: pH 7.0",
        executedBy: "QA Tester",
        executedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        defectId: null,
        notes: "Test passed successfully"
      },
      {
        projectId: "PROJ-001",
        requirementId: "REQ-002",
        testCaseId: "TC-002",
        title: "Alert Generation Speed",
        description: "Verify alerts are generated within 30 seconds of threshold breach",
        type: "performance",
        priority: "high",
        status: "passed",
        preconditions: "Alert system configured with test thresholds",
        testSteps: "1. Set chlorine threshold to 2.0 ppm\n2. Simulate chlorine drop to 1.5 ppm\n3. Measure alert response time",
        expectedResult: "Alert generated within 30 seconds",
        actualResult: "Alert generated in 18 seconds",
        testData: "Threshold: 2.0 ppm, Simulated value: 1.5 ppm",
        executedBy: "QA Tester",
        executedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        defectId: null,
        notes: "Performance exceeds requirements"
      }
    ];

    await db.insert(testCases).values(testCasesData);

    // Seed UAT sessions
    const uatSessionsData = [
      {
        projectId: "PROJ-001",
        sessionId: "UAT-001",
        name: "Water Quality Dashboard UAT",
        description: "User acceptance testing for the water quality monitoring dashboard",
        status: "completed",
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        participants: ["Water Quality Manager", "Operations Supervisor", "Field Technician"],
        testCases: ["TC-001", "TC-002"],
        feedback: "Dashboard is intuitive and provides clear visibility into water quality metrics",
        overallRating: 4.5,
        approved: true,
        approvedBy: "Water Quality Manager",
        approvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        notes: "Minor UI improvements suggested but overall system meets requirements"
      }
    ];

    await db.insert(uatSessions).values(uatSessionsData);

    // Seed stakeholders
    const stakeholdersData = [
      {
        projectId: "PROJ-001",
        name: "Water Quality Manager",
        role: "primary_user",
        department: "Water Operations",
        email: "quality.manager@ogelo-water.com",
        phone: "(555) 123-4567",
        influence: "high",
        interest: "high",
        communicationPreference: "email",
        notes: "Key decision maker for water quality standards and procedures"
      },
      {
        projectId: "PROJ-001",
        name: "Operations Supervisor",
        role: "end_user",
        department: "Field Operations",
        email: "ops.supervisor@ogelo-water.com",
        phone: "(555) 234-5678",
        influence: "medium",
        interest: "high",
        communicationPreference: "phone",
        notes: "Will use system for daily operations monitoring"
      },
      {
        projectId: "PROJ-002",
        name: "Infrastructure Manager",
        role: "sponsor",
        department: "Engineering",
        email: "infrastructure@ogelo-water.com",
        phone: "(555) 345-6789",
        influence: "high",
        interest: "high",
        communicationPreference: "email",
        notes: "Budget authority and strategic decision maker"
      }
    ];

    await db.insert(stakeholders).values(stakeholdersData);

    // Seed risk assessments
    const riskAssessmentsData = [
      {
        projectId: "PROJ-001",
        riskId: "RISK-001",
        title: "Sensor Calibration Drift",
        description: "Water quality sensors may drift over time, providing inaccurate readings",
        category: "technical",
        probability: "medium",
        impact: "high",
        riskLevel: "high",
        status: "mitigating",
        mitigation: "Implement automated calibration checks every 30 days with reference standards",
        contingency: "Manual calibration procedures and backup sensors available",
        owner: "Augustine Ogelo",
        reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        projectId: "PROJ-002",
        riskId: "RISK-002",
        title: "Network Connectivity Issues",
        description: "IoT sensors may lose connectivity in remote locations",
        category: "infrastructure",
        probability: "high",
        impact: "medium",
        riskLevel: "medium",
        status: "identified",
        mitigation: "Deploy mesh network with redundant communication paths",
        contingency: "Local data storage with batch synchronization when connectivity restored",
        owner: "Network Administrator",
        reviewDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    ];

    await db.insert(riskAssessments).values(riskAssessmentsData);

    // Seed cost estimates
    const costEstimatesData = [
      {
        projectId: "PROJ-001",
        category: "hardware",
        item: "Water Quality Sensors",
        description: "Multi-parameter sensors for pH, chlorine, turbidity, temperature",
        quantity: 25,
        unitCost: 2500,
        totalCost: 62500,
        contingency: 10,
        finalCost: 68750,
        vendor: "AquaTech Solutions",
        notes: "Includes installation and initial calibration"
      },
      {
        projectId: "PROJ-001",
        category: "software",
        item: "Dashboard Development",
        description: "Custom web dashboard for real-time monitoring",
        quantity: 1,
        unitCost: 75000,
        totalCost: 75000,
        contingency: 15,
        finalCost: 86250,
        vendor: "Internal Development",
        notes: "Full-stack development including mobile responsiveness"
      },
      {
        projectId: "PROJ-001",
        category: "services",
        item: "Training and Support",
        description: "User training and 12-month support contract",
        quantity: 1,
        unitCost: 25000,
        totalCost: 25000,
        contingency: 5,
        finalCost: 26250,
        vendor: "Training Solutions Inc",
        notes: "Includes on-site training and documentation"
      },
      {
        projectId: "PROJ-002",
        category: "hardware",
        item: "Smart Leak Sensors",
        description: "IoT-enabled acoustic leak detection sensors",
        quantity: 100,
        unitCost: 800,
        totalCost: 80000,
        contingency: 20,
        finalCost: 96000,
        vendor: "LeakTech Industries",
        notes: "Weatherproof sensors with 10-year battery life"
      }
    ];

    await db.insert(costEstimates).values(costEstimatesData);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}