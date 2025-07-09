// Dedicated ERP/CRM server runner for testing
import { spawn } from 'child_process';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ERPServerRunner {
  constructor() {
    this.serverProcess = null;
    this.isRunning = false;
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, 'project-2-erp-crm', 'server.js');
      console.log('🚀 Starting ERP/CRM server...');
      
      this.serverProcess = spawn('node', [serverPath], {
        stdio: 'pipe',
        cwd: path.join(__dirname, 'project-2-erp-crm')
      });

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        if (output.includes('ERP/CRM Integration Server running on port 3000')) {
          this.isRunning = true;
          resolve();
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('ERP Server Error:', data.toString());
      });

      this.serverProcess.on('error', (error) => {
        console.error('Failed to start ERP server:', error);
        reject(error);
      });

      this.serverProcess.on('exit', (code) => {
        console.log(`ERP server exited with code ${code}`);
        this.isRunning = false;
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!this.isRunning) {
          reject(new Error('Server start timeout'));
        }
      }, 10000);
    });
  }

  async testEndpoints() {
    console.log('\n🔍 Testing ERP/CRM endpoints...');
    
    const endpoints = [
      { path: '/api/integration/health', name: 'System Health' },
      { path: '/api/crm/customers', name: 'Customer Management' },
      { path: '/api/crm/tickets', name: 'Support Tickets' },
      { path: '/api/erp/financial-summary', name: 'Financial Summary' },
      { path: '/api/erp/inventory', name: 'Inventory Management' },
      { path: '/api/erp/orders', name: 'Order Management' },
      { path: '/api/integration/logs', name: 'Integration Logs' },
      { path: '/api/maintenance/schedules', name: 'Maintenance Schedules' },
      { path: '/api/reports/dashboard', name: 'Dashboard Reports' },
      { path: '/api/reports/integration', name: 'Integration Reports' }
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const result = await this.makeRequest(endpoint.path);
        const success = result.status === 200;
        results.push({ ...endpoint, success, status: result.status });
        console.log(`${success ? '✅' : '❌'} ${endpoint.name}: ${result.status}`);
      } catch (error) {
        results.push({ ...endpoint, success: false, status: 'ERROR', error: error.message });
        console.log(`❌ ${endpoint.name}: ERROR (${error.message})`);
      }
    }

    const successful = results.filter(r => r.success).length;
    const total = results.length;
    const successRate = ((successful / total) * 100).toFixed(1);
    
    console.log(`\n📊 ENDPOINT TEST RESULTS:`);
    console.log(`   Total: ${total}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Success Rate: ${successRate}%`);
    
    return { results, successful, total, successRate: parseFloat(successRate) };
  }

  async makeRequest(path) {
    return new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'GET',
        timeout: 5000
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (error) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }

  async testCRUDOperations() {
    console.log('\n🔧 Testing CRUD operations...');
    
    try {
      // Test customer creation
      const newCustomer = {
        name: 'CRUD Test Company',
        email: 'crud@test.com',
        phone: '+1-555-CRUD',
        address: '123 Test Street',
        tier: 'standard'
      };
      
      const createResult = await this.makePostRequest('/api/crm/customers', newCustomer);
      console.log(`${createResult.status === 201 ? '✅' : '❌'} Create Customer: ${createResult.status}`);
      
      // Test ticket creation
      const newTicket = {
        customerId: 'CRM001',
        title: 'CRUD Test Ticket',
        description: 'Testing CRUD operations',
        priority: 'medium',
        category: 'test'
      };
      
      const ticketResult = await this.makePostRequest('/api/crm/tickets', newTicket);
      console.log(`${ticketResult.status === 201 ? '✅' : '❌'} Create Ticket: ${ticketResult.status}`);
      
      // Test integration sync
      const syncResult = await this.makePostRequest('/api/integration/sync', {
        source: 'CRM',
        target: 'ERP',
        operation: 'test_sync'
      });
      console.log(`${syncResult.status === 200 ? '✅' : '❌'} Integration Sync: ${syncResult.status}`);
      
      return true;
    } catch (error) {
      console.log(`❌ CRUD Operations: ERROR (${error.message})`);
      return false;
    }
  }

  async makePostRequest(path, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 5000
      }, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            resolve({ status: res.statusCode, data: parsed });
          } catch (error) {
            resolve({ status: res.statusCode, data: responseData });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.write(postData);
      req.end();
    });
  }

  async runComprehensiveTest() {
    console.log('🏢 ERP/CRM COMPREHENSIVE TESTING');
    console.log('='.repeat(50));
    
    try {
      // Start server
      await this.startServer();
      console.log('✅ Server started successfully');
      
      // Wait for server to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test endpoints
      const endpointResults = await this.testEndpoints();
      
      // Test CRUD operations
      const crudSuccess = await this.testCRUDOperations();
      
      // Generate final report
      console.log('\n' + '='.repeat(50));
      console.log('📊 FINAL ERP/CRM TEST REPORT');
      console.log('='.repeat(50));
      
      console.log(`📈 ENDPOINT TESTS: ${endpointResults.successful}/${endpointResults.total} (${endpointResults.successRate}%)`);
      console.log(`🔧 CRUD OPERATIONS: ${crudSuccess ? 'PASSED' : 'FAILED'}`);
      
      const overallSuccess = endpointResults.successRate >= 80 && crudSuccess;
      console.log(`\n🎯 OVERALL STATUS: ${overallSuccess ? '✅ EXCELLENT' : '⚠️ NEEDS ATTENTION'}`);
      
      console.log('\n📞 PORTFOLIO CONTACT:');
      console.log('   Developer: Augustine Ogelo');
      console.log('   Email: augustineogelo1@gmail.com');
      console.log('   Project: ERP/CRM Integration Tool');
      
      return {
        endpoints: endpointResults,
        crud: crudSuccess,
        overall: overallSuccess
      };
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
      return { error: error.message };
    }
  }

  stop() {
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');
      this.isRunning = false;
    }
  }
}

// Run the test
const runner = new ERPServerRunner();
runner.runComprehensiveTest().then(results => {
  console.log('\n🏁 Test completed');
  
  // Keep server running for a bit to allow final tests
  setTimeout(() => {
    runner.stop();
    process.exit(results.overall ? 0 : 1);
  }, 5000);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});