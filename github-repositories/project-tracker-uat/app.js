const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory data stores
let projects = [
  {
    id: 'PROJ-001',
    name: 'Water System Modernization',
    description: 'Upgrade legacy water monitoring systems to modern IoT-based infrastructure',
    status: 'in_progress',
    phase: 'execution',
    priority: 'high',
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    budget: 850000,
    spentBudget: 420000,
    projectManager: 'Sarah Johnson',
    sponsor: 'TMWA Board of Directors',
    stakeholders: ['Operations Team', 'IT Department', 'Finance', 'Regulatory Affairs'],
    createdAt: '2024-05-15T09:00:00Z',
    methodology: 'hybrid'
  },
  {
    id: 'PROJ-002', 
    name: 'Customer Portal Enhancement',
    description: 'Develop self-service customer portal for billing and service requests',
    status: 'planning',
    phase: 'planning',
    priority: 'medium',
    startDate: '2024-08-01',
    endDate: '2024-11-30',
    budget: 425000,
    spentBudget: 35000,
    projectManager: 'Michael Chen',
    sponsor: 'Customer Service Director',
    stakeholders: ['Customer Service', 'IT Development', 'UX Design', 'Marketing'],
    createdAt: '2024-07-01T10:30:00Z',
    methodology: 'agile'
  }
];

let requirements = [
  {
    id: 'REQ-001',
    projectId: 'PROJ-001',
    title: 'Real-time Pressure Monitoring',
    description: 'System must provide real-time monitoring of water pressure across all distribution points',
    type: 'functional',
    priority: 'high',
    status: 'approved',
    source: 'Operations Team',
    acceptanceCriteria: [
      'Pressure readings updated every 5 seconds',
      'Alert generation when pressure falls below 40 PSI',
      'Historical data retention for 5 years',
      'Dashboard visualization with color-coded status'
    ],
    estimatedEffort: 40,
    businessValue: 'Prevent service disruptions and optimize system performance',
    dependencies: ['REQ-002'],
    createdAt: '2024-06-01T14:00:00Z',
    lastModified: '2024-06-15T11:30:00Z'
  },
  {
    id: 'REQ-002',
    projectId: 'PROJ-001',
    title: 'IoT Sensor Integration',
    description: 'Integrate wireless IoT sensors throughout the distribution network',
    type: 'technical',
    priority: 'high',
    status: 'in_progress',
    source: 'IT Department',
    acceptanceCriteria: [
      'Support for LoRaWAN and cellular connectivity',
      'Battery life minimum 3 years',
      'IP67 weatherproof rating',
      'OTA firmware update capability'
    ],
    estimatedEffort: 60,
    businessValue: 'Enable modern monitoring capabilities and reduce manual inspections',
    dependencies: [],
    createdAt: '2024-06-01T14:30:00Z',
    lastModified: '2024-07-01T09:15:00Z'
  },
  {
    id: 'REQ-003',
    projectId: 'PROJ-002',
    title: 'Online Bill Payment',
    description: 'Customers can view and pay bills online with multiple payment options',
    type: 'functional',
    priority: 'high',
    status: 'approved',
    source: 'Customer Service',
    acceptanceCriteria: [
      'Support credit/debit cards, ACH, and PayPal',
      'PCI DSS compliant payment processing',
      'Payment confirmation via email',
      'Autopay enrollment option'
    ],
    estimatedEffort: 32,
    businessValue: 'Reduce payment processing costs and improve customer satisfaction',
    dependencies: ['REQ-004'],
    createdAt: '2024-07-01T16:00:00Z',
    lastModified: '2024-07-05T13:20:00Z'
  }
];

