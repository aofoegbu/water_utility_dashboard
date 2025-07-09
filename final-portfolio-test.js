// Final comprehensive test for the entire portfolio
import http from 'http';

class PortfolioFinalTest {
  constructor() {
    this.results = {
      waterDashboard: { endpoint: 'http://localhost:5000', tests: [] },
      erpCrm: { endpoint: 'http://localhost:3000', tests: [] }
    };
  }

  async makeRequest(port, path, method = 'GET', data = null) {
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
        timeout: 5000
      };

      const req = http.request(options, (res) => {
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

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  async testWaterDashboard() {
    console.log('🚰 TESTING WATER UTILITY DASHBOARD (Port 5000)');
    console.log('='.repeat(50));

    const tests = [
      { name: 'Dashboard KPIs', path: '/api/dashboard/kpis', method: 'GET' },
      { name: 'Water Usage Data', path: '/api/water-usage', method: 'GET' },
      { name: 'Leak Management', path: '/api/leaks', method: 'GET' },
      { name: 'Maintenance Tasks', path: '/api/maintenance', method: 'GET' },
      { name: 'System Alerts', path: '/api/alerts', method: 'GET' },
      { name: 'Activities Log', path: '/api/activities', method: 'GET' },
      { name: 'Chart Data', path: '/api/water-usage/chart-data/7D', method: 'GET' }
    ];

    const postTests = [
      { 
        name: 'Create Water Usage', 
        path: '/api/water-usage', 
        method: 'POST',
        data: {
          location: 'Final Test Location',
          gallons: 100000,
          pressure: 45,
          flowRate: 12,
          temperature: 70,
          pH: 7.0,
          turbidity: 0.5,
          chlorine: 2.0
        }
      },
      { 
        name: 'Create Leak Alert', 
        path: '/api/leaks', 
        method: 'POST',
        data: {
          location: 'Final Test Location',
          severity: 'medium',
          status: 'active',
          estimatedGallonsLost: 5000,
          assignedTechnician: 'Test Tech'
        }
      }
    ];

    let successCount = 0;
    let totalTests = tests.length + postTests.length;

    // GET tests
    for (const test of tests) {
      try {
        const result = await this.makeRequest(5000, test.path, test.method);
        const success = result.status === 200 || result.status === 304;
        console.log(`${success ? '✅' : '❌'} ${test.name}: ${result.status}`);
        
        if (success) successCount++;
        this.results.waterDashboard.tests.push({
          name: test.name,
          success: success,
          status: result.status
        });
      } catch (error) {
        console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        this.results.waterDashboard.tests.push({
          name: test.name,
          success: false,
          error: error.message
        });
      }
    }

    // POST tests
    for (const test of postTests) {
      try {
        const result = await this.makeRequest(5000, test.path, test.method, test.data);
        const success = result.status === 201 || result.status === 200;
        console.log(`${success ? '✅' : '❌'} ${test.name}: ${result.status}`);
        
        if (success) successCount++;
        this.results.waterDashboard.tests.push({
          name: test.name,
          success: success,
          status: result.status
        });
      } catch (error) {
        console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        this.results.waterDashboard.tests.push({
          name: test.name,
          success: false,
          error: error.message
        });
      }
    }

    const waterSuccessRate = ((successCount / totalTests) * 100).toFixed(1);
    console.log(`\n📊 Water Dashboard Success Rate: ${waterSuccessRate}%`);
    return { successCount, totalTests, successRate: waterSuccessRate };
  }

  async testERPCRM() {
    console.log('\n🏢 TESTING ERP/CRM INTEGRATION (Port 3000)');
    console.log('='.repeat(50));

    const tests = [
      { name: 'System Health', path: '/api/integration/health', method: 'GET' },
      { name: 'Customer Management', path: '/api/crm/customers', method: 'GET' },
      { name: 'Support Tickets', path: '/api/crm/tickets', method: 'GET' },
      { name: 'Financial Summary', path: '/api/erp/financial-summary', method: 'GET' },
      { name: 'Inventory Management', path: '/api/erp/inventory', method: 'GET' },
      { name: 'Order Management', path: '/api/erp/orders', method: 'GET' },
      { name: 'Integration Logs', path: '/api/integration/logs', method: 'GET' },
      { name: 'Maintenance Schedules', path: '/api/maintenance/schedules', method: 'GET' },
      { name: 'Dashboard Reports', path: '/api/reports/dashboard', method: 'GET' },
      { name: 'Integration Reports', path: '/api/reports/integration', method: 'GET' }
    ];

    let successCount = 0;
    let totalTests = tests.length;

    for (const test of tests) {
      try {
        const result = await this.makeRequest(3000, test.path, test.method);
        const success = result.status === 200;
        console.log(`${success ? '✅' : '❌'} ${test.name}: ${result.status}`);
        
        if (success) successCount++;
        this.results.erpCrm.tests.push({
          name: test.name,
          success: success,
          status: result.status
        });
      } catch (error) {
        console.log(`❌ ${test.name}: ERROR - ${error.message}`);
        this.results.erpCrm.tests.push({
          name: test.name,
          success: false,
          error: error.message
        });
      }
    }

    const erpSuccessRate = ((successCount / totalTests) * 100).toFixed(1);
    console.log(`\n📊 ERP/CRM Success Rate: ${erpSuccessRate}%`);
    return { successCount, totalTests, successRate: erpSuccessRate };
  }

  async generateFinalReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 FINAL PORTFOLIO TEST REPORT');
    console.log('='.repeat(60));

    const waterResults = await this.testWaterDashboard();
    const erpResults = await this.testERPCRM();

    const overallSuccess = waterResults.successCount + erpResults.successCount;
    const overallTotal = waterResults.totalTests + erpResults.totalTests;
    const overallRate = ((overallSuccess / overallTotal) * 100).toFixed(1);

    console.log(`\n🎯 OVERALL PORTFOLIO STATUS:`);
    console.log(`   Water Dashboard: ${waterResults.successRate}% (${waterResults.successCount}/${waterResults.totalTests})`);
    console.log(`   ERP/CRM Integration: ${erpResults.successRate}% (${erpResults.successCount}/${erpResults.totalTests})`);
    console.log(`   Overall Success Rate: ${overallRate}% (${overallSuccess}/${overallTotal})`);

    if (overallRate >= 90) {
      console.log('\n🏆 PORTFOLIO STATUS: EXCELLENT - READY FOR DEPLOYMENT');
    } else if (overallRate >= 80) {
      console.log('\n✅ PORTFOLIO STATUS: GOOD - MINOR IMPROVEMENTS NEEDED');
    } else {
      console.log('\n⚠️  PORTFOLIO STATUS: NEEDS ATTENTION');
    }

    console.log('\n📞 PORTFOLIO CONTACT:');
    console.log('   Developer: Augustine Ogelo');
    console.log('   Email: augustineogelo1@gmail.com');
    console.log('   Portfolio: MIS Analyst Demonstration Projects');
    console.log('   Skills: Business Analysis, System Integration, Water Utility Operations');

    return {
      water: waterResults,
      erp: erpResults,
      overall: { successCount: overallSuccess, totalTests: overallTotal, successRate: overallRate }
    };
  }
}

// Run the test
const tester = new PortfolioFinalTest();
tester.generateFinalReport().then(results => {
  const exitCode = parseFloat(results.overall.successRate) >= 80 ? 0 : 1;
  process.exit(exitCode);
}).catch(error => {
  console.error('Final test failed:', error);
  process.exit(1);
});