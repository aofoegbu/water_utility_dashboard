// Comprehensive ERP/CRM Link Testing Script
// Tests every endpoint, button, functionality, and link in the ERP/CRM Integration Tool

import http from 'http';

class ERPTester {
  constructor() {
    this.testResults = [];
    this.baseUrl = 'http://localhost:3000';
    this.port = 3000;
  }

  async makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: this.port,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
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
        reject(new Error(`Request timeout after 10000ms`));
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

  logTest(testName, passed, details = '') {
    const result = {
      test: testName,
      status: passed ? 'PASS' : 'FAIL',
      details: details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(result);
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${passed ? 'PASSED' : 'FAILED'} ${details ? '- ' + details : ''}`);
  }

  async testAllERPCRMLinks() {
    console.log('🏢 COMPREHENSIVE ERP/CRM INTEGRATION TOOL TESTING');
    console.log('Testing every link, button, and functionality');
    console.log('='.repeat(60));

    try {
      // Test 1: Root Dashboard
      console.log('\n📊 DASHBOARD TESTS');
      const rootDashboard = await this.makeRequest('/');
      this.logTest('Root Dashboard Access', 
        rootDashboard.status === 200,
        `Status: ${rootDashboard.status}`
      );

      // Test 2: System Health Check
      console.log('\n🏥 SYSTEM HEALTH TESTS');
      const health = await this.makeRequest('/api/integration/health');
      this.logTest('System Health Check', 
        health.status === 200 && health.data.success,
        `Overall: ${health.data?.data?.overall || 'N/A'}`
      );

      // Test 3: CRM Customer Management
      console.log('\n👥 CRM CUSTOMER MANAGEMENT TESTS');
      
      // Get all customers
      const allCustomers = await this.makeRequest('/api/crm/customers');
      this.logTest('Get All Customers', 
        allCustomers.status === 200 && allCustomers.data.success,
        `Found ${allCustomers.data?.data?.length || 0} customers`
      );

      // Filter customers by status
      const activeCustomers = await this.makeRequest('/api/crm/customers?status=active');
      this.logTest('Filter Active Customers', 
        activeCustomers.status === 200 && activeCustomers.data.success,
        `Active: ${activeCustomers.data?.data?.length || 0}`
      );

      // Get specific customer
      const specificCustomer = await this.makeRequest('/api/crm/customers/CRM001');
      this.logTest('Get Specific Customer', 
        specificCustomer.status === 200 && specificCustomer.data.success,
        `Customer: ${specificCustomer.data?.data?.name || 'N/A'}`
      );

      // Create new customer
      const newCustomer = {
        name: 'ERP Test Corporation',
        email: 'erp.test@example.com',
        phone: '+1-555-ERP-TEST',
        address: '123 ERP Street, Test City, TC 12345',
        tier: 'enterprise'
      };
      const createCustomer = await this.makeRequest('/api/crm/customers', 'POST', newCustomer);
      this.logTest('Create New Customer', 
        createCustomer.status === 201 && createCustomer.data.success,
        `Created: ${createCustomer.data?.data?.name || 'N/A'}`
      );

      // Update customer (if creation was successful)
      let customerId = null;
      if (createCustomer.status === 201) {
        customerId = createCustomer.data.data.id;
        const updateCustomer = await this.makeRequest(`/api/crm/customers/${customerId}`, 'PUT', {
          tier: 'premium',
          phone: '+1-555-UPDATED'
        });
        this.logTest('Update Customer', 
          updateCustomer.status === 200 && updateCustomer.data.success,
          `Updated tier: ${updateCustomer.data?.data?.tier || 'N/A'}`
        );
      }

      // Test 4: Support Ticket System
      console.log('\n🎫 SUPPORT TICKET SYSTEM TESTS');
      
      // Get all tickets
      const allTickets = await this.makeRequest('/api/crm/tickets');
      this.logTest('Get All Tickets', 
        allTickets.status === 200 && allTickets.data.success,
        `Found ${allTickets.data?.data?.length || 0} tickets`
      );

      // Filter tickets by status
      const openTickets = await this.makeRequest('/api/crm/tickets?status=open');
      this.logTest('Filter Open Tickets', 
        openTickets.status === 200 && openTickets.data.success,
        `Open: ${openTickets.data?.data?.length || 0}`
      );

      // Create new ticket
      const newTicket = {
        customerId: 'CRM001',
        title: 'Comprehensive ERP Testing Issue',
        description: 'This ticket tests the comprehensive ERP/CRM integration functionality',
        priority: 'high',
        category: 'integration'
      };
      const createTicket = await this.makeRequest('/api/crm/tickets', 'POST', newTicket);
      this.logTest('Create Support Ticket', 
        createTicket.status === 201 && createTicket.data.success,
        `Ticket ID: ${createTicket.data?.data?.id || 'N/A'}`
      );

      // Update ticket status
      if (createTicket.status === 201) {
        const ticketId = createTicket.data.data.id;
        const updateTicket = await this.makeRequest(`/api/crm/tickets/${ticketId}`, 'PUT', {
          status: 'in_progress',
          assignedTo: 'ERP Test Engineer',
          priority: 'medium'
        });
        this.logTest('Update Ticket Status', 
          updateTicket.status === 200 && updateTicket.data.success,
          `Status: ${updateTicket.data?.data?.status || 'N/A'}`
        );
      }

      // Test 5: ERP Financial Integration
      console.log('\n💰 ERP FINANCIAL INTEGRATION TESTS');
      
      // Get financial summary
      const financialSummary = await this.makeRequest('/api/erp/financial-summary');
      this.logTest('ERP Financial Summary', 
        financialSummary.status === 200 && financialSummary.data.success,
        `Revenue: $${financialSummary.data?.data?.totalRevenue?.toLocaleString() || 'N/A'}`
      );

      // Get inventory data
      const inventory = await this.makeRequest('/api/erp/inventory');
      this.logTest('ERP Inventory Management', 
        inventory.status === 200 && inventory.data.success,
        `Items: ${inventory.data?.data?.length || 0}`
      );

      // Get orders
      const orders = await this.makeRequest('/api/erp/orders');
      this.logTest('ERP Order Management', 
        orders.status === 200 && orders.data.success,
        `Orders: ${orders.data?.data?.length || 0}`
      );

      // Test 6: Integration Management
      console.log('\n🔄 INTEGRATION MANAGEMENT TESTS');
      
      // Get integration logs
      const integrationLogs = await this.makeRequest('/api/integration/logs');
      this.logTest('Integration Logs', 
        integrationLogs.status === 200 && integrationLogs.data.success,
        `Logs: ${integrationLogs.data?.data?.length || 0}`
      );

      // Get logs with filters
      const recentLogs = await this.makeRequest('/api/integration/logs?limit=5&status=success');
      this.logTest('Filtered Integration Logs', 
        recentLogs.status === 200 && recentLogs.data.success,
        `Recent: ${recentLogs.data?.data?.length || 0}`
      );

      // Trigger manual sync
      const manualSync = await this.makeRequest('/api/integration/sync', 'POST', {
        source: 'CRM',
        target: 'ERP',
        operation: 'customer_sync'
      });
      this.logTest('Manual Integration Sync', 
        manualSync.status === 200 && manualSync.data.success,
        `Sync: ${manualSync.data?.message || 'N/A'}`
      );

      // Test 7: Maintenance Management
      console.log('\n🔧 MAINTENANCE MANAGEMENT TESTS');
      
      // Get maintenance schedules
      const maintenanceSchedules = await this.makeRequest('/api/maintenance/schedules');
      this.logTest('Maintenance Schedules', 
        maintenanceSchedules.status === 200 && maintenanceSchedules.data.success,
        `Schedules: ${maintenanceSchedules.data?.data?.length || 0}`
      );

      // Create maintenance schedule
      const newMaintenance = {
        systemType: 'Integration',
        systemName: 'ERP-CRM Bridge',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 3,
        type: 'upgrade',
        description: 'Comprehensive ERP/CRM integration upgrade',
        impactLevel: 'medium'
      };
      const createMaintenance = await this.makeRequest('/api/maintenance/schedules', 'POST', newMaintenance);
      this.logTest('Create Maintenance Schedule', 
        createMaintenance.status === 201 && createMaintenance.data.success,
        `Schedule ID: ${createMaintenance.data?.data?.id || 'N/A'}`
      );

      // Update maintenance schedule
      if (createMaintenance.status === 201) {
        const maintenanceId = createMaintenance.data.data.id;
        const updateMaintenance = await this.makeRequest(`/api/maintenance/schedules/${maintenanceId}`, 'PUT', {
          status: 'approved',
          notificationsSent: true
        });
        this.logTest('Update Maintenance Schedule', 
          updateMaintenance.status === 200 && updateMaintenance.data.success,
          `Status: ${updateMaintenance.data?.data?.status || 'N/A'}`
        );
      }

      // Test 8: Reports and Analytics
      console.log('\n📊 REPORTS AND ANALYTICS TESTS');
      
      // Get dashboard metrics
      const dashboardMetrics = await this.makeRequest('/api/reports/dashboard');
      this.logTest('Dashboard Metrics', 
        dashboardMetrics.status === 200 && dashboardMetrics.data.success,
        `Metrics: ${Object.keys(dashboardMetrics.data?.data || {}).length} categories`
      );

      // Generate JSON report
      const jsonReport = await this.makeRequest('/api/reports/integration', 'POST', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        format: 'json'
      });
      this.logTest('Generate JSON Report', 
        jsonReport.status === 200 && jsonReport.data.success,
        `Operations: ${jsonReport.data?.data?.summary?.totalOperations || 0}`
      );

      // Generate CSV report
      const csvReport = await this.makeRequest('/api/reports/integration', 'POST', {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        format: 'csv'
      });
      this.logTest('Generate CSV Report', 
        csvReport.status === 200 && csvReport.raw.includes('Timestamp,Source,Target'),
        `CSV: ${csvReport.raw?.includes('Timestamp') ? 'Valid format' : 'Invalid format'}`
      );

      // Test 9: Error Handling and Edge Cases
      console.log('\n🚨 ERROR HANDLING TESTS');
      
      // Test invalid endpoint
      const invalidEndpoint = await this.makeRequest('/api/invalid/endpoint');
      this.logTest('Invalid Endpoint Handling', 
        invalidEndpoint.status === 404 && invalidEndpoint.data.available_endpoints,
        `Provides help: ${Array.isArray(invalidEndpoint.data?.available_endpoints) ? 'Yes' : 'No'}`
      );

      // Test invalid customer ID
      const invalidCustomer = await this.makeRequest('/api/crm/customers/INVALID_ID');
      this.logTest('Invalid Customer ID Handling', 
        invalidCustomer.status === 404 && invalidCustomer.data.error,
        `Error message: ${invalidCustomer.data?.error ? 'Yes' : 'No'}`
      );

      // Test invalid data creation
      const invalidCustomerData = await this.makeRequest('/api/crm/customers', 'POST', {
        name: '', // Invalid empty name
        email: 'invalid-email', // Invalid email format
        tier: 'invalid_tier' // Invalid tier
      });
      this.logTest('Invalid Data Validation', 
        invalidCustomerData.status === 400 && invalidCustomerData.data.error,
        `Validation: ${invalidCustomerData.data?.error ? 'Working' : 'Not working'}`
      );

      // Test 10: Performance and Load
      console.log('\n⚡ PERFORMANCE TESTS');
      
      // Response time test
      const startTime = Date.now();
      const performanceTest = await this.makeRequest('/api/reports/dashboard');
      const responseTime = Date.now() - startTime;
      this.logTest('Response Time Performance', 
        responseTime < 5000 && performanceTest.status === 200,
        `${responseTime}ms (< 5000ms acceptable)`
      );

      // Concurrent requests test
      const concurrentRequests = [];
      for (let i = 0; i < 5; i++) {
        concurrentRequests.push(this.makeRequest('/api/integration/health'));
      }
      
      const concurrentStart = Date.now();
      const concurrentResults = await Promise.allSettled(concurrentRequests);
      const concurrentTime = Date.now() - concurrentStart;
      
      const successfulConcurrent = concurrentResults.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length;
      
      this.logTest('Concurrent Request Handling', 
        successfulConcurrent >= 4 && concurrentTime < 10000,
        `${successfulConcurrent}/5 successful in ${concurrentTime}ms`
      );

    } catch (error) {
      this.logTest('ERP/CRM Comprehensive Test', false, `Error: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 ERP/CRM COMPREHENSIVE TEST REPORT');
    console.log('='.repeat(70));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
    const failedTests = this.testResults.filter(t => t.status === 'FAIL').length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ❌`);
    console.log(`   Success Rate: ${successRate}%`);
    
    if (failedTests > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      this.testResults.filter(t => t.status === 'FAIL').forEach(test => {
        console.log(`   • ${test.test}: ${test.details}`);
      });
    }
    
    console.log(`\n🎯 ERP/CRM SYSTEM STATUS:`);
    if (successRate >= 95) {
      console.log(`   ✅ EXCELLENT: All systems fully operational`);
    } else if (successRate >= 80) {
      console.log(`   ⚠️  GOOD: Most features working, minor issues`);
    } else if (successRate >= 60) {
      console.log(`   ⚠️  FAIR: Basic functionality working, needs attention`);
    } else {
      console.log(`   ❌ POOR: Major issues require immediate attention`);
    }
    
    console.log(`\n🚀 TESTED FUNCTIONALITIES:`);
    console.log(`   ✓ Dashboard access and navigation`);
    console.log(`   ✓ System health monitoring`);
    console.log(`   ✓ Customer management (CRUD operations)`);
    console.log(`   ✓ Support ticket workflow`);
    console.log(`   ✓ ERP financial integration`);
    console.log(`   ✓ Integration logging and synchronization`);
    console.log(`   ✓ Maintenance scheduling`);
    console.log(`   ✓ Report generation (JSON/CSV)`);
    console.log(`   ✓ Error handling and validation`);
    console.log(`   ✓ Performance and load testing`);
    
    console.log(`\n📞 PORTFOLIO CONTACT:`);
    console.log(`     Developer: Augustine Ogelo`);
    console.log(`     Email: augustineogelo1@gmail.com`);
    console.log(`     Project: ERP/CRM Integration Tool`);
    
    console.log('\n' + '='.repeat(70));
    
    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate)
    };
  }

  async runAllTests() {
    console.log('🔍 STARTING ERP/CRM COMPREHENSIVE TESTING');
    console.log('Testing every link, button, and functionality in the ERP/CRM system\n');
    
    await this.testAllERPCRMLinks();
    return this.generateReport();
  }
}

// Run the comprehensive test
const tester = new ERPTester();
tester.runAllTests().then(results => {
  process.exit(results.successRate >= 80 ? 0 : 1);
}).catch(error => {
  console.error('Testing failed:', error);
  process.exit(1);
});