let testCases = [
  {
    id: 'TC-001',
    requirementId: 'REQ-001',
    projectId: 'PROJ-001',
    title: 'Verify Real-time Pressure Display',
    description: 'Test that pressure readings are displayed and updated in real-time',
    preconditions: 'IoT sensors installed and configured',
    steps: [
      'Navigate to pressure monitoring dashboard',
      'Observe pressure readings for Station A',
      'Manually adjust pressure at Station A',
      'Verify reading updates within 5 seconds'
    ],
    expectedResult: 'Dashboard shows updated pressure within 5 seconds',
    priority: 'high',
    type: 'functional',
    status: 'passed',
    executedBy: 'Test Engineer 1',
    executedAt: '2024-07-08T10:30:00Z',
    notes: 'All pressure readings updated correctly within 3-4 seconds'
  },
  {
    id: 'TC-002',
    requirementId: 'REQ-001',
    projectId: 'PROJ-001',
    title: 'Verify Low Pressure Alert',
    description: 'Test alert generation when pressure drops below threshold',
    preconditions: 'Alert system configured with 40 PSI threshold',
    steps: [
      'Set up test environment with controllable pressure',
      'Gradually reduce pressure to 35 PSI',
      'Monitor alert system',
      'Verify alert triggered and notification sent'
    ],
    expectedResult: 'Alert generated immediately when pressure reaches 39 PSI',
    priority: 'high',
    type: 'functional',
    status: 'failed',
    executedBy: 'Test Engineer 2',
    executedAt: '2024-07-08T14:15:00Z',
    notes: 'Alert triggered at 35 PSI instead of 40 PSI - threshold configuration issue'
  },
  {
    id: 'TC-003',
    requirementId: 'REQ-003',
    projectId: 'PROJ-002',
    title: 'Credit Card Payment Processing',
    description: 'Test successful credit card payment processing',
    preconditions: 'Customer account with outstanding balance',
    steps: [
      'Login to customer portal',
      'Navigate to billing section',
      'Select payment amount',
      'Enter valid credit card information',
      'Submit payment'
    ],
    expectedResult: 'Payment processed successfully with confirmation',
    priority: 'high',
    type: 'functional',
    status: 'not_executed',
    executedBy: null,
    executedAt: null,
    notes: null
  }
];

let uatSessions = [
  {
    id: 'UAT-001',
    projectId: 'PROJ-001',
    name: 'Pressure Monitoring UAT - Phase 1',
    description: 'User acceptance testing for basic pressure monitoring functionality',
    startDate: '2024-07-10',
    endDate: '2024-07-17',
    status: 'completed',
    participants: [
      { name: 'John Martinez', role: 'Operations Supervisor', department: 'Operations' },
      { name: 'Lisa Wong', role: 'Field Technician', department: 'Maintenance' },
      { name: 'Robert Kim', role: 'System Administrator', department: 'IT' }
    ],
    testCases: ['TC-001', 'TC-002'],
    feedback: [
      {
        participant: 'John Martinez',
        rating: 4,
        comments: 'Interface is intuitive, but alerts need to be more prominent',
        issues: ['Alert visibility needs improvement', 'Need mobile app access']
      },
      {
        participant: 'Lisa Wong',
        rating: 5,
        comments: 'Excellent real-time updates, much better than old system',
        issues: []
      }
    ],
    overallRating: 4.3,
    approved: true,
    approvedBy: 'John Martinez',
    approvedAt: '2024-07-17T16:00:00Z',
    notes: 'Approved with minor enhancements for alert visibility'
  },
  {
    id: 'UAT-002',
    projectId: 'PROJ-002',
    name: 'Customer Portal UAT - Beta Testing',
    description: 'Beta testing with select customers for portal functionality',
    startDate: '2024-07-20',
    endDate: '2024-07-27',
    status: 'in_progress',
    participants: [
      { name: 'Maria Garcia', role: 'Beta Customer', department: 'External' },
      { name: 'David Thompson', role: 'Customer Service Rep', department: 'Customer Service' },
      { name: 'Jennifer Lee', role: 'UX Designer', department: 'IT' }
    ],
    testCases: ['TC-003'],
    feedback: [],
    overallRating: null,
    approved: false,
    approvedBy: null,
    approvedAt: null,
    notes: 'Testing currently in progress'
  }
];

