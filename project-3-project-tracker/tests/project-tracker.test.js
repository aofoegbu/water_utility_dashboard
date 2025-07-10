const request = require('supertest');
const app = require('../app');

describe('Project Tracker API', () => {
  describe('Projects', () => {
    test('GET /api/projects should return projects list', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/projects/:id should return specific project', async () => {
      const response = await request(app)
        .get('/api/projects/PROJ-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('PROJ-001');
      expect(response.body.data.name).toBeDefined();
    });

    test('POST /api/projects should create new project', async () => {
      const newProject = {
        name: 'Test Project',
        description: 'A test project for unit testing',
        status: 'planning',
        phase: 'initiation',
        priority: 'medium',
        startDate: '2024-08-01',
        endDate: '2024-12-31',
        budget: 100000,
        projectManager: 'Test Manager',
        sponsor: 'Test Sponsor',
        stakeholders: ['Test Stakeholder'],
        methodology: 'agile'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(newProject)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newProject.name);
      expect(response.body.data.id).toMatch(/^PROJ-\d{3}$/);
      expect(response.body.data.spentBudget).toBe(0);
    });

    test('GET /api/projects/:id with invalid ID should return 404', async () => {
      const response = await request(app)
        .get('/api/projects/INVALID-ID')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Project not found');
    });
  });

  describe('Requirements', () => {
    test('GET /api/requirements should return requirements list', async () => {
      const response = await request(app)
        .get('/api/requirements')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('GET /api/requirements with projectId filter should filter correctly', async () => {
      const response = await request(app)
        .get('/api/requirements?projectId=PROJ-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(req => {
        expect(req.projectId).toBe('PROJ-001');
      });
    });

    test('POST /api/requirements should create new requirement', async () => {
      const newRequirement = {
        projectId: 'PROJ-001',
        title: 'Test Requirement',
        description: 'A test requirement for unit testing',
        type: 'functional',
        priority: 'medium',
        status: 'pending',
        source: 'Test Team',
        acceptanceCriteria: ['Test criteria 1', 'Test criteria 2'],
        estimatedEffort: 10,
        businessValue: 'Test business value',
        dependencies: []
      };

      const response = await request(app)
        .post('/api/requirements')
        .send(newRequirement)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newRequirement.title);
      expect(response.body.data.id).toMatch(/^REQ-\d{3}$/);
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.lastModified).toBeDefined();
    });

    test('PATCH /api/requirements/:id should update requirement', async () => {
      const updates = {
        status: 'approved',
        priority: 'high'
      };

      const response = await request(app)
        .patch('/api/requirements/REQ-001')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
      expect(response.body.data.priority).toBe('high');
      expect(response.body.data.lastModified).toBeDefined();
    });

    test('PATCH /api/requirements/:id with invalid ID should return 404', async () => {
      const response = await request(app)
        .patch('/api/requirements/INVALID-ID')
        .send({ status: 'approved' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Requirement not found');
    });
  });

  describe('Test Cases', () => {
    test('GET /api/test-cases should return test cases list', async () => {
      const response = await request(app)
        .get('/api/test-cases')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('GET /api/test-cases with filters should work correctly', async () => {
      const response = await request(app)
        .get('/api/test-cases?projectId=PROJ-001&requirementId=REQ-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(tc => {
        expect(tc.projectId).toBe('PROJ-001');
        expect(tc.requirementId).toBe('REQ-001');
      });
    });

    test('POST /api/test-cases should create new test case', async () => {
      const newTestCase = {
        requirementId: 'REQ-001',
        projectId: 'PROJ-001',
        title: 'Test Case for Unit Testing',
        description: 'A test case created for unit testing',
        preconditions: 'Test environment set up',
        steps: ['Step 1', 'Step 2', 'Step 3'],
        expectedResult: 'Test should pass',
        priority: 'high',
        type: 'functional'
      };

      const response = await request(app)
        .post('/api/test-cases')
        .send(newTestCase)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newTestCase.title);
      expect(response.body.data.id).toMatch(/^TC-\d{3}$/);
      expect(response.body.data.status).toBe('not_executed');
    });

    test('PATCH /api/test-cases/:id should update test case and set execution time', async () => {
      const updates = {
        status: 'passed',
        executedBy: 'Test Engineer',
        notes: 'Test executed successfully'
      };

      const response = await request(app)
        .patch('/api/test-cases/TC-001')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('passed');
      expect(response.body.data.executedBy).toBe('Test Engineer');
      expect(response.body.data.executedAt).toBeDefined();
    });
  });

  describe('UAT Sessions', () => {
    test('GET /api/uat-sessions should return UAT sessions list', async () => {
      const response = await request(app)
        .get('/api/uat-sessions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('GET /api/uat-sessions with projectId filter should work', async () => {
      const response = await request(app)
        .get('/api/uat-sessions?projectId=PROJ-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(uat => {
        expect(uat.projectId).toBe('PROJ-001');
      });
    });

    test('POST /api/uat-sessions should create new UAT session', async () => {
      const newUATSession = {
        projectId: 'PROJ-001',
        name: 'Test UAT Session',
        description: 'A UAT session for unit testing',
        startDate: '2024-08-01',
        endDate: '2024-08-07',
        status: 'planning',
        participants: [
          { name: 'Test User', role: 'End User', department: 'Operations' }
        ],
        testCases: ['TC-001'],
        notes: 'Test UAT session'
      };

      const response = await request(app)
        .post('/api/uat-sessions')
        .send(newUATSession)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newUATSession.name);
      expect(response.body.data.id).toMatch(/^UAT-\d{3}$/);
      expect(response.body.data.approved).toBe(false);
    });

    test('PATCH /api/uat-sessions/:id with approval should set approval timestamp', async () => {
      const updates = {
        status: 'completed',
        approved: true,
        approvedBy: 'Test Approver',
        overallRating: 4.5
      };

      const response = await request(app)
        .patch('/api/uat-sessions/UAT-001')
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.approved).toBe(true);
      expect(response.body.data.approvedBy).toBe('Test Approver');
      expect(response.body.data.approvedAt).toBeDefined();
    });
  });

  describe('Risks', () => {
    test('GET /api/risks should return risks list', async () => {
      const response = await request(app)
        .get('/api/risks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('GET /api/risks with projectId filter should work', async () => {
      const response = await request(app)
        .get('/api/risks?projectId=PROJ-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(risk => {
        expect(risk.projectId).toBe('PROJ-001');
      });
    });

    test('POST /api/risks should create new risk', async () => {
      const newRisk = {
        projectId: 'PROJ-001',
        title: 'Test Risk',
        description: 'A test risk for unit testing',
        category: 'technical',
        probability: 'low',
        impact: 'medium',
        riskScore: 6,
        status: 'active',
        owner: 'Test Owner',
        mitigation: 'Test mitigation strategy',
        contingency: 'Test contingency plan'
      };

      const response = await request(app)
        .post('/api/risks')
        .send(newRisk)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newRisk.title);
      expect(response.body.data.id).toMatch(/^RISK-\d{3}$/);
      expect(response.body.data.identifiedAt).toBeDefined();
      expect(response.body.data.lastReviewed).toBeDefined();
    });
  });

  describe('Dashboard Analytics', () => {
    test('GET /api/dashboard/analytics should return comprehensive analytics', async () => {
      const response = await request(app)
        .get('/api/dashboard/analytics')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const analytics = response.body.data;
      expect(analytics).toHaveProperty('projects');
      expect(analytics).toHaveProperty('requirements');
      expect(analytics).toHaveProperty('testing');
      expect(analytics).toHaveProperty('uat');
      expect(analytics).toHaveProperty('risks');
      expect(analytics).toHaveProperty('budget');

      // Test projects analytics
      expect(analytics.projects).toHaveProperty('total');
      expect(analytics.projects).toHaveProperty('active');
      expect(analytics.projects).toHaveProperty('completed');

      // Test testing analytics
      expect(analytics.testing).toHaveProperty('passRate');
      expect(typeof analytics.testing.passRate).toBe('number');

      // Test budget analytics
      expect(analytics.budget).toHaveProperty('utilizationRate');
      expect(typeof analytics.budget.utilizationRate).toBe('number');
    });

    test('Analytics calculations should be accurate', async () => {
      const response = await request(app)
        .get('/api/dashboard/analytics')
        .expect(200);

      const analytics = response.body.data;
      
      // Verify totals match actual data counts
      expect(analytics.projects.total).toBeGreaterThan(0);
      expect(analytics.requirements.total).toBeGreaterThan(0);
      expect(analytics.testing.totalTestCases).toBeGreaterThan(0);
      expect(analytics.risks.total).toBeGreaterThan(0);
      
      // Verify calculated percentages are within valid range
      expect(analytics.testing.passRate).toBeGreaterThanOrEqual(0);
      expect(analytics.testing.passRate).toBeLessThanOrEqual(100);
      expect(analytics.budget.utilizationRate).toBeGreaterThanOrEqual(0);
    });
  });
});