import axios from 'axios';

const baseURL = 'http://localhost:5000';

async function testFeature(name, testFn) {
  try {
    console.log(`Testing ${name}...`);
    await testFn();
    console.log(`✅ ${name} - PASSED`);
  } catch (error) {
    console.log(`❌ ${name} - FAILED:`, error.response?.data || error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive API tests...\n');

  // Test 1: Dashboard KPIs
  await testFeature('Dashboard KPIs', async () => {
    const response = await axios.get(`${baseURL}/api/dashboard/kpis`);
    if (!response.data.totalUsageToday || !response.data.usageChange) {
      throw new Error('Missing KPI data');
    }
  });

  // Test 2: Water Usage GET
  await testFeature('Water Usage GET', async () => {
    const response = await axios.get(`${baseURL}/api/water-usage`);
    if (!Array.isArray(response.data) || response.data.length === 0) {
      throw new Error('No water usage data found');
    }
  });

  // Test 3: Chart Data
  await testFeature('Chart Data', async () => {
    const response = await axios.get(`${baseURL}/api/water-usage/chart-data`);
    if (!Array.isArray(response.data)) {
      throw new Error('Chart data should be an array');
    }
  });

  // Test 4: Leaks GET
  await testFeature('Leaks GET', async () => {
    const response = await axios.get(`${baseURL}/api/leaks`);
    if (!Array.isArray(response.data) || response.data.length === 0) {
      throw new Error('No leak data found');
    }
  });

  // Test 5: Maintenance GET
  await testFeature('Maintenance GET', async () => {
    const response = await axios.get(`${baseURL}/api/maintenance`);
    if (!Array.isArray(response.data) || response.data.length === 0) {
      throw new Error('No maintenance data found');
    }
  });

  // Test 6: Alerts GET
  await testFeature('Alerts GET', async () => {
    const response = await axios.get(`${baseURL}/api/alerts`);
    if (!Array.isArray(response.data) || response.data.length === 0) {
      throw new Error('No alert data found');
    }
  });

  // Test 7: Activities GET
  await testFeature('Activities GET', async () => {
    const response = await axios.get(`${baseURL}/api/activities`);
    if (!Array.isArray(response.data) || response.data.length === 0) {
      throw new Error('No activity data found');
    }
  });

  // Test 8: Water Usage POST (test with existing data structure)
  await testFeature('Water Usage POST', async () => {
    const testData = {
      location: "Test Location - API Test",
      timestamp: new Date().toISOString(),
      gallons: 125.5,
      pressure: 42.3,
      flowRate: 15.2,
      temperature: 72.1,
      qualityMetrics: {
        ph: 7.1,
        chlorine: 0.75,
        turbidity: 0.3
      }
    };
    const response = await axios.post(`${baseURL}/api/water-usage`, testData);
    if (response.status !== 201) {
      throw new Error('Failed to create water usage record');
    }
  });

  // Test 9: Alert POST
  await testFeature('Alert POST', async () => {
    const testData = {
      type: "test",
      severity: "info",
      location: "Test Location - API Test",
      message: "API test alert created successfully",
      timestamp: new Date().toISOString(),
      isRead: false
    };
    const response = await axios.post(`${baseURL}/api/alerts`, testData);
    if (response.status !== 201) {
      throw new Error('Failed to create alert');
    }
  });

  // Test 10: Leak POST
  await testFeature('Leak POST', async () => {
    const testData = {
      location: "Test Location - API Test",
      severity: "medium",
      status: "active",
      detectedAt: new Date().toISOString(),
      estimatedGallonsLost: 1500,
      assignedTechnician: "Test Technician",
      notes: "API test leak record"
    };
    const response = await axios.post(`${baseURL}/api/leaks`, testData);
    if (response.status !== 201) {
      throw new Error('Failed to create leak record');
    }
  });

  // Test 11: Maintenance POST
  await testFeature('Maintenance POST', async () => {
    const testData = {
      taskType: "inspection",
      location: "Test Location - API Test",
      priority: "medium",
      status: "pending",
      scheduledDate: new Date(Date.now() + 24*60*60*1000).toISOString(),
      assignedTechnician: "Test Technician",
      estimatedDuration: 120,
      description: "API test maintenance task",
      notes: "Created via API test"
    };
    const response = await axios.post(`${baseURL}/api/maintenance`, testData);
    if (response.status !== 201) {
      throw new Error('Failed to create maintenance task');
    }
  });

  // Test 12: PATCH Operations
  await testFeature('Leak Update PATCH', async () => {
    const response = await axios.patch(`${baseURL}/api/leaks/1`, {
      status: "investigating",
      notes: "Updated via API test"
    });
    if (response.status !== 200) {
      throw new Error('Failed to update leak');
    }
  });

  await testFeature('Maintenance Update PATCH', async () => {
    const response = await axios.patch(`${baseURL}/api/maintenance/1`, {
      status: "in_progress",
      notes: "Updated via API test"
    });
    if (response.status !== 200) {
      throw new Error('Failed to update maintenance task');
    }
  });

  await testFeature('Alert Mark as Read PATCH', async () => {
    const response = await axios.patch(`${baseURL}/api/alerts/1/read`);
    if (response.status !== 200) {
      throw new Error('Failed to mark alert as read');
    }
  });

  // Test 13: Report Generation
  await testFeature('PDF Report Generation', async () => {
    const testData = {
      reportType: "usage",
      format: "pdf",
      startDate: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
      endDate: new Date().toISOString()
    };
    const response = await axios.post(`${baseURL}/api/reports/generate`, testData, {
      responseType: 'arraybuffer'
    });
    if (response.status !== 200 || response.headers['content-type'] !== 'application/pdf') {
      throw new Error('Failed to generate PDF report');
    }
  });

  await testFeature('CSV Report Generation', async () => {
    const testData = {
      reportType: "leaks",
      format: "csv",
      startDate: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
      endDate: new Date().toISOString()
    };
    const response = await axios.post(`${baseURL}/api/reports/generate`, testData);
    if (response.status !== 200 || !response.headers['content-type'].includes('text/csv')) {
      throw new Error('Failed to generate CSV report');
    }
    if (!response.data || response.data.length === 0) {
      throw new Error('CSV report is empty');
    }
  });

  console.log('\n🎉 All tests completed!');
}

runAllTests().catch(console.error);