const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

// In-memory data stores
let processes = [
  {
    id: 'PROC-001',
    name: 'Water Quality Testing Workflow',
    description: 'Comprehensive workflow for collecting, testing, and reporting water quality samples',
    category: 'Quality Assurance',
    owner: 'Laboratory Manager',
    status: 'active',
    version: '2.1',
    lastModified: '2024-07-01T10:30:00Z',
    createdBy: 'Sarah Johnson',
    approvedBy: 'Operations Director',
    approvalDate: '2024-07-01T16:00:00Z',
    complianceRequirements: ['EPA Safe Drinking Water Act', 'State Water Quality Standards'],
    riskLevel: 'high',
    estimatedDuration: '4-6 hours',
    frequency: 'Daily'
  },
  {
    id: 'PROC-002',
    name: 'Customer Service Request Handling',
    description: 'Standard process for receiving, categorizing, and resolving customer service requests',
    category: 'Customer Service',
    owner: 'Customer Service Manager',
    status: 'active',
    version: '1.8',
    lastModified: '2024-06-15T14:20:00Z',
    createdBy: 'Michael Chen',
    approvedBy: 'Customer Service Director',
    approvalDate: '2024-06-16T09:00:00Z',
    complianceRequirements: ['Customer Privacy Policy', 'Response Time Standards'],
    riskLevel: 'medium',
    estimatedDuration: '15-30 minutes',
    frequency: 'As needed'
  },
  {
    id: 'PROC-003',
    name: 'Emergency Response Protocol',
    description: 'Critical procedures for responding to water system emergencies and service disruptions',
    category: 'Emergency Management',
    owner: 'Emergency Response Coordinator',
    status: 'active',
    version: '3.0',
    lastModified: '2024-07-05T08:45:00Z',
    createdBy: 'David Wilson',
    approvedBy: 'General Manager',
    approvalDate: '2024-07-05T12:00:00Z',
    complianceRequirements: ['Emergency Response Plan', 'Public Notification Requirements'],
    riskLevel: 'critical',
    estimatedDuration: '1-24 hours',
    frequency: 'Emergency only'
  }
];

