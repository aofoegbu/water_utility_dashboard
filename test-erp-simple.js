// Simple ERP/CRM test to verify server is running
import http from 'http';

const testEndpoints = [
  '/api/integration/health',
  '/api/crm/customers',
  '/api/crm/tickets',
  '/api/erp/financial-summary',
  '/api/integration/logs',
  '/api/reports/dashboard'
];

async function testEndpoint(path) {
  return new Promise((resolve) => {
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
        resolve({ path, status: res.statusCode, working: res.statusCode === 200 });
      });
    });
    
    req.on('error', () => resolve({ path, status: 'ERROR', working: false }));
    req.on('timeout', () => resolve({ path, status: 'TIMEOUT', working: false }));
    req.end();
  });
}

async function runTests() {
  console.log('🔍 ERP/CRM SERVER CONNECTIVITY TEST');
  console.log('='.repeat(50));
  
  const results = [];
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log(`${result.working ? '✅' : '❌'} ${endpoint}: ${result.status}`);
  }
  
  const working = results.filter(r => r.working).length;
  const total = results.length;
  const percentage = ((working / total) * 100).toFixed(1);
  
  console.log(`\n📊 SUMMARY: ${working}/${total} endpoints working (${percentage}%)`);
  
  if (working === total) {
    console.log('✅ ERP/CRM SERVER: Fully operational');
  } else if (working > 0) {
    console.log('⚠️  ERP/CRM SERVER: Partially working');
  } else {
    console.log('❌ ERP/CRM SERVER: Not responding');
  }
}

runTests().catch(console.error);