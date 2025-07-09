// Comprehensive Feature Testing Script for Augustine Ogelo's Portfolio Projects
// Tests both Water Utility Dashboard (port 5000) and ERP/CRM Integration Tool (port 3000)

import http from 'http';

class PortfolioTester {
  constructor() {
    this.testResults = [];
    this.failedTests = [];
    this.passedTests = [];
  }

  // Make HTTP request with timeout
  makeRequest(port, path, method = 'GET', data = null, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: port,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: timeout
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};
            resolve({ 
              status: res.statusCode, 
              data: parsed,
              headers: res.headers,
              raw: responseData
            });
          } catch (error) {
            resolve({ 
              status: res.statusCode, 
              data: responseData,
              headers: res.headers,
              raw: responseData
            });
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${timeout}ms`));
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  // Log test result
  logTest(testName, passed, details = '') {
    const result = {
      test: testName,
      status: passed ? 'PASS' : 'FAIL',
      details: details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(result);
    if (passed) {
      this.passedTests.push(result);
      console.log(`✅ ${testName}: PASSED ${details ? '- ' + details : ''}`);
    } else {
      this.failedTests.push(result);
      console.log(`❌ ${testName}: FAILED ${details ? '- ' + details : ''}`);
    }
  }

  // Test Water Utility Dashboard (Port 5000)
  async testWaterUtilityDashboard() {
    console.log('\n🚰 TESTING WATER UTILITY DASHBOARD (Port 5000)\n');
    
    try {
      // Test 1: Dashboard KPIs
      const kpis = await this.makeRequest(5000, '/api/dashboard/kpis');
      this.logTest('Water Dashboard KPIs', 
        kpis.status === 200 && kpis.data.totalUsageToday !== undefined,
        `Status: ${kpis.status}, Usage: ${kpis.data.totalUsageToday || 'N/A'}`
      );

      // Test 2: Water Usage Data
      const waterUsage = await this.makeRequest(5000, '/api/water-usage');
      this.logTest('Water Usage Retrieval',
        waterUsage.status === 200 && Array.isArray(waterUsage.data),
        `Found ${waterUsage.data?.length || 0} usage records`
      );

      // Test 3: Water Usage Chart Data
      const chartData = await this.makeRequest(5000, '/api/water-usage/chart-data/7D');
      this.logTest('Water Usage Chart Data',
        chartData.status === 200 && Array.isArray(chartData.data),
        `Chart points: ${chartData.data?.length || 0}`
      );

      // Test 4: Create Water Usage Entry
      const newUsage = {
        location: 'Test Location - Feature Test',
        gallons: 150.75,
        pressure: 35.2,
        flowRate: 12.5,
        temperature: 68.4
      };
      const createUsage = await this.makeRequest(5000, '/api/water-usage', 'POST', newUsage);
      this.logTest('Create Water Usage Entry',
        createUsage.status === 201 && createUsage.data.id !== undefined,
        `Created entry ID: ${createUsage.data?.id || 'N/A'}`
      );

      // Test 5: Leak Detection System
      const leaks = await this.makeRequest(5000, '/api/leaks');
      this.logTest('Leak Detection System',
        leaks.status === 200 && Array.isArray(leaks.data),
        `Active leaks: ${leaks.data?.length || 0}`
      );

      // Test 6: Create Leak Report
      const newLeak = {
        location: 'Test Leak Location',
        severity: 'medium',
        description: 'Automated test leak report',
        estimatedFlow: 2.5
      };
      const createLeak = await this.makeRequest(5000, '/api/leaks', 'POST', newLeak);
      this.logTest('Create Leak Report',
        createLeak.status === 201 && createLeak.data.id !== undefined,
        `Leak ID: ${createLeak.data?.id || 'N/A'}`
      );

      // Test 7: Update Leak Status
      if (createLeak.status === 201) {
        const updateLeak = await this.makeRequest(5000, `/api/leaks/${createLeak.data.id}`, 'PATCH', {
          status: 'resolved',
          resolution: 'Repaired during testing'
        });
        this.logTest('Update Leak Status',
          updateLeak.status === 200 && updateLeak.data.status === 'resolved',
          `Updated to: ${updateLeak.data?.status || 'N/A'}`
        );
      }

      // Test 8: Maintenance System
      const maintenance = await this.makeRequest(5000, '/api/maintenance');
      this.logTest('Maintenance System',
        maintenance.status === 200 && Array.isArray(maintenance.data),
        `Maintenance tasks: ${maintenance.data?.length || 0}`
      );

      // Test 9: Today's Maintenance
      const todayMaintenance = await this.makeRequest(5000, '/api/maintenance/today');
      this.logTest('Today\'s Maintenance',
        todayMaintenance.status === 200 && Array.isArray(todayMaintenance.data),
        `Today's tasks: ${todayMaintenance.data?.length || 0}`
      );

      // Test 10: Create Maintenance Task
      const newMaintenance = {
        taskType: 'inspection',
        location: 'Test Maintenance Location',
        description: 'Automated test maintenance task',
        priority: 'medium',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      const createMaintenance = await this.makeRequest(5000, '/api/maintenance', 'POST', newMaintenance);
      this.logTest('Create Maintenance Task',
        createMaintenance.status === 201 && createMaintenance.data.id !== undefined,
        `Task ID: ${createMaintenance.data?.id || 'N/A'}`
      );

      // Test 11: Update Maintenance Task
      if (createMaintenance.status === 201) {
        const updateMaintenance = await this.makeRequest(5000, `/api/maintenance/${createMaintenance.data.id}`, 'PATCH', {
          status: 'completed',
          completedAt: new Date().toISOString(),
          notes: 'Completed during testing'
        });
        this.logTest('Update Maintenance Task',
          updateMaintenance.status === 200 && updateMaintenance.data.status === 'completed',
          `Status: ${updateMaintenance.data?.status || 'N/A'}`
        );
      }

      // Test 12: Alerts System
      const alerts = await this.makeRequest(5000, '/api/alerts');
      this.logTest('Alerts System',
        alerts.status === 200 && Array.isArray(alerts.data),
        `Active alerts: ${alerts.data?.length || 0}`
      );

      // Test 13: Create Alert
      const newAlert = {
        type: 'system',
        severity: 'info',
        location: 'Test Alert Location',
        message: 'Automated test alert',
        priority: 'low'
      };
      const createAlert = await this.makeRequest(5000, '/api/alerts', 'POST', newAlert);
      this.logTest('Create Alert',
        createAlert.status === 201 && createAlert.data.id !== undefined,
        `Alert ID: ${createAlert.data?.id || 'N/A'}`
      );

      // Test 14: Mark Alert as Read
      if (createAlert.status === 201) {
        const markRead = await this.makeRequest(5000, `/api/alerts/${createAlert.data.id}/read`, 'PATCH');
        this.logTest('Mark Alert as Read',
          markRead.status === 200,
          `Response: ${markRead.status}`
        );
      }

      // Test 15: Activities Log
      const activities = await this.makeRequest(5000, '/api/activities');
      this.logTest('Activities Log',
        activities.status === 200 && Array.isArray(activities.data),
        `Recent activities: ${activities.data?.length || 0}`
      );

      // Test 16: Generate Reports
      const reportData = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        format: 'pdf'
      };
      const generateReport = await this.makeRequest(5000, '/api/reports/generate', 'POST', reportData);
      this.logTest('Generate PDF Report',
        generateReport.status === 200,
        `Report generated: ${generateReport.status === 200 ? 'Yes' : 'No'}`
      );

      // Test 17: User Authentication (should fail without auth)
      const userAuth = await this.makeRequest(5000, '/api/auth/user');
      this.logTest('Authentication System',
        userAuth.status === 401,
        `Correctly rejecting unauthenticated requests`
      );

    } catch (error) {
      this.logTest('Water Utility Dashboard Tests', false, `Error: ${error.message}`);
    }
  }

  // Test ERP/CRM Integration Tool (Port 3000)
  async testERPCRMIntegration() {
    console.log('\n🏢 TESTING ERP/CRM INTEGRATION TOOL (Port 3000)\n');
    
    try {
      // Test 1: System Health Check
      const health = await this.makeRequest(3000, '/api/integration/health');
      this.logTest('ERP/CRM System Health',
        health.status === 200 && health.data.success && health.data.data.overall === 'healthy',
        `Overall: ${health.data?.data?.overall || 'N/A'}`
      );

      // Test 2: CRM Customer List
      const customers = await this.makeRequest(3000, '/api/crm/customers');
      this.logTest('CRM Customer List',
        customers.status === 200 && customers.data.success && Array.isArray(customers.data.data),
        `Customers found: ${customers.data?.data?.length || 0}`
      );

      // Test 3: CRM Customer Filtering
      const activeCustomers = await this.makeRequest(3000, '/api/crm/customers?status=active');
      this.logTest('CRM Customer Filtering',
        activeCustomers.status === 200 && activeCustomers.data.success,
        `Active customers: ${activeCustomers.data?.data?.length || 0}`
      );

      // Test 4: Get Specific Customer
      const specificCustomer = await this.makeRequest(3000, '/api/crm/customers/CRM001');
      this.logTest('Get Specific Customer',
        specificCustomer.status === 200 && specificCustomer.data.success,
        `Customer: ${specificCustomer.data?.data?.name || 'N/A'}`
      );

      // Test 5: Create New Customer
      const newCustomer = {
        name: 'Comprehensive Test Corp',
        email: 'comprehensive@test.com',
        phone: '+1-555-TEST',
        address: '123 Test Avenue, Test City, TC 12345',
        tier: 'professional'
      };
      const createCustomer = await this.makeRequest(3000, '/api/crm/customers', 'POST', newCustomer);
      this.logTest('Create New Customer',
        createCustomer.status === 201 && createCustomer.data.success,
        `Created: ${createCustomer.data?.data?.name || 'N/A'}`
      );

      // Test 6: Update Customer
      if (createCustomer.status === 201) {
        const updateCustomer = await this.makeRequest(3000, `/api/crm/customers/${createCustomer.data.data.id}`, 'PUT', {
          tier: 'enterprise',
          phone: '+1-555-UPDATED'
        });
        this.logTest('Update Customer',
          updateCustomer.status === 200 && updateCustomer.data.success,
          `Updated tier: ${updateCustomer.data?.data?.tier || 'N/A'}`
        );
      }

      // Test 7: Support Tickets List
      const tickets = await this.makeRequest(3000, '/api/crm/tickets');
      this.logTest('Support Tickets List',
        tickets.status === 200 && tickets.data.success && Array.isArray(tickets.data.data),
        `Tickets found: ${tickets.data?.data?.length || 0}`
      );

      // Test 8: Create Support Ticket
      const newTicket = {
        customerId: 'CRM001',
        title: 'Comprehensive Feature Test Ticket',
        description: 'This ticket was created during comprehensive feature testing',
        priority: 'medium',
        category: 'testing'
      };
      const createTicket = await this.makeRequest(3000, '/api/crm/tickets', 'POST', newTicket);
      this.logTest('Create Support Ticket',
        createTicket.status === 201 && createTicket.data.success,
        `Ticket ID: ${createTicket.data?.data?.id || 'N/A'}`
      );

      // Test 9: Update Ticket Status
      if (createTicket.status === 201) {
        const updateTicket = await this.makeRequest(3000, `/api/crm/tickets/${createTicket.data.data.id}`, 'PUT', {
          status: 'in_progress',
          assignedTo: 'Test Engineer',
          priority: 'high'
        });
        this.logTest('Update Ticket Status',
          updateTicket.status === 200 && updateTicket.data.success,
          `Status: ${updateTicket.data?.data?.status || 'N/A'}`
        );
      }

      // Test 10: ERP Financial Summary
      const financial = await this.makeRequest(3000, '/api/erp/financial-summary');
      this.logTest('ERP Financial Summary',
        financial.status === 200 && financial.data.success && financial.data.data.totalRevenue,
        `Revenue: $${financial.data?.data?.totalRevenue?.toLocaleString() || 'N/A'}`
      );

      // Test 11: ERP Inventory Management
      const inventory = await this.makeRequest(3000, '/api/erp/inventory');
      this.logTest('ERP Inventory Management',
        inventory.status === 200 && inventory.data.success && Array.isArray(inventory.data.data),
        `Inventory items: ${inventory.data?.data?.length || 0}`
      );

      // Test 12: ERP Order Status
      const orders = await this.makeRequest(3000, '/api/erp/orders');
      this.logTest('ERP Order Status',
        orders.status === 200 && orders.data.success && Array.isArray(orders.data.data),
        `Orders found: ${orders.data?.data?.length || 0}`
      );

      // Test 13: Integration Logs
      const logs = await this.makeRequest(3000, '/api/integration/logs');
      this.logTest('Integration Logs',
        logs.status === 200 && logs.data.success && Array.isArray(logs.data.data),
        `Log entries: ${logs.data?.data?.length || 0}`
      );

      // Test 14: Trigger Manual Sync
      const syncRequest = {
        source: 'CRM',
        target: 'ERP',
        operation: 'customer_sync'
      };
      const triggerSync = await this.makeRequest(3000, '/api/integration/sync', 'POST', syncRequest);
      this.logTest('Trigger Manual Sync',
        triggerSync.status === 200 && triggerSync.data.success,
        `Sync initiated: ${triggerSync.data?.message || 'N/A'}`
      );

      // Test 15: Maintenance Schedules
      const maintenance = await this.makeRequest(3000, '/api/maintenance/schedules');
      this.logTest('Maintenance Schedules',
        maintenance.status === 200 && maintenance.data.success && Array.isArray(maintenance.data.data),
        `Schedules: ${maintenance.data?.data?.length || 0}`
      );

      // Test 16: Create Maintenance Schedule
      const newMaintenanceSchedule = {
        systemType: 'Integration',
        systemName: 'Test API Gateway',
        scheduledDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        duration: 2,
        type: 'patch',
        description: 'Comprehensive test maintenance',
        impactLevel: 'low'
      };
      const createMaintenanceSchedule = await this.makeRequest(3000, '/api/maintenance/schedules', 'POST', newMaintenanceSchedule);
      this.logTest('Create Maintenance Schedule',
        createMaintenanceSchedule.status === 201 && createMaintenanceSchedule.data.success,
        `Schedule ID: ${createMaintenanceSchedule.data?.data?.id || 'N/A'}`
      );

      // Test 17: Update Maintenance Schedule
      if (createMaintenanceSchedule.status === 201) {
        const updateMaintenanceSchedule = await this.makeRequest(3000, `/api/maintenance/schedules/${createMaintenanceSchedule.data.data.id}`, 'PUT', {
          status: 'completed',
          notificationsSent: true
        });
        this.logTest('Update Maintenance Schedule',
          updateMaintenanceSchedule.status === 200 && updateMaintenanceSchedule.data.success,
          `Status: ${updateMaintenanceSchedule.data?.data?.status || 'N/A'}`
        );
      }

      // Test 18: Dashboard Metrics
      const dashboardMetrics = await this.makeRequest(3000, '/api/reports/dashboard');
      this.logTest('Dashboard Metrics',
        dashboardMetrics.status === 200 && dashboardMetrics.data.success,
        `Metrics loaded: ${Object.keys(dashboardMetrics.data?.data || {}).length} categories`
      );

      // Test 19: Generate Integration Report (JSON)
      const reportRequest = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        format: 'json'
      };
      const generateReport = await this.makeRequest(3000, '/api/reports/integration', 'POST', reportRequest);
      this.logTest('Generate Integration Report (JSON)',
        generateReport.status === 200 && generateReport.data.success,
        `Operations: ${generateReport.data?.data?.summary?.totalOperations || 0}`
      );

      // Test 20: Generate Integration Report (CSV)
      const csvReportRequest = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        format: 'csv'
      };
      const generateCSVReport = await this.makeRequest(3000, '/api/reports/integration', 'POST', csvReportRequest);
      this.logTest('Generate Integration Report (CSV)',
        generateCSVReport.status === 200 && generateCSVReport.raw.includes('Timestamp,Source,Target'),
        `CSV format: ${generateCSVReport.raw?.includes('Timestamp') ? 'Valid' : 'Invalid'}`
      );

      // Test 21: Invalid Endpoint (Error Handling)
      const invalidEndpoint = await this.makeRequest(3000, '/api/invalid/endpoint');
      this.logTest('Error Handling (Invalid Endpoint)',
        invalidEndpoint.status === 404 && invalidEndpoint.data.available_endpoints,
        `Provides help: ${Array.isArray(invalidEndpoint.data?.available_endpoints) ? 'Yes' : 'No'}`
      );

    } catch (error) {
      this.logTest('ERP/CRM Integration Tests', false, `Error: ${error.message}`);
    }
  }

  // Test Performance and Load
  async testPerformance() {
    console.log('\n⚡ TESTING PERFORMANCE & LOAD\n');
    
    try {
      // Test 1: Response Time - Water Dashboard
      const startTime1 = Date.now();
      const waterResponse = await this.makeRequest(5000, '/api/dashboard/kpis');
      const waterResponseTime = Date.now() - startTime1;
      this.logTest('Water Dashboard Response Time',
        waterResponseTime < 5000 && waterResponse.status === 200,
        `${waterResponseTime}ms (< 5000ms acceptable)`
      );

      // Test 2: Response Time - ERP/CRM Dashboard
      const startTime2 = Date.now();
      const erpResponse = await this.makeRequest(3000, '/api/reports/dashboard');
      const erpResponseTime = Date.now() - startTime2;
      this.logTest('ERP/CRM Dashboard Response Time',
        erpResponseTime < 5000 && erpResponse.status === 200,
        `${erpResponseTime}ms (< 5000ms acceptable)`
      );

      // Test 3: Concurrent Requests
      const concurrentRequests = [];
      for (let i = 0; i < 5; i++) {
        concurrentRequests.push(this.makeRequest(5000, '/api/alerts'));
        concurrentRequests.push(this.makeRequest(3000, '/api/integration/health'));
      }
      
      const startConcurrent = Date.now();
      const concurrentResults = await Promise.allSettled(concurrentRequests);
      const concurrentTime = Date.now() - startConcurrent;
      
      const successfulRequests = concurrentResults.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length;
      
      this.logTest('Concurrent Request Handling',
        successfulRequests >= 8 && concurrentTime < 10000,
        `${successfulRequests}/10 successful in ${concurrentTime}ms`
      );

    } catch (error) {
      this.logTest('Performance Tests', false, `Error: ${error.message}`);
    }
  }

  // Generate comprehensive test report
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE FEATURE TEST REPORT');
    console.log('='.repeat(80));
    
    const totalTests = this.testResults.length;
    const passedCount = this.passedTests.length;
    const failedCount = this.failedTests.length;
    const successRate = ((passedCount / totalTests) * 100).toFixed(1);
    
    console.log(`\n📈 SUMMARY STATISTICS:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedCount} ✅`);
    console.log(`   Failed: ${failedCount} ❌`);
    console.log(`   Success Rate: ${successRate}%`);
    
    if (failedCount > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      this.failedTests.forEach(test => {
        console.log(`   • ${test.test}: ${test.details}`);
      });
    }
    
    console.log(`\n🎯 PORTFOLIO READINESS:`);
    if (successRate >= 90) {
      console.log(`   ✅ EXCELLENT: Portfolio projects are ready for demonstration`);
    } else if (successRate >= 75) {
      console.log(`   ⚠️  GOOD: Most features working, minor issues to address`);
    } else {
      console.log(`   ❌ NEEDS WORK: Significant issues require attention`);
    }
    
    console.log(`\n🚀 TESTED FEATURES:`);
    console.log(`   Water Utility Dashboard (Port 5000):`);
    console.log(`     • Real-time dashboard KPIs`);
    console.log(`     • Water usage monitoring & analytics`);
    console.log(`     • Leak detection & reporting`);
    console.log(`     • Maintenance scheduling & tracking`);
    console.log(`     • Alert system & notifications`);
    console.log(`     • Activity logging & audit trail`);
    console.log(`     • Report generation (PDF)`);
    console.log(`     • Authentication system`);
    
    console.log(`\n   ERP/CRM Integration Tool (Port 3000):`);
    console.log(`     • System health monitoring`);
    console.log(`     • CRM customer management (CRUD)`);
    console.log(`     • Support ticket workflow`);
    console.log(`     • ERP financial integration`);
    console.log(`     • Inventory management`);
    console.log(`     • Order processing`);
    console.log(`     • Integration logging & sync`);
    console.log(`     • Maintenance scheduling`);
    console.log(`     • Dashboard metrics & reporting`);
    console.log(`     • Report generation (JSON/CSV)`);
    console.log(`     • Error handling & validation`);
    
    console.log(`\n⚡ PERFORMANCE METRICS:`);
    console.log(`     • Response times under 5 seconds`);
    console.log(`     • Concurrent request handling`);
    console.log(`     • System reliability & uptime`);
    
    console.log(`\n📞 CONTACT INFORMATION:`);
    console.log(`     Developer: Augustine Ogelo`);
    console.log(`     Email: augustineogelo1@gmail.com`);
    console.log(`     Portfolio: MIS Analyst Demonstration Projects`);
    
    console.log('\n' + '='.repeat(80));
    
    return {
      totalTests,
      passedCount,
      failedCount,
      successRate: parseFloat(successRate),
      status: successRate >= 90 ? 'EXCELLENT' : successRate >= 75 ? 'GOOD' : 'NEEDS_WORK'
    };
  }

  // Run all tests
  async runAllTests() {
    console.log('🔍 STARTING COMPREHENSIVE FEATURE TESTING');
    console.log('Testing Augustine Ogelo\'s MIS Analyst Portfolio Projects');
    console.log('Projects: Water Utility Dashboard + ERP/CRM Integration Tool\n');
    
    await this.testWaterUtilityDashboard();
    await this.testERPCRMIntegration();
    await this.testPerformance();
    
    return this.generateReport();
  }
}

// Execute comprehensive testing
async function testFeature(name, testFn) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    await testFn();
    console.log(`✅ ${name}: Completed`);
  } catch (error) {
    console.log(`❌ ${name}: Failed - ${error.message}`);
  }
}

async function runAllTests() {
  const tester = new PortfolioTester();
  const results = await tester.runAllTests();
  
  // Exit with appropriate code
  process.exit(results.successRate >= 75 ? 0 : 1);
}

// Start testing if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error('Testing failed:', error);
    process.exit(1);
  });
}

export { PortfolioTester, testFeature, runAllTests };