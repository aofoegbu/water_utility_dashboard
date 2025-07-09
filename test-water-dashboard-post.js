// Test Water Dashboard POST endpoints to verify validation fixes
import http from 'http';

const testEndpoints = [
  {
    path: '/api/water-usage',
    method: 'POST',
    data: {
      location: 'Test Location - POST Fix',
      gallons: 125000,
      pressure: 45,
      flowRate: 12.5,
      temperature: 68,
      pH: 7.2,
      turbidity: 0.8,
      chlorine: 2.1
    }
  },
  {
    path: '/api/leaks',
    method: 'POST',
    data: {
      location: 'Test Location - Leak POST Fix',
      severity: 'medium',
      status: 'active',
      estimatedGallonsLost: 5000,
      assignedTechnician: 'John Doe',
      notes: 'Test leak created via POST validation fix'
    }
  },
  {
    path: '/api/maintenance',
    method: 'POST',
    data: {
      taskType: 'inspection',
      location: 'Test Location - Maintenance POST Fix',
      priority: 'normal',
      status: 'pending',
      assignedTechnician: 'Jane Smith',
      estimatedDuration: 120,
      description: 'Test maintenance task via POST validation fix',
      notes: 'Validation fix test'
    }
  },
  {
    path: '/api/alerts',
    method: 'POST',
    data: {
      type: 'leak',
      severity: 'warning',
      location: 'Test Location - Alert POST Fix',
      message: 'Test alert created via POST validation fix'
    }
  },
  {
    path: '/api/activities',
    method: 'POST',
    data: {
      eventType: 'alert_generated',
      location: 'Test Location - Activity POST Fix',
      status: 'completed',
      technician: 'System',
      details: 'Test activity created via POST validation fix'
    }
  }
];

async function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(endpoint.data);
    
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ 
            path: endpoint.path, 
            status: res.statusCode, 
            data: parsed,
            success: res.statusCode === 201 || res.statusCode === 200
          });
        } catch (error) {
          resolve({ 
            path: endpoint.path, 
            status: res.statusCode, 
            data: data,
            success: false,
            error: 'JSON parse error'
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({ path: endpoint.path, error: error.message });
    });

    req.on('timeout', () => {
      reject({ path: endpoint.path, error: 'Request timeout' });
    });

    req.write(postData);
    req.end();
  });
}

async function testWaterDashboardPOSTs() {
  console.log('🚰 WATER DASHBOARD POST VALIDATION TESTS');
  console.log('='.repeat(50));
  
  let successCount = 0;
  let totalCount = testEndpoints.length;
  
  for (const endpoint of testEndpoints) {
    try {
      const result = await makeRequest(endpoint);
      const success = result.success;
      successCount += success ? 1 : 0;
      
      console.log(`${success ? '✅' : '❌'} ${endpoint.path}: ${result.status} ${success ? 'SUCCESS' : 'FAILED'}`);
      
      if (!success) {
        console.log(`   Error: ${result.data.message || result.data.error || 'Unknown error'}`);
        if (result.data.details) {
          console.log(`   Details: ${result.data.details}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${endpoint.path}: ERROR - ${error.error || error.message}`);
    }
  }
  
  const successRate = ((successCount / totalCount) * 100).toFixed(1);
  
  console.log(`\n📊 POST VALIDATION RESULTS:`);
  console.log(`   Total Tests: ${totalCount}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Success Rate: ${successRate}%`);
  
  if (successRate === '100.0') {
    console.log('✅ All POST validation issues FIXED!');
  } else {
    console.log('⚠️  Some POST validation issues remain');
  }
  
  return successRate;
}

testWaterDashboardPOSTs().then(rate => {
  process.exit(parseFloat(rate) >= 80 ? 0 : 1);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});