let risks = [
  {
    id: 'RISK-001',
    projectId: 'PROJ-001',
    title: 'IoT Sensor Compatibility Issues',
    description: 'Risk that new IoT sensors may not integrate properly with existing SCADA system',
    category: 'technical',
    probability: 'medium',
    impact: 'high',
    riskScore: 15, // probability * impact (3 * 5)
    status: 'active',
    owner: 'Michael Chen',
    mitigation: 'Conduct proof-of-concept testing with vendor before full deployment',
    contingency: 'Have backup sensor vendor identified and pre-qualified',
    identifiedAt: '2024-06-15T11:00:00Z',
    lastReviewed: '2024-07-01T14:30:00Z'
  },
  {
    id: 'RISK-002',
    projectId: 'PROJ-001',
    title: 'Budget Overrun Due to Scope Creep',
    description: 'Additional requirements being added without corresponding budget increases',
    category: 'financial',
    probability: 'high',
    impact: 'medium',
    riskScore: 12, // 4 * 3
    status: 'mitigated',
    owner: 'Sarah Johnson',
    mitigation: 'Implement strict change control process with sponsor approval required',
    contingency: 'Phase implementation to stay within budget constraints',
    identifiedAt: '2024-06-20T09:15:00Z',
    lastReviewed: '2024-07-08T16:45:00Z'
  }
];

// API Routes

// Projects
app.get('/api/projects', (req, res) => {
  res.json({ success: true, data: projects });
});

app.get('/api/projects/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }
  res.json({ success: true, data: project });
});

