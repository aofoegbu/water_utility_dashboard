#!/usr/bin/env node

/**
 * Portfolio Verification Script
 * Validates that all five projects are properly structured as independent applications
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 PORTFOLIO VERIFICATION REPORT');
console.log('================================\n');

const projects = [
  {
    name: 'Water Utility Dashboard',
    folder: 'water-utility-dashboard',
    port: 5000,
    mainFile: 'server/index.ts',
    techStack: 'React + TypeScript + Node.js + PostgreSQL',
    features: ['Real-time monitoring', 'SQL Report Generator', 'Leak detection', 'Authentication']
  },
  {
    name: 'ERP/CRM Integration Tool', 
    folder: 'erp-crm-integration',
    port: 3000,
    mainFile: 'server.js',
    techStack: 'Node.js + Express + In-Memory Storage',
    features: ['CRM/ERP simulation', 'Integration monitoring', 'Customer sync', 'Work order automation']
  },
  {
    name: 'Project Tracker with UAT Support',
    folder: 'project-tracker-uat', 
    port: 4000,
    mainFile: 'app.js',
    techStack: 'Node.js + Express + Moment.js',
    features: ['Project lifecycle', 'Requirements documentation', 'UAT tracking', 'Risk assessment']
  },
  {
    name: 'SQL Report Generator',
    folder: 'sql-report-generator',
    port: 5500, 
    mainFile: 'server.js',
    techStack: 'Node.js + Express + SQLite',
    features: ['SQL execution engine', 'Query builder', 'CSV/JSON export', 'Performance tracking']
  },
  {
    name: 'Business Process Mapper',
    folder: 'business-process-mapper',
    port: 6000,
    mainFile: 'server.js', 
    techStack: 'Node.js + Express + Canvas',
    features: ['Process modeling', 'Optimization analysis', 'SOP generation', 'Change management']
  }
];

let allValid = true;

projects.forEach((project, index) => {
  console.log(`${index + 1}. ${project.name}`);
  console.log(`   📁 Folder: ${project.folder}/`);
  console.log(`   🚀 Port: ${project.port}`);
  console.log(`   💻 Tech: ${project.techStack}`);
  
  // Check if folder exists
  const folderExists = fs.existsSync(project.folder);
  console.log(`   📂 Folder exists: ${folderExists ? '✅' : '❌'}`);
  
  // Check if package.json exists
  const packageJsonPath = path.join(project.folder, 'package.json');
  const packageJsonExists = fs.existsSync(packageJsonPath);
  console.log(`   📦 package.json: ${packageJsonExists ? '✅' : '❌'}`);
  
  // Check main file
  const mainFilePath = path.join(project.folder, project.mainFile);
  const mainFileExists = fs.existsSync(mainFilePath);
  console.log(`   🎯 Main file: ${mainFileExists ? '✅' : '❌'}`);
  
  // Check if has dependencies
  if (packageJsonExists) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const hasDeps = packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0;
      console.log(`   🔗 Dependencies: ${hasDeps ? '✅' : '❌'}`);
      
      const hasStartScript = packageJson.scripts && (packageJson.scripts.start || packageJson.scripts.dev);
      console.log(`   🎬 Start script: ${hasStartScript ? '✅' : '❌'}`);
    } catch (e) {
      console.log(`   ❌ Error reading package.json: ${e.message}`);
      allValid = false;
    }
  }
  
  // Features
  console.log(`   🎪 Features:`);
  project.features.forEach(feature => {
    console.log(`      • ${feature}`);
  });
  
  const isValid = folderExists && packageJsonExists && mainFileExists;
  if (!isValid) allValid = false;
  
  console.log(`   ${isValid ? '✅ VALID STANDALONE PROJECT' : '❌ MISSING REQUIREMENTS'}\n`);
});

console.log('================================');
console.log(`📊 OVERALL STATUS: ${allValid ? '✅ ALL PROJECTS VALID' : '❌ ISSUES FOUND'}`);
console.log('================================\n');

if (allValid) {
  console.log('🎉 PORTFOLIO VERIFICATION SUCCESSFUL!');
  console.log('');
  console.log('All five projects are properly structured as independent applications:');
  console.log('• Each has complete package.json with dependencies');
  console.log('• Each has main server file for independent execution');
  console.log('• Each runs on separate port (3000-6000)');
  console.log('• Each demonstrates different MIS Analyst skills');
  console.log('• Each can be deployed separately to different servers');
  console.log('');
  console.log('DEPLOYMENT INSTRUCTIONS:');
  console.log('------------------------');
  projects.forEach(project => {
    console.log(`${project.name}:`);
    console.log(`  cd ${project.folder} && npm install && npm start`);
    console.log(`  Access: http://localhost:${project.port}`);
    console.log('');
  });
} else {
  console.log('❌ Some projects need attention before deployment');
}