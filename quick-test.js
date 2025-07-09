// Quick comprehensive test of both systems
import http from 'http';

async function makeRequest(port, path, method = 'GET') {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: path,
      method: method,
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', () => resolve({ status: 0, data: 'ERROR' }));
    req.on('timeout', () => resolve({ status: 0, data: 'TIMEOUT' }));
    req.end();
  });
}

async function testSystems() {
  console.log('🔍 QUICK COMPREHENSIVE TEST\n');
  
  // Test Water Utility Dashboard (Port 5000)
  console.log('🚰 WATER UTILITY DASHBOARD (Port 5000)');
  const waterTests = [
    '/api/dashboard/kpis',
    '/api/water-usage', 
    '/api/leaks',
    '/api/maintenance',
    '/api/alerts',
    '/api/activities'
  ];
  
  let waterPass = 0;
  for (const test of waterTests) {
    const result = await makeRequest(5000, test);
    const pass = result.status === 200;
    console.log(`  ${pass ? '✅' : '❌'} ${test}: ${result.status}`);
    if (pass) waterPass++;
  }
  
  // Test ERP/CRM Integration Tool (Port 3000)
  console.log('\n🏢 ERP/CRM INTEGRATION TOOL (Port 3000)');
  const erpTests = [
    '/api/integration/health',
    '/api/crm/customers',
    '/api/crm/tickets',
    '/api/erp/financial-summary',
    '/api/integration/logs',
    '/api/reports/dashboard'
  ];
  
  let erpPass = 0;
  for (const test of erpTests) {
    const result = await makeRequest(3000, test);
    const pass = result.status === 200;
    console.log(`  ${pass ? '✅' : '❌'} ${test}: ${result.status}`);
    if (pass) erpPass++;
  }
  
  // Summary
  console.log('\n📊 SUMMARY');
  console.log(`Water Utility: ${waterPass}/${waterTests.length} tests passed`);
  console.log(`ERP/CRM: ${erpPass}/${erpTests.length} tests passed`);
  
  const totalPass = waterPass + erpPass;
  const totalTests = waterTests.length + erpTests.length;
  const successRate = ((totalPass / totalTests) * 100).toFixed(1);
  
  console.log(`\n🎯 OVERALL: ${totalPass}/${totalTests} (${successRate}% success rate)`);
  
  if (successRate >= 80) {
    console.log('✅ PORTFOLIO READY: Systems are working well!');
  } else {
    console.log('⚠️  NEEDS ATTENTION: Some systems require fixes');
  }
}

testSystems().catch(console.error);