app.post('/api/projects', (req, res) => {
  const newProject = {
    id: `PROJ-${String(projects.length + 1).padStart(3, '0')}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    spentBudget: 0
  };
  projects.push(newProject);
  res.status(201).json({ success: true, data: newProject });
});

// Requirements
app.get('/api/requirements', (req, res) => {
  let filteredRequirements = requirements;
  if (req.query.projectId) {
    filteredRequirements = requirements.filter(r => r.projectId === req.query.projectId);
  }
  res.json({ success: true, data: filteredRequirements });
});

app.post('/api/requirements', (req, res) => {
  const newRequirement = {
    id: `REQ-${String(requirements.length + 1).padStart(3, '0')}`,
    ...req.body,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
  requirements.push(newRequirement);
  res.status(201).json({ success: true, data: newRequirement });
});

app.patch('/api/requirements/:id', (req, res) => {
  const index = requirements.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Requirement not found' });
  }
  
  requirements[index] = {
    ...requirements[index],
    ...req.body,
    lastModified: new Date().toISOString()
  };
  
  res.json({ success: true, data: requirements[index] });
});

// Test Cases
app.get('/api/test-cases', (req, res) => {
  let filteredTestCases = testCases;
  if (req.query.projectId) {
    filteredTestCases = testCases.filter(tc => tc.projectId === req.query.projectId);
  }
  if (req.query.requirementId) {
    filteredTestCases = filteredTestCases.filter(tc => tc.requirementId === req.query.requirementId);
  }
  res.json({ success: true, data: filteredTestCases });
});

app.post('/api/test-cases', (req, res) => {
  const newTestCase = {
    id: `TC-${String(testCases.length + 1).padStart(3, '0')}`,
    ...req.body,
    status: req.body.status || 'not_executed',
    executedBy: null,
    executedAt: null,
    notes: null
  };
  testCases.push(newTestCase);
  res.status(201).json({ success: true, data: newTestCase });
});

app.patch('/api/test-cases/:id', (req, res) => {
  const index = testCases.findIndex(tc => tc.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Test case not found' });
  }
  
  const updates = { ...req.body };
  if (updates.status && updates.status !== 'not_executed') {
    updates.executedAt = new Date().toISOString();
  }
  
  testCases[index] = { ...testCases[index], ...updates };
  res.json({ success: true, data: testCases[index] });
});

// UAT Sessions
app.get('/api/uat-sessions', (req, res) => {
  let filteredSessions = uatSessions;
  if (req.query.projectId) {
    filteredSessions = uatSessions.filter(uat => uat.projectId === req.query.projectId);
  }
  res.json({ success: true, data: filteredSessions });
});

app.post('/api/uat-sessions', (req, res) => {
  const newSession = {
    id: `UAT-${String(uatSessions.length + 1).padStart(3, '0')}`,
    ...req.body,
    feedback: [],
    overallRating: null,
    approved: false,
    approvedBy: null,
    approvedAt: null
  };
  uatSessions.push(newSession);
  res.status(201).json({ success: true, data: newSession });
});

app.patch('/api/uat-sessions/:id', (req, res) => {
  const index = uatSessions.findIndex(uat => uat.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'UAT session not found' });
  }
  
  const updates = { ...req.body };
  if (updates.approved && !uatSessions[index].approvedAt) {
    updates.approvedAt = new Date().toISOString();
  }
  
  uatSessions[index] = { ...uatSessions[index], ...updates };
  res.json({ success: true, data: uatSessions[index] });
});

// Risks
app.get('/api/risks', (req, res) => {
  let filteredRisks = risks;
  if (req.query.projectId) {
    filteredRisks = risks.filter(r => r.projectId === req.query.projectId);
  }
  res.json({ success: true, data: filteredRisks });
});

app.post('/api/risks', (req, res) => {
  const newRisk = {
    id: `RISK-${String(risks.length + 1).padStart(3, '0')}`,
    ...req.body,
    identifiedAt: new Date().toISOString(),
    lastReviewed: new Date().toISOString()
  };
  risks.push(newRisk);
  res.status(201).json({ success: true, data: newRisk });
});

// Dashboard Analytics
app.get('/api/dashboard/analytics', (req, res) => {
  const analytics = {
    projects: {
      total: projects.length,
      active: projects.filter(p => p.status === 'in_progress').length,
      completed: projects.filter(p => p.status === 'completed').length,
      onHold: projects.filter(p => p.status === 'on_hold').length
    },
    requirements: {
      total: requirements.length,
      approved: requirements.filter(r => r.status === 'approved').length,
      inProgress: requirements.filter(r => r.status === 'in_progress').length,
      pending: requirements.filter(r => r.status === 'pending').length
    },
    testing: {
      totalTestCases: testCases.length,
      passed: testCases.filter(tc => tc.status === 'passed').length,
      failed: testCases.filter(tc => tc.status === 'failed').length,
      notExecuted: testCases.filter(tc => tc.status === 'not_executed').length,
      passRate: testCases.length > 0 ? 
        (testCases.filter(tc => tc.status === 'passed').length / testCases.filter(tc => tc.status !== 'not_executed').length * 100) || 0 : 0
    },
    uat: {
      totalSessions: uatSessions.length,
      completed: uatSessions.filter(uat => uat.status === 'completed').length,
      inProgress: uatSessions.filter(uat => uat.status === 'in_progress').length,
      approved: uatSessions.filter(uat => uat.approved).length
    },
    risks: {
      total: risks.length,
      high: risks.filter(r => r.riskScore >= 15).length,
      medium: risks.filter(r => r.riskScore >= 9 && r.riskScore < 15).length,
      low: risks.filter(r => r.riskScore < 9).length,
      active: risks.filter(r => r.status === 'active').length
    },
    budget: {
      totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
      totalSpent: projects.reduce((sum, p) => sum + p.spentBudget, 0),
      utilizationRate: projects.reduce((sum, p) => sum + p.budget, 0) > 0 ?
        (projects.reduce((sum, p) => sum + p.spentBudget, 0) / projects.reduce((sum, p) => sum + p.budget, 0) * 100) : 0
    }
  };
  
  res.json({ success: true, data: analytics });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Project Tracker running on port ${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}`);
});

module.exports = app;