let processSteps = [
  // Water Quality Testing Workflow Steps
  {
    id: 'STEP-001',
    processId: 'PROC-001',
    stepNumber: 1,
    name: 'Sample Collection Planning',
    description: 'Review sampling schedule and plan collection routes',
    type: 'task',
    role: 'Field Technician',
    estimatedTime: 30,
    requiredSystems: ['LIMS', 'GPS'],
    inputs: ['Sampling Schedule', 'Route Map'],
    outputs: ['Collection Plan', 'Equipment List'],
    risks: ['Missed sampling locations', 'Equipment failure'],
    complianceNotes: 'Must follow EPA sampling protocols'
  },
  {
    id: 'STEP-002',
    processId: 'PROC-001',
    stepNumber: 2,
    name: 'Equipment Preparation',
    description: 'Gather and sterilize sampling equipment',
    type: 'task',
    role: 'Field Technician',
    estimatedTime: 45,
    requiredSystems: ['Equipment Management System'],
    inputs: ['Equipment List', 'Sterilization Procedures'],
    outputs: ['Sterilized Equipment', 'Equipment Log'],
    risks: ['Cross-contamination', 'Equipment malfunction'],
    complianceNotes: 'Equipment must be certified and calibrated'
  },
  {
    id: 'STEP-003',
    processId: 'PROC-001',
    stepNumber: 3,
    name: 'Sample Collection',
    description: 'Collect water samples from designated locations',
    type: 'task',
    role: 'Field Technician',
    estimatedTime: 120,
    requiredSystems: ['GPS', 'Mobile Data Collection'],
    inputs: ['Sterilized Equipment', 'Sample Containers'],
    outputs: ['Water Samples', 'Collection Records'],
    risks: ['Sample contamination', 'Chain of custody issues'],
    complianceNotes: 'Must maintain proper chain of custody'
  },
  {
    id: 'STEP-004',
    processId: 'PROC-001',
    stepNumber: 4,
    name: 'Laboratory Analysis',
    description: 'Perform chemical and microbiological testing',
    type: 'task',
    role: 'Laboratory Technician',
    estimatedTime: 180,
    requiredSystems: ['LIMS', 'Testing Equipment'],
    inputs: ['Water Samples', 'Test Protocols'],
    outputs: ['Test Results', 'Quality Control Data'],
    risks: ['Testing errors', 'Equipment malfunction'],
    complianceNotes: 'Must follow approved testing methods'
  },
  {
    id: 'STEP-005',
    processId: 'PROC-001',
    stepNumber: 5,
    name: 'Results Review and Approval',
    description: 'Review test results and approve for reporting',
    type: 'decision',
    role: 'Laboratory Manager',
    estimatedTime: 60,
    requiredSystems: ['LIMS'],
    inputs: ['Test Results', 'Quality Control Data'],
    outputs: ['Approved Results', 'Exception Reports'],
    risks: ['Missed non-compliance', 'Reporting delays'],
    complianceNotes: 'Results must be reviewed by certified personnel'
  },

  // Customer Service Request Steps
  {
    id: 'STEP-006',
    processId: 'PROC-002',
    stepNumber: 1,
    name: 'Request Receipt',
    description: 'Receive and log customer service request',
    type: 'task',
    role: 'Customer Service Representative',
    estimatedTime: 5,
    requiredSystems: ['CRM', 'Phone System'],
    inputs: ['Customer Contact', 'Request Details'],
    outputs: ['Service Ticket', 'Customer Acknowledgment'],
    risks: ['Incomplete information', 'System downtime'],
    complianceNotes: 'Must log all customer interactions'
  },
  {
    id: 'STEP-007',
    processId: 'PROC-002',
    stepNumber: 2,
    name: 'Request Categorization',
    description: 'Categorize and prioritize the service request',
    type: 'decision',
    role: 'Customer Service Representative',
    estimatedTime: 10,
    requiredSystems: ['CRM'],
    inputs: ['Service Ticket', 'Categorization Rules'],
    outputs: ['Categorized Ticket', 'Priority Assignment'],
    risks: ['Misclassification', 'Incorrect priority'],
    complianceNotes: 'Must follow established categorization standards'
  },
  {
    id: 'STEP-008',
    processId: 'PROC-002',
    stepNumber: 3,
    name: 'Assignment and Routing',
    description: 'Assign ticket to appropriate department or technician',
    type: 'task',
    role: 'Customer Service Supervisor',
    estimatedTime: 5,
    requiredSystems: ['CRM', 'Work Order System'],
    inputs: ['Categorized Ticket', 'Resource Availability'],
    outputs: ['Work Assignment', 'Notification'],
    risks: ['Resource unavailability', 'Routing errors'],
    complianceNotes: 'Must track assignment and response times'
  }
];

let processMetrics = [
  {
    id: 'METRIC-001',
    processId: 'PROC-001',
    name: 'Sample Collection Accuracy',
    description: 'Percentage of samples collected according to protocol',
    type: 'quality',
    target: 98,
    current: 96.5,
    unit: '%',
    frequency: 'Monthly',
    lastUpdated: '2024-07-01'
  },
  {
    id: 'METRIC-002',
    processId: 'PROC-001',
    name: 'Testing Turnaround Time',
    description: 'Average time from sample collection to results',
    type: 'time',
    target: 24,
    current: 26.5,
    unit: 'hours',
    frequency: 'Weekly',
    lastUpdated: '2024-07-08'
  },
  {
    id: 'METRIC-003',
    processId: 'PROC-002',
    name: 'First Call Resolution Rate',
    description: 'Percentage of requests resolved on first contact',
    type: 'quality',
    target: 75,
    current: 72.3,
    unit: '%',
    frequency: 'Weekly',
    lastUpdated: '2024-07-08'
  },
  {
    id: 'METRIC-004',
    processId: 'PROC-002',
    name: 'Average Response Time',
    description: 'Average time to initial response',
    type: 'time',
    target: 15,
    current: 18.2,
    unit: 'minutes',
    frequency: 'Daily',
    lastUpdated: '2024-07-09'
  }
];

