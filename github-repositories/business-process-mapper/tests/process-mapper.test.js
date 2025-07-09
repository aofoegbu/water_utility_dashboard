const request = require('supertest');
const app = require('../server');

describe('Business Process Mapper API', () => {
  describe('Processes', () => {
    test('GET /api/processes should return processes list', async () => {
      const response = await request(app)
        .get('/api/processes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check process structure
      const process = response.body.data[0];
      expect(process).toHaveProperty('id');
      expect(process).toHaveProperty('name');
      expect(process).toHaveProperty('description');
      expect(process).toHaveProperty('category');
      expect(process).toHaveProperty('status');
    });

    test('GET /api/processes/:id should return specific process', async () => {
      const response = await request(app)
        .get('/api/processes/PROC-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('PROC-001');
      expect(response.body.data.name).toBeDefined();
    });

    test('POST /api/processes should create new process', async () => {
      const newProcess = {
        name: 'Test Process',
        description: 'A test process for unit testing',
        category: 'Testing',
        owner: 'Test Manager',
        riskLevel: 'low',
        estimatedDuration: '1 hour',
        frequency: 'As needed'
      };

      const response = await request(app)
        .post('/api/processes')
        .send(newProcess)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newProcess.name);
      expect(response.body.data.id).toMatch(/^PROC-\d{3}$/);
      expect(response.body.data.version).toBe('1.0');
      expect(response.body.data.status).toBe('draft');
    });

    test('PATCH /api/processes/:id should update process', async () => {
      const updates = {
        status: 'active',
        approvedBy: 'Test Approver'
      };

      const response = await request(app)
        .patch('/api/processes/PROC-001')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.approvedBy).toBe('Test Approver');
      expect(response.body.data.lastModified).toBeDefined();
    });

    test('GET /api/processes/:id with invalid ID should return 404', async () => {
      const response = await request(app)
        .get('/api/processes/INVALID-ID')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Process not found');
    });
  });

  describe('Process Steps', () => {
    test('GET /api/processes/:id/steps should return process steps', async () => {
      const response = await request(app)
        .get('/api/processes/PROC-001/steps')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        const step = response.body.data[0];
        expect(step).toHaveProperty('id');
        expect(step).toHaveProperty('processId', 'PROC-001');
        expect(step).toHaveProperty('stepNumber');
        expect(step).toHaveProperty('name');
        expect(step).toHaveProperty('description');
        expect(step).toHaveProperty('role');
      }
    });

    test('POST /api/processes/:id/steps should create new step', async () => {
      const newStep = {
        stepNumber: 99,
        name: 'Test Step',
        description: 'A test step for unit testing',
        type: 'task',
        role: 'Test Role',
        estimatedTime: 15,
        requiredSystems: ['Test System'],
        inputs: ['Test Input'],
        outputs: ['Test Output']
      };

      const response = await request(app)
        .post('/api/processes/PROC-001/steps')
        .send(newStep)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newStep.name);
      expect(response.body.data.processId).toBe('PROC-001');
      expect(response.body.data.id).toMatch(/^STEP-\d{3}$/);
    });

    test('PATCH /api/steps/:id should update step', async () => {
      const updates = {
        estimatedTime: 30,
        description: 'Updated test step description'
      };

      const response = await request(app)
        .patch('/api/steps/STEP-001')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.estimatedTime).toBe(30);
      expect(response.body.data.description).toBe('Updated test step description');
    });
  });

  describe('Process Metrics', () => {
    test('GET /api/processes/:id/metrics should return process metrics', async () => {
      const response = await request(app)
        .get('/api/processes/PROC-001/metrics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        const metric = response.body.data[0];
        expect(metric).toHaveProperty('id');
        expect(metric).toHaveProperty('processId', 'PROC-001');
        expect(metric).toHaveProperty('name');
        expect(metric).toHaveProperty('type');
        expect(metric).toHaveProperty('target');
        expect(metric).toHaveProperty('current');
        expect(metric).toHaveProperty('unit');
      }
    });

    test('POST /api/processes/:id/metrics should create new metric', async () => {
      const newMetric = {
        name: 'Test Metric',
        description: 'A test metric for unit testing',
        type: 'quality',
        target: 95,
        current: 90,
        unit: '%',
        frequency: 'Weekly'
      };

      const response = await request(app)
        .post('/api/processes/PROC-001/metrics')
        .send(newMetric)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newMetric.name);
      expect(response.body.data.processId).toBe('PROC-001');
      expect(response.body.data.id).toMatch(/^METRIC-\d{3}$/);
      expect(response.body.data.lastUpdated).toBeDefined();
    });
  });

  describe('Process Risks', () => {
    test('GET /api/processes/:id/risks should return process risks', async () => {
      const response = await request(app)
        .get('/api/processes/PROC-001/risks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        const risk = response.body.data[0];
        expect(risk).toHaveProperty('id');
        expect(risk).toHaveProperty('processId', 'PROC-001');
        expect(risk).toHaveProperty('title');
        expect(risk).toHaveProperty('category');
        expect(risk).toHaveProperty('probability');
        expect(risk).toHaveProperty('impact');
        expect(risk).toHaveProperty('riskScore');
      }
    });

    test('POST /api/processes/:id/risks should create new risk', async () => {
      const newRisk = {
        title: 'Test Risk',
        description: 'A test risk for unit testing',
        category: 'Process',
        probability: 'low',
        impact: 'medium',
        riskScore: 6,
        status: 'active',
        mitigation: 'Test mitigation strategy',
        owner: 'Test Owner'
      };

      const response = await request(app)
        .post('/api/processes/PROC-001/risks')
        .send(newRisk)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newRisk.title);
      expect(response.body.data.processId).toBe('PROC-001');
      expect(response.body.data.id).toMatch(/^RISK-\d{3}$/);
      expect(response.body.data.lastReviewed).toBeDefined();
    });
  });

  describe('Change Requests', () => {
    test('GET /api/change-requests should return change requests', async () => {
      const response = await request(app)
        .get('/api/change-requests')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        const changeRequest = response.body.data[0];
        expect(changeRequest).toHaveProperty('id');
        expect(changeRequest).toHaveProperty('processId');
        expect(changeRequest).toHaveProperty('title');
        expect(changeRequest).toHaveProperty('status');
        expect(changeRequest).toHaveProperty('requestedBy');
      }
    });

    test('GET /api/change-requests with processId filter should work', async () => {
      const response = await request(app)
        .get('/api/change-requests?processId=PROC-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(cr => {
        expect(cr.processId).toBe('PROC-001');
      });
    });

    test('POST /api/change-requests should create new change request', async () => {
      const newChangeRequest = {
        processId: 'PROC-001',
        title: 'Test Change Request',
        description: 'A test change request for unit testing',
        requestedBy: 'Test User',
        priority: 'medium',
        justification: 'Test justification',
        impactAssessment: 'Test impact assessment',
        estimatedEffort: '10 hours',
        targetImplementation: '2024-12-01'
      };

      const response = await request(app)
        .post('/api/change-requests')
        .send(newChangeRequest)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newChangeRequest.title);
      expect(response.body.data.id).toMatch(/^CR-\d{3}$/);
      expect(response.body.data.status).toBe('submitted');
      expect(response.body.data.requestDate).toBeDefined();
    });

    test('PATCH /api/change-requests/:id should update change request', async () => {
      const updates = {
        status: 'approved',
        approver: 'Test Approver'
      };

      const response = await request(app)
        .patch('/api/change-requests/CR-001')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
      expect(response.body.data.approver).toBe('Test Approver');
    });
  });

  describe('Analytics', () => {
    test('GET /api/analytics/dashboard should return comprehensive analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const analytics = response.body.data;
      expect(analytics).toHaveProperty('processes');
      expect(analytics).toHaveProperty('risks');
      expect(analytics).toHaveProperty('changeRequests');
      expect(analytics).toHaveProperty('metrics');
      expect(analytics).toHaveProperty('compliance');

      // Test processes analytics
      expect(analytics.processes).toHaveProperty('total');
      expect(analytics.processes).toHaveProperty('active');
      expect(analytics.processes).toHaveProperty('draft');

      // Test risks analytics
      expect(analytics.risks).toHaveProperty('total');
      expect(analytics.risks).toHaveProperty('critical');
      expect(analytics.risks).toHaveProperty('high');
      expect(analytics.risks).toHaveProperty('medium');
      expect(analytics.risks).toHaveProperty('low');

      // Test metrics analytics
      expect(analytics.metrics).toHaveProperty('avgPerformance');
      expect(typeof analytics.metrics.avgPerformance).toBe('number');
    });

    test('Analytics calculations should be accurate', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .expect(200);

      const analytics = response.body.data;
      
      // Verify totals are positive numbers
      expect(analytics.processes.total).toBeGreaterThan(0);
      expect(analytics.risks.total).toBeGreaterThan(0);
      expect(analytics.changeRequests.total).toBeGreaterThan(0);
      
      // Verify calculated percentages are within valid range
      expect(analytics.metrics.avgPerformance).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Process Optimization', () => {
    test('GET /api/processes/:id/optimization should return optimization suggestions', async () => {
      const response = await request(app)
        .get('/api/processes/PROC-001/optimization')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        const suggestion = response.body.data[0];
        expect(suggestion).toHaveProperty('type');
        expect(suggestion).toHaveProperty('title');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('impact');
        expect(suggestion).toHaveProperty('recommendation');
      }
    });

    test('GET /api/processes/:id/optimization with invalid ID should return 404', async () => {
      const response = await request(app)
        .get('/api/processes/INVALID-ID/optimization')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Process not found');
    });
  });

  describe('SOP Generation', () => {
    test('GET /api/processes/:id/sop should generate SOP', async () => {
      const response = await request(app)
        .get('/api/processes/PROC-001/sop')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const sop = response.body.data;
      expect(sop).toHaveProperty('title');
      expect(sop).toHaveProperty('processId', 'PROC-001');
      expect(sop).toHaveProperty('version');
      expect(sop).toHaveProperty('description');
      expect(sop).toHaveProperty('procedures');
      expect(sop).toHaveProperty('complianceRequirements');
      expect(sop).toHaveProperty('generatedAt');

      // Check procedures structure
      expect(sop.procedures).toBeInstanceOf(Array);
      if (sop.procedures.length > 0) {
        const procedure = sop.procedures[0];
        expect(procedure).toHaveProperty('stepNumber');
        expect(procedure).toHaveProperty('title');
        expect(procedure).toHaveProperty('description');
        expect(procedure).toHaveProperty('role');
      }
    });

    test('GET /api/processes/:id/sop with invalid ID should return 404', async () => {
      const response = await request(app)
        .get('/api/processes/INVALID-ID/sop')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Process not found');
    });
  });

  describe('Data Consistency', () => {
    test('Process steps should be returned in correct order', async () => {
      const response = await request(app)
        .get('/api/processes/PROC-001/steps')
        .expect(200);

      const steps = response.body.data;
      for (let i = 1; i < steps.length; i++) {
        expect(steps[i].stepNumber).toBeGreaterThanOrEqual(steps[i - 1].stepNumber);
      }
    });

    test('Risk scores should be calculated correctly', async () => {
      const response = await request(app)
        .get('/api/processes/PROC-001/risks')
        .expect(200);

      const risks = response.body.data;
      risks.forEach(risk => {
        expect(risk.riskScore).toBeGreaterThan(0);
        expect(risk.riskScore).toBeLessThanOrEqual(25); // Assuming 5x5 matrix
      });
    });

    test('Change requests should have consistent status values', async () => {
      const response = await request(app)
        .get('/api/change-requests')
        .expect(200);

      const validStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'implemented'];
      const changeRequests = response.body.data;
      
      changeRequests.forEach(cr => {
        expect(validStatuses).toContain(cr.status);
      });
    });
  });
});