#!/usr/bin/env node

const baseURL = 'http://localhost:5000';

async function testFeature(name, testFn) {
  try {
    await testFn();
    console.log(`✅ ${name} - PASSED`);
  } catch (error) {
    console.log(`❌ ${name} - FAILED: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🧪 Testing all Water Utility Dashboard features...\n');

  // Test 1: Dashboard KPIs
  await testFeature('Dashboard KPIs', async () => {
    const response = await fetch(`${baseURL}/api/dashboard/kpis`);
    const data = await response.json();
    if (!data.totalUsageToday) throw new Error('Missing totalUsageToday');
  });

  // Test 2: Water Usage - GET
  await testFeature('Water Usage - GET', async () => {
    const response = await fetch(`${baseURL}/api/water-usage`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // Test 3: Water Usage - POST
  await testFeature('Water Usage - POST', async () => {
    const response = await fetch(`${baseURL}/api/water-usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'Test Location - Feature Test',
        gallons: 1200,
        pressure: 42.5,
        flowRate: 11.2,
        timestamp: new Date().toISOString()
      })
    });
    const data = await response.json();
    if (!data.id) throw new Error('Missing id in response');
  });

  // Test 4: Leaks - GET
  await testFeature('Leaks - GET', async () => {
    const response = await fetch(`${baseURL}/api/leaks`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // Test 5: Leaks - POST
  await testFeature('Leaks - POST', async () => {
    const response = await fetch(`${baseURL}/api/leaks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'Test Location - Feature Test',
        severity: 'medium',
        status: 'active',
        detectedAt: new Date().toISOString(),
        estimatedGallonsLost: 800
      })
    });
    const data = await response.json();
    if (!data.id) throw new Error('Missing id in response');
  });

  // Test 6: Maintenance - GET
  await testFeature('Maintenance - GET', async () => {
    const response = await fetch(`${baseURL}/api/maintenance`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // Test 7: Maintenance - POST
  await testFeature('Maintenance - POST', async () => {
    const response = await fetch(`${baseURL}/api/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskType: 'inspection',
        location: 'Test Location - Feature Test',
        priority: 'normal',
        status: 'pending',
        scheduledDate: new Date(Date.now() + 24*60*60*1000).toISOString(),
        assignedTechnician: 'Test Technician',
        description: 'Feature test maintenance task'
      })
    });
    const data = await response.json();
    if (!data.id) throw new Error('Missing id in response');
  });

  // Test 8: Alerts - GET
  await testFeature('Alerts - GET', async () => {
    const response = await fetch(`${baseURL}/api/alerts`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // Test 9: Chart Data
  await testFeature('Chart Data', async () => {
    const response = await fetch(`${baseURL}/api/water-usage/chart-data/7D`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // Test 10: Activities
  await testFeature('Activities', async () => {
    const response = await fetch(`${baseURL}/api/activities`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // Test 11: Reports - CSV
  await testFeature('Reports - CSV', async () => {
    const response = await fetch(`${baseURL}/api/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportType: 'usage',
        format: 'csv',
        startDate: '2024-07-01',
        endDate: '2024-07-09'
      })
    });
    if (!response.ok) throw new Error('CSV report generation failed');
  });

  // Test 12: Reports - PDF
  await testFeature('Reports - PDF', async () => {
    const response = await fetch(`${baseURL}/api/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportType: 'leaks',
        format: 'pdf',
        startDate: '2024-07-01',
        endDate: '2024-07-09'
      })
    });
    if (!response.ok) throw new Error('PDF report generation failed');
  });

  // Test 13: Maintenance Today
  await testFeature('Maintenance Today', async () => {
    const response = await fetch(`${baseURL}/api/maintenance/today`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Expected array');
  });

  // Test 14: Update Leak Status
  await testFeature('Update Leak Status', async () => {
    // First create a leak
    const createResponse = await fetch(`${baseURL}/api/leaks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'Test Location - Update Test',
        severity: 'low',
        status: 'active',
        detectedAt: new Date().toISOString(),
        estimatedGallonsLost: 300
      })
    });
    const leak = await createResponse.json();
    
    // Then update it
    const updateResponse = await fetch(`${baseURL}/api/leaks/${leak.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' })
    });
    const updatedLeak = await updateResponse.json();
    if (updatedLeak.status !== 'resolved') throw new Error('Status not updated');
  });

  // Test 15: Update Maintenance Status
  await testFeature('Update Maintenance Status', async () => {
    // First create a maintenance task
    const createResponse = await fetch(`${baseURL}/api/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskType: 'repair',
        location: 'Test Location - Update Test',
        priority: 'high',
        status: 'pending',
        scheduledDate: new Date(Date.now() + 24*60*60*1000).toISOString(),
        assignedTechnician: 'Test Technician',
        description: 'Update test maintenance task'
      })
    });
    const task = await createResponse.json();
    
    // Then update it
    const updateResponse = await fetch(`${baseURL}/api/maintenance/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'completed' })
    });
    const updatedTask = await updateResponse.json();
    if (updatedTask.status !== 'completed') throw new Error('Status not updated');
  });

  console.log('\n🎉 All feature tests completed!\n');
}

// Run if called directly
runAllTests().catch(console.error);