let processRisks = [
  {
    id: 'RISK-001',
    processId: 'PROC-001',
    stepId: 'STEP-003',
    title: 'Sample Contamination',
    description: 'Risk of sample contamination during collection process',
    category: 'Quality',
    probability: 'low',
    impact: 'high',
    riskScore: 6,
    status: 'active',
    mitigation: 'Strict sterilization protocols and proper training',
    owner: 'Laboratory Manager',
    lastReviewed: '2024-07-01'
  },
  {
    id: 'RISK-002',
    processId: 'PROC-002',
    stepId: 'STEP-007',
    title: 'Request Misclassification',
    description: 'Risk of incorrectly categorizing customer requests',
    category: 'Process',
    probability: 'medium',
    impact: 'medium',
    riskScore: 9,
    status: 'active',
    mitigation: 'Enhanced training and decision support tools',
    owner: 'Customer Service Manager',
    lastReviewed: '2024-06-15'
  }
];

let changeRequests = [
  {
    id: 'CR-001',
    processId: 'PROC-001',
    title: 'Implement Real-time Monitoring Integration',
    description: 'Add step to integrate with real-time water quality monitoring system',
    requestedBy: 'Operations Manager',
    requestDate: '2024-07-05T14:30:00Z',
    priority: 'high',
    status: 'under_review',
    justification: 'Improve response time to quality issues',
    impactAssessment: 'Reduces manual monitoring, improves detection speed',
    estimatedEffort: '40 hours',
    approver: 'Laboratory Manager',
    targetImplementation: '2024-08-01'
  },
  {
    id: 'CR-002',
    processId: 'PROC-002',
    title: 'Add Mobile App Support',
    description: 'Enable customers to submit requests through mobile application',
    requestedBy: 'Customer Service Director',
    requestDate: '2024-07-02T09:15:00Z',
    priority: 'medium',
    status: 'approved',
    justification: 'Improve customer convenience and reduce call volume',
    impactAssessment: 'New channel for request submission, requires integration',
    estimatedEffort: '80 hours',
    approver: 'IT Director',
    targetImplementation: '2024-09-01'
  }
];

// API Routes

// Processes
app.get('/api/processes', (req, res) => {
  res.json({ success: true, data: processes });
});

app.get('/api/processes/:id', (req, res) => {
  const process = processes.find(p => p.id === req.params.id);
  if (!process) {
    return res.status(404).json({ success: false, message: 'Process not found' });
  }
  res.json({ success: true, data: process });
});

app.post('/api/processes', (req, res) => {
  const newProcess = {
    id: `PROC-${String(processes.length + 1).padStart(3, '0')}`,
    ...req.body,
    version: '1.0',
    lastModified: new Date().toISOString(),
    status: 'draft'
  };
  processes.push(newProcess);
  res.status(201).json({ success: true, data: newProcess });
});

app.patch('/api/processes/:id', (req, res) => {
  const index = processes.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Process not found' });
  }
  
  processes[index] = {
    ...processes[index],
    ...req.body,
    lastModified: new Date().toISOString()
  };
  
  res.json({ success: true, data: processes[index] });
});

// Process Steps
app.get('/api/processes/:id/steps', (req, res) => {
  const steps = processSteps
    .filter(step => step.processId === req.params.id)
    .sort((a, b) => a.stepNumber - b.stepNumber);
  res.json({ success: true, data: steps });
});

app.post('/api/processes/:id/steps', (req, res) => {
  const newStep = {
    id: `STEP-${String(processSteps.length + 1).padStart(3, '0')}`,
    processId: req.params.id,
    ...req.body
  };
  processSteps.push(newStep);
  res.status(201).json({ success: true, data: newStep });
});

app.patch('/api/steps/:id', (req, res) => {
  const index = processSteps.findIndex(step => step.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Step not found' });
  }
  
  processSteps[index] = { ...processSteps[index], ...req.body };
  res.json({ success: true, data: processSteps[index] });
});

// Process Metrics
app.get('/api/processes/:id/metrics', (req, res) => {
  const metrics = processMetrics.filter(metric => metric.processId === req.params.id);
  res.json({ success: true, data: metrics });
});

