#!/usr/bin/env node

/**
 * Comprehensive Portfolio Testing Script
 * Tests all five independent projects with their features and endpoints
 */

import fs from 'fs';
import http from 'http';

const projects = [
  {
    name: 'Water Utility Dashboard',
    port: 5000,
    folder: 'water-utility-dashboard',
    endpoints: [
      '/api/dashboard/kpis',
      '/api/water-usage',
      '/api/leaks',
      '/api/maintenance',
      '/api/alerts',
      '/api/activities'
    ]
  },
  {
    name: 'ERP/CRM Integration Tool',
    port: 3000,
    folder: 'erp-crm-integration',
    endpoints: [
      '/api/crm/customers',
      '/api/crm/tickets',
      '/api/erp/work-orders',
      '/api/integration/logs',
      '/api/integration/health'
    ]
  },
  {
    name: 'Project Tracker with UAT Support',
    port: 4000,
    folder: 'project-tracker-uat',
    endpoints: [
      '/api/projects',
      '/api/requirements',
      '/api/test-cases',
      '/api/uat-sessions',
      '/api/dashboard/analytics'
    ]
  },
  {
    name: 'SQL Report Generator',
    port: 5500,
    folder: 'sql-report-generator',
    endpoints: [
      '/api/schema/tables',
      '/api/templates',
      '/api/query/execute',
      '/api/reports/history',
      '/api/health'
    ]
  },
  {
    name: 'Business Process Mapper',
    port: 6000,
    folder: 'business-process-mapper',
    endpoints: [
      '/api/processes',
      '/api/change-requests',
      '/api/analytics/dashboard',
      '/api/processes/1/steps',
      '/api/processes/1/optimization'
    ]
  }
];

function makeRequest(port, path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        status: 0,
        data: err.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        data: 'Request timeout',
        success: false
      });
    });

    req.end();
  });
}

async function testProject(project) {
  console.log(`\n🧪 TESTING: ${project.name}`);
  console.log(`📁 Folder: ${project.folder}`);
  console.log(`🚀 Port: ${project.port}`);
  console.log('─'.repeat(60));

  const results = [];
  
  for (const endpoint of project.endpoints) {
    const result = await makeRequest(project.port, endpoint);
    results.push({
      endpoint,
      ...result
    });
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${endpoint} - Status: ${result.status || 'ERROR'}`);
    
    if (result.success && result.data) {
      try {
        const json = JSON.parse(result.data);
        const type = Array.isArray(json) ? `Array[${json.length}]` : 'Object';
        console.log(`   📊 Response: ${type}`);
      } catch (e) {
        console.log(`   📄 Response: ${result.data.substring(0, 100)}...`);
      }
    } else if (!result.success) {
      console.log(`   ❌ Error: ${result.data}`);
    }
  }

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  const successRate = Math.round((successCount / totalCount) * 100);
  
  console.log(`\n📈 Success Rate: ${successCount}/${totalCount} (${successRate}%)`);
  
  return {
    project: project.name,
    folder: project.folder,
    port: project.port,
    results,
    successRate,
    allPassed: successCount === totalCount
  };
}

async function runComprehensiveTest() {
  console.log('🔍 COMPREHENSIVE PORTFOLIO TEST');
  console.log('═'.repeat(60));
  console.log('Testing all five independent projects...\n');

  const testResults = [];
  
  for (const project of projects) {
    const result = await testProject(project);
    testResults.push(result);
  }

  console.log('\n═'.repeat(60));
  console.log('📊 FINAL TEST SUMMARY');
  console.log('═'.repeat(60));

  let allProjectsHealthy = true;
  
  testResults.forEach(result => {
    const status = result.allPassed ? '✅' : '❌';
    console.log(`${status} ${result.project} (${result.successRate}%)`);
    if (!result.allPassed) allProjectsHealthy = false;
  });

  console.log('\n' + '─'.repeat(60));
  console.log(`🎯 OVERALL STATUS: ${allProjectsHealthy ? '✅ ALL SYSTEMS OPERATIONAL' : '❌ ISSUES DETECTED'}`);
  
  if (allProjectsHealthy) {
    console.log('\n🎉 Portfolio verification complete!');
    console.log('All five projects are running independently and responding correctly.');
  } else {
    console.log('\n⚠️  Some projects may need additional setup or are not currently running.');
  }

  return testResults;
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error);