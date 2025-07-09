const request = require('supertest');
const app = require('../server');

describe('ERP/CRM Integration API Tests', () => {
  
  // ==================== CRM CUSTOMER TESTS ====================
  
  describe('CRM Customer Management', () => {
    
    test('GET /api/crm/customers - should return all customers', async () => {
      const response = await request(app)
        .get('/api/crm/customers')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.total).toEqual(response.body.data.length);
    });
    
    test('GET /api/crm/customers with status filter', async () => {
      const response = await request(app)
        .get('/api/crm/customers?status=active')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      response.body.data.forEach(customer => {
        expect(customer.status).toBe('active');
      });
    });
    
    test('GET /api/crm/customers with tier filter', async () => {
      const response = await request(app)
        .get('/api/crm/customers?tier=enterprise')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      response.body.data.forEach(customer => {
        expect(customer.tier).toBe('enterprise');
      });
    });
    
    test('GET /api/crm/customers/:id - should return specific customer', async () => {
      const response = await request(app)
        .get('/api/crm/customers/CRM001')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('CRM001');
      expect(response.body.data.name).toBeDefined();
      expect(response.body.data.email).toBeDefined();
    });
    
    test('GET /api/crm/customers/:id - should return 404 for non-existent customer', async () => {
      const response = await request(app)
        .get('/api/crm/customers/INVALID')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Customer not found');
    });
    
    test('POST /api/crm/customers - should create new customer', async () => {
      const newCustomer = {
        name: 'Test Company Inc',
        email: 'test@testcompany.com',
        phone: '+1-555-9999',
        address: '123 Test Street, Test City, TC 12345',
        tier: 'professional'
      };
      
      const response = await request(app)
        .post('/api/crm/customers')
        .send(newCustomer)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newCustomer.name);
      expect(response.body.data.email).toBe(newCustomer.email);
      expect(response.body.data.id).toMatch(/^CRM/);
      expect(response.body.data.status).toBe('active');
      expect(response.body.message).toContain('synchronized with ERP');
    });
    
    test('POST /api/crm/customers - should require name and email', async () => {
      const invalidCustomer = {
        phone: '+1-555-9999'
      };
      
      const response = await request(app)
        .post('/api/crm/customers')
        .send(invalidCustomer)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Name and email are required');
    });
    
    test('PUT /api/crm/customers/:id - should update existing customer', async () => {
      const updates = {
        phone: '+1-555-0000',
        tier: 'enterprise'
      };
      
      const response = await request(app)
        .put('/api/crm/customers/CRM001')
        .send(updates)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.phone).toBe(updates.phone);
      expect(response.body.data.tier).toBe(updates.tier);
      expect(response.body.message).toContain('synchronized with ERP');
    });
    
  });
  
  // ==================== CRM TICKET TESTS ====================
  
  describe('CRM Ticket Management', () => {
    
    test('GET /api/crm/tickets - should return all tickets with customer data', async () => {
      const response = await request(app)
        .get('/api/crm/tickets')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check if customer data is enriched
      const ticket = response.body.data[0];
      expect(ticket.customer).toBeDefined();
      expect(ticket.customer.name).toBeDefined();
    });
    
    test('GET /api/crm/tickets with status filter', async () => {
      const response = await request(app)
        .get('/api/crm/tickets?status=open')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      response.body.data.forEach(ticket => {
        expect(ticket.status).toBe('open');
      });
    });
    
    test('GET /api/crm/tickets with priority filter', async () => {
      const response = await request(app)
        .get('/api/crm/tickets?priority=high')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      response.body.data.forEach(ticket => {
        expect(ticket.priority).toBe('high');
      });
    });
    
    test('POST /api/crm/tickets - should create new ticket', async () => {
      const newTicket = {
        customerId: 'CRM001',
        title: 'Test Integration Issue',
        description: 'Testing the ticket creation workflow',
        priority: 'high',
        category: 'integration'
      };
      
      const response = await request(app)
        .post('/api/crm/tickets')
        .send(newTicket)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newTicket.title);
      expect(response.body.data.customerId).toBe(newTicket.customerId);
      expect(response.body.data.id).toMatch(/^TKT/);
      expect(response.body.data.status).toBe('open');
      expect(response.body.message).toContain('synchronized with ERP');
    });
    
    test('POST /api/crm/tickets - should require customerId, title, and description', async () => {
      const invalidTicket = {
        title: 'Incomplete Ticket'
      };
      
      const response = await request(app)
        .post('/api/crm/tickets')
        .send(invalidTicket)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });
    
    test('POST /api/crm/tickets - should validate customer exists', async () => {
      const invalidTicket = {
        customerId: 'INVALID',
        title: 'Test Ticket',
        description: 'Test description'
      };
      
      const response = await request(app)
        .post('/api/crm/tickets')
        .send(invalidTicket)
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Customer not found');
    });
    
    test('PUT /api/crm/tickets/:id - should update ticket status', async () => {
      const updates = {
        status: 'in_progress',
        assignedTo: 'Test Engineer'
      };
      
      const response = await request(app)
        .put('/api/crm/tickets/TKT001')
        .send(updates)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(updates.status);
      expect(response.body.data.assignedTo).toBe(updates.assignedTo);
      expect(response.body.message).toContain('synchronized with ERP');
    });
    
  });
  
  // ==================== ERP SYSTEM TESTS ====================
  
  describe('ERP System Operations', () => {
    
    test('GET /api/erp/financial-summary - should return financial metrics', async () => {
      const response = await request(app)
        .get('/api/erp/financial-summary')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalRevenue).toBeDefined();
      expect(response.body.data.monthlyRecurring).toBeDefined();
      expect(response.body.data.metrics).toBeDefined();
      expect(response.body.data.metrics.customerGrowth).toBeDefined();
    });
    
    test('GET /api/erp/inventory - should return inventory data with alerts', async () => {
      const response = await request(app)
        .get('/api/erp/inventory')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.summary).toBeDefined();
      expect(response.body.summary.totalValue).toBeDefined();
      expect(response.body.summary.lowStockItems).toBeDefined();
      
      // Check inventory item structure
      const item = response.body.data[0];
      expect(item.sku).toBeDefined();
      expect(item.quantity).toBeDefined();
      expect(item.status).toBeDefined();
    });
    
    test('GET /api/erp/orders - should return order status data', async () => {
      const response = await request(app)
        .get('/api/erp/orders')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Check order structure
      const order = response.body.data[0];
      expect(order.customerId).toBeDefined();
      expect(order.orderNumber).toBeDefined();
      expect(order.status).toBeDefined();
      expect(order.items).toBeInstanceOf(Array);
    });
    
  });
  
  // ==================== INTEGRATION TESTS ====================
  
  describe('Integration Layer', () => {
    
    test('GET /api/integration/health - should return system health status', async () => {
      const response = await request(app)
        .get('/api/integration/health')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.overall).toBeDefined();
      expect(response.body.data.systems).toBeDefined();
      expect(response.body.data.systems.crm).toBeDefined();
      expect(response.body.data.systems.erp).toBeDefined();
      expect(response.body.data.systems.integration).toBeDefined();
      
      // Check system metrics
      expect(response.body.data.systems.crm.status).toBe('online');
      expect(response.body.data.systems.crm.responseTime).toBeDefined();
      expect(response.body.data.systems.crm.uptime).toBeDefined();
    });
    
    test('GET /api/integration/logs - should return integration logs', async () => {
      const response = await request(app)
        .get('/api/integration/logs')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Check log structure
      const log = response.body.data[0];
      expect(log.source).toBeDefined();
      expect(log.target).toBeDefined();
      expect(log.operation).toBeDefined();
      expect(log.status).toBeDefined();
      expect(log.timestamp).toBeDefined();
    });
    
    test('GET /api/integration/logs with filters', async () => {
      const response = await request(app)
        .get('/api/integration/logs?source=CRM&limit=10')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
      response.body.data.forEach(log => {
        expect(log.source).toBe('CRM');
      });
    });
    
    test('POST /api/integration/sync - should trigger manual sync', async () => {
      const syncRequest = {
        source: 'CRM',
        target: 'ERP',
        operation: 'customer_sync'
      };
      
      const response = await request(app)
        .post('/api/integration/sync')
        .send(syncRequest)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('initiated');
      expect(response.body.estimatedDuration).toBeDefined();
    });
    
    test('POST /api/integration/sync - should require all fields', async () => {
      const invalidSync = {
        source: 'CRM'
      };
      
      const response = await request(app)
        .post('/api/integration/sync')
        .send(invalidSync)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });
    
  });
  
  // ==================== MAINTENANCE TESTS ====================
  
  describe('Maintenance Scheduling', () => {
    
    test('GET /api/maintenance/schedules - should return maintenance schedules', async () => {
      const response = await request(app)
        .get('/api/maintenance/schedules')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      // Check schedule structure
      const schedule = response.body.data[0];
      expect(schedule.systemType).toBeDefined();
      expect(schedule.systemName).toBeDefined();
      expect(schedule.scheduledDate).toBeDefined();
      expect(schedule.type).toBeDefined();
      expect(schedule.status).toBeDefined();
    });
    
    test('GET /api/maintenance/schedules with system filter', async () => {
      const response = await request(app)
        .get('/api/maintenance/schedules?systemType=CRM')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      response.body.data.forEach(schedule => {
        expect(schedule.systemType).toBe('CRM');
      });
    });
    
    test('POST /api/maintenance/schedules - should create maintenance schedule', async () => {
      const newMaintenance = {
        systemType: 'Integration',
        systemName: 'Test API Gateway',
        scheduledDate: '2024-12-25T02:00:00Z',
        duration: 3,
        type: 'upgrade',
        description: 'Test maintenance schedule',
        impactLevel: 'low'
      };
      
      const response = await request(app)
        .post('/api/maintenance/schedules')
        .send(newMaintenance)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.systemName).toBe(newMaintenance.systemName);
      expect(response.body.data.id).toMatch(/^MAINT/);
      expect(response.body.data.status).toBe('scheduled');
      expect(response.body.message).toContain('scheduled');
    });
    
    test('POST /api/maintenance/schedules - should require essential fields', async () => {
      const invalidMaintenance = {
        systemName: 'Test System'
      };
      
      const response = await request(app)
        .post('/api/maintenance/schedules')
        .send(invalidMaintenance)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });
    
    test('PUT /api/maintenance/schedules/:id - should update maintenance status', async () => {
      const updates = {
        status: 'completed',
        notificationsSent: true
      };
      
      const response = await request(app)
        .put('/api/maintenance/schedules/MAINT001')
        .send(updates)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(updates.status);
      expect(response.body.message).toContain('updated');
    });
    
  });
  
  // ==================== REPORTING TESTS ====================
  
  describe('Reporting & Analytics', () => {
    
    test('GET /api/reports/dashboard - should return dashboard metrics', async () => {
      const response = await request(app)
        .get('/api/reports/dashboard')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.customers).toBeDefined();
      expect(response.body.data.tickets).toBeDefined();
      expect(response.body.data.maintenance).toBeDefined();
      expect(response.body.data.integration).toBeDefined();
      
      // Check customer metrics
      expect(response.body.data.customers.total).toBeDefined();
      expect(response.body.data.customers.active).toBeDefined();
      
      // Check integration metrics
      expect(response.body.data.integration.successRate).toBeDefined();
      expect(response.body.data.integration.dailyTransactions).toBeDefined();
    });
    
    test('POST /api/reports/integration - should generate integration report', async () => {
      const reportRequest = {
        startDate: '2024-12-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        format: 'json'
      };
      
      const response = await request(app)
        .post('/api/reports/integration')
        .send(reportRequest)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.period).toBeDefined();
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.operationBreakdown).toBeDefined();
      expect(response.body.data.systemBreakdown).toBeDefined();
      expect(response.body.data.logs).toBeInstanceOf(Array);
      
      // Check summary structure
      expect(response.body.data.summary.totalOperations).toBeDefined();
      expect(response.body.data.summary.successfulOperations).toBeDefined();
      expect(response.body.data.summary.averageDuration).toBeDefined();
    });
    
    test('POST /api/reports/integration - should generate CSV report', async () => {
      const reportRequest = {
        startDate: '2024-12-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        format: 'csv'
      };
      
      const response = await request(app)
        .post('/api/reports/integration')
        .send(reportRequest)
        .expect(200);
      
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.text).toContain('Timestamp,Source,Target,Operation');
    });
    
  });
  
  // ==================== ERROR HANDLING TESTS ====================
  
  describe('Error Handling', () => {
    
    test('GET /api/invalid-endpoint - should return 404 with available endpoints', async () => {
      const response = await request(app)
        .get('/api/invalid-endpoint')
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.available_endpoints).toBeInstanceOf(Array);
      expect(response.body.available_endpoints.length).toBeGreaterThan(0);
    });
    
    test('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/crm/customers')
        .send('{"invalid": json}')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
    
  });
  
  // ==================== INTEGRATION FLOW TESTS ====================
  
  describe('End-to-End Integration Flows', () => {
    
    test('Customer Creation Flow: CRM → ERP Sync', async () => {
      // Step 1: Create customer in CRM
      const newCustomer = {
        name: 'Integration Test Corp',
        email: 'integration@test.com',
        tier: 'enterprise'
      };
      
      const createResponse = await request(app)
        .post('/api/crm/customers')
        .send(newCustomer)
        .expect(201);
      
      expect(createResponse.body.success).toBe(true);
      const customerId = createResponse.body.data.id;
      
      // Step 2: Verify customer exists
      const getResponse = await request(app)
        .get(`/api/crm/customers/${customerId}`)
        .expect(200);
      
      expect(getResponse.body.data.name).toBe(newCustomer.name);
      
      // Step 3: Check integration logs for sync event
      const logsResponse = await request(app)
        .get('/api/integration/logs?operation=customer_sync')
        .expect(200);
      
      const syncLog = logsResponse.body.data.find(log => 
        log.details.includes(newCustomer.name)
      );
      expect(syncLog).toBeDefined();
      expect(syncLog.status).toBe('success');
    });
    
    test('Support Ticket Workflow: Create → Assign → Resolve', async () => {
      // Step 1: Create support ticket
      const newTicket = {
        customerId: 'CRM001',
        title: 'E2E Test Ticket',
        description: 'End-to-end testing workflow',
        priority: 'medium'
      };
      
      const createResponse = await request(app)
        .post('/api/crm/tickets')
        .send(newTicket)
        .expect(201);
      
      const ticketId = createResponse.body.data.id;
      
      // Step 2: Assign ticket
      const assignResponse = await request(app)
        .put(`/api/crm/tickets/${ticketId}`)
        .send({ 
          status: 'in_progress', 
          assignedTo: 'Test Engineer' 
        })
        .expect(200);
      
      expect(assignResponse.body.data.status).toBe('in_progress');
      
      // Step 3: Resolve ticket
      const resolveResponse = await request(app)
        .put(`/api/crm/tickets/${ticketId}`)
        .send({ 
          status: 'resolved',
          resolution: 'Issue resolved through testing' 
        })
        .expect(200);
      
      expect(resolveResponse.body.data.status).toBe('resolved');
      expect(resolveResponse.body.data.resolution).toBeDefined();
    });
    
    test('System Health Monitoring Flow', async () => {
      // Step 1: Check initial health
      const healthResponse = await request(app)
        .get('/api/integration/health')
        .expect(200);
      
      expect(healthResponse.body.data.overall).toBe('healthy');
      
      // Step 2: Trigger sync operation
      await request(app)
        .post('/api/integration/sync')
        .send({
          source: 'Integration',
          target: 'Both',
          operation: 'health_check'
        })
        .expect(200);
      
      // Step 3: Wait and check logs
      setTimeout(async () => {
        const logsResponse = await request(app)
          .get('/api/integration/logs?operation=health_check&limit=5')
          .expect(200);
        
        const healthLog = logsResponse.body.data[0];
        expect(healthLog.operation).toBe('health_check');
        expect(healthLog.source).toBe('Integration');
      }, 2000);
    });
    
  });
  
});

// ==================== PERFORMANCE TESTS ====================

describe('Performance & Load Tests', () => {
  
  test('should handle multiple concurrent customer requests', async () => {
    const requests = [];
    
    for (let i = 0; i < 10; i++) {
      requests.push(
        request(app).get('/api/crm/customers')
      );
    }
    
    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  
  test('should maintain response times under load', async () => {
    const startTime = Date.now();
    
    const response = await request(app)
      .get('/api/reports/dashboard')
      .expect(200);
    
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(5000); // 5 second max
    expect(response.body.success).toBe(true);
  });
  
});

// Test cleanup
afterAll(() => {
  // Clean up any test data if needed
  console.log('Integration tests completed successfully');
});