app.post('/api/processes/:id/metrics', (req, res) => {
  const newMetric = {
    id: `METRIC-${String(processMetrics.length + 1).padStart(3, '0')}`,
    processId: req.params.id,
    ...req.body,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  processMetrics.push(newMetric);
  res.status(201).json({ success: true, data: newMetric });
});

// Process Risks
app.get('/api/processes/:id/risks', (req, res) => {
  const risks = processRisks.filter(risk => risk.processId === req.params.id);
  res.json({ success: true, data: risks });
});

app.post('/api/processes/:id/risks', (req, res) => {
  const newRisk = {
    id: `RISK-${String(processRisks.length + 1).padStart(3, '0')}`,
    processId: req.params.id,
    ...req.body,
    lastReviewed: new Date().toISOString().split('T')[0]
  };
  processRisks.push(newRisk);
  res.status(201).json({ success: true, data: newRisk });
});

// Change Requests
app.get('/api/change-requests', (req, res) => {
  let filteredRequests = changeRequests;
  if (req.query.processId) {
    filteredRequests = changeRequests.filter(cr => cr.processId === req.query.processId);
  }
  res.json({ success: true, data: filteredRequests });
});

app.post('/api/change-requests', (req, res) => {
  const newChangeRequest = {
    id: `CR-${String(changeRequests.length + 1).padStart(3, '0')}`,
    ...req.body,
    requestDate: new Date().toISOString(),
    status: 'submitted'
  };
  changeRequests.push(newChangeRequest);
  res.status(201).json({ success: true, data: newChangeRequest });
});

app.patch('/api/change-requests/:id', (req, res) => {
  const index = changeRequests.findIndex(cr => cr.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Change request not found' });
  }
  
  changeRequests[index] = { ...changeRequests[index], ...req.body };
  res.json({ success: true, data: changeRequests[index] });
});

// Process Analytics
app.get('/api/analytics/dashboard', (req, res) => {
  const analytics = {
    processes: {
      total: processes.length,
      active: processes.filter(p => p.status === 'active').length,
      draft: processes.filter(p => p.status === 'draft').length,
      underReview: processes.filter(p => p.status === 'under_review').length
    },
    risks: {
      total: processRisks.length,
      critical: processRisks.filter(r => r.riskScore >= 15).length,
      high: processRisks.filter(r => r.riskScore >= 12 && r.riskScore < 15).length,
      medium: processRisks.filter(r => r.riskScore >= 6 && r.riskScore < 12).length,
      low: processRisks.filter(r => r.riskScore < 6).length
    },
    changeRequests: {
      total: changeRequests.length,
      pending: changeRequests.filter(cr => cr.status === 'submitted' || cr.status === 'under_review').length,
      approved: changeRequests.filter(cr => cr.status === 'approved').length,
      implemented: changeRequests.filter(cr => cr.status === 'implemented').length
    },
    metrics: {
      total: processMetrics.length,
      onTarget: processMetrics.filter(m => m.current >= m.target).length,
      belowTarget: processMetrics.filter(m => m.current < m.target).length,
      avgPerformance: processMetrics.length > 0 ? 
        (processMetrics.reduce((sum, m) => sum + (m.current / m.target * 100), 0) / processMetrics.length) : 0
    },
    compliance: {
      totalRequirements: processes.reduce((sum, p) => sum + (p.complianceRequirements ? p.complianceRequirements.length : 0), 0),
      processesWithCompliance: processes.filter(p => p.complianceRequirements && p.complianceRequirements.length > 0).length
    }
  };
  
  res.json({ success: true, data: analytics });
});

// Process optimization suggestions
app.get('/api/processes/:id/optimization', (req, res) => {
  const processId = req.params.id;
  const process = processes.find(p => p.id === processId);
  const steps = processSteps.filter(s => s.processId === processId);
  const metrics = processMetrics.filter(m => m.processId === processId);
  const risks = processRisks.filter(r => r.processId === processId);

  if (!process) {
    return res.status(404).json({ success: false, message: 'Process not found' });
  }

  const suggestions = [];

  // Check for bottlenecks (steps with high time estimates)
  const avgStepTime = steps.reduce((sum, step) => sum + (step.estimatedTime || 0), 0) / steps.length;
  const bottlenecks = steps.filter(step => (step.estimatedTime || 0) > avgStepTime * 1.5);
  
  if (bottlenecks.length > 0) {
    suggestions.push({
      type: 'bottleneck',
      title: 'Potential Bottlenecks Identified',
      description: `${bottlenecks.length} step(s) take significantly longer than average`,
      impact: 'high',
      recommendation: 'Consider automation or resource allocation improvements',
      affectedSteps: bottlenecks.map(s => s.name)
    });
  }

  // Check for metrics below target
  const underperformingMetrics = metrics.filter(m => m.current < m.target);
  if (underperformingMetrics.length > 0) {
    suggestions.push({
      type: 'performance',
      title: 'Performance Metrics Below Target',
      description: `${underperformingMetrics.length} metric(s) not meeting targets`,
      impact: 'medium',
      recommendation: 'Review and optimize related process steps',
      affectedMetrics: underperformingMetrics.map(m => m.name)
    });
  }

  // Check for high-risk steps
  const highRisks = risks.filter(r => r.riskScore >= 12);
  if (highRisks.length > 0) {
    suggestions.push({
      type: 'risk',
      title: 'High-Risk Process Steps',
      description: `${highRisks.length} high-risk area(s) identified`,
      impact: 'high',
      recommendation: 'Implement additional controls or mitigation measures',
      affectedRisks: highRisks.map(r => r.title)
    });
  }

  // Check for system dependencies
  const systemDependencies = {};
  steps.forEach(step => {
    if (step.requiredSystems) {
      step.requiredSystems.forEach(system => {
        systemDependencies[system] = (systemDependencies[system] || 0) + 1;
      });
    }
  });

  const criticalSystems = Object.entries(systemDependencies)
    .filter(([system, count]) => count >= 3)
    .map(([system]) => system);

  if (criticalSystems.length > 0) {
    suggestions.push({
      type: 'dependency',
      title: 'Critical System Dependencies',
      description: `Process heavily depends on ${criticalSystems.length} system(s)`,
      impact: 'medium',
      recommendation: 'Consider redundancy or backup procedures for critical systems',
      criticalSystems
    });
  }

  res.json({ success: true, data: suggestions });
});

// Generate SOP
app.get('/api/processes/:id/sop', (req, res) => {
  const processId = req.params.id;
  const process = processes.find(p => p.id === processId);
  const steps = processSteps
    .filter(s => s.processId === processId)
    .sort((a, b) => a.stepNumber - b.stepNumber);

  if (!process) {
    return res.status(404).json({ success: false, message: 'Process not found' });
  }

  const sop = {
    title: `Standard Operating Procedure: ${process.name}`,
    processId: process.id,
    version: process.version,
    effectiveDate: process.approvalDate,
    owner: process.owner,
    description: process.description,
    purpose: `This SOP defines the standard procedure for ${process.name.toLowerCase()}`,
    scope: 'This procedure applies to all personnel involved in the process',
    responsibilities: steps.reduce((roles, step) => {
      if (step.role && !roles.includes(step.role)) {
        roles.push(step.role);
      }
      return roles;
    }, []),
    procedures: steps.map(step => ({
      stepNumber: step.stepNumber,
      title: step.name,
      description: step.description,
      role: step.role,
      estimatedTime: `${step.estimatedTime} minutes`,
      inputs: step.inputs || [],
      outputs: step.outputs || [],
      systems: step.requiredSystems || [],
      complianceNotes: step.complianceNotes
    })),
    complianceRequirements: process.complianceRequirements || [],
    riskConsiderations: processRisks
      .filter(r => r.processId === processId)
      .map(r => ({
        risk: r.title,
        mitigation: r.mitigation
      })),
    generatedAt: new Date().toISOString()
  };

  res.json({ success: true, data: sop });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Business Process Mapper running on port ${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}`);
});

module.exports = app;