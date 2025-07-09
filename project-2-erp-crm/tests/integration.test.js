const request = require('supertest');
const app = require('../server');

describe('ERP/CRM Integration API', () => {
  describe('CRM Endpoints', () => {
    test('GET /api/crm/customers should return customers list', async () => {
      const response = await request(app)
        .get('/api/crm/customers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('POST /api/crm/customers should create new customer', async () => {
      const newCustomer = {
        name: 'Test Water District',
        email: 'test@waterdistrict.com',
        phone: '(555) 123-4567',
        status: 'active',
        accountManager: 'Test Manager'
      };

      const response = await request(app)
        .post('/api/crm/customers')
        .send(newCustomer)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newCustomer.name);
      expect(response.body.data.id).toMatch(/^CUST-\d{3}$/);
    });

    test('GET /api/crm/tickets should return tickets list', async () => {
      const response = await request(app)
        .get('/api/crm/tickets')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('POST /api/crm/tickets with high priority should auto-create work order', async () => {
      const newTicket = {
        customerId: 'CUST-001',
        subject: 'Critical System Failure',
        description: 'System down, needs immediate attention',
        priority: 'high',
        status: 'open',
        assignedTo: 'Emergency Team',
        category: 'emergency'
      };

      const response = await request(app)
        .post('/api/crm/tickets')
        .send(newTicket)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.priority).toBe('high');

      // Check if work order was auto-created
      const workOrdersResponse = await request(app)
        .get('/api/erp/work-orders')
        .expect(200);

      const relatedWorkOrder = workOrdersResponse.body.data.find(
        wo => wo.ticketId === response.body.data.id
      );
      expect(relatedWorkOrder).toBeDefined();
    });
  });

  describe('ERP Endpoints', () => {
    test('GET /api/erp/work-orders should return work orders list', async () => {
      const response = await request(app)
        .get('/api/erp/work-orders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('POST /api/erp/work-orders should create new work order', async () => {
      const newWorkOrder = {
        ticketId: 'TKT-001',
        customerId: 'CUST-001',
        description: 'Test work order',
        status: 'pending',
        priority: 'medium',
        estimatedHours: 4,
        assignedTechnician: 'Test Tech',
        scheduledDate: new Date().toISOString(),
        materials: ['Test Material']
      };

      const response = await request(app)
        .post('/api/erp/work-orders')
        .send(newWorkOrder)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(newWorkOrder.description);
      expect(response.body.data.id).toMatch(/^WO-\d{3}$/);
    });

    test('PATCH /api/erp/work-orders/:id should update work order status', async () => {
      // First create a work order
      const newWorkOrder = {
        ticketId: 'TKT-001',
        customerId: 'CUST-001',
        description: 'Test completion',
        status: 'pending',
        priority: 'medium',
        estimatedHours: 2,
        assignedTechnician: 'Test Tech',
        scheduledDate: new Date().toISOString(),
        materials: []
      };

      const createResponse = await request(app)
        .post('/api/erp/work-orders')
        .send(newWorkOrder)
        .expect(201);

      const workOrderId = createResponse.body.data.id;

      // Update to completed
      const response = await request(app)
        .patch(`/api/erp/work-orders/${workOrderId}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('Integration Endpoints', () => {
    test('GET /api/integration/logs should return integration logs', async () => {
      const response = await request(app)
        .get('/api/integration/logs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    test('POST /api/integration/sync should perform sync operation', async () => {
      const response = await request(app)
        .post('/api/integration/sync')
        .send({ operation: 'sync_customers' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.recordsProcessed).toBeGreaterThan(0);
      expect(response.body.data.message).toContain('synchronized');
    });

    test('POST /api/integration/sync with invalid operation should return error', async () => {
      const response = await request(app)
        .post('/api/integration/sync')
        .send({ operation: 'invalid_operation' })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unknown operation');
    });

    test('GET /api/dashboard/stats should return dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('customers');
      expect(response.body.data).toHaveProperty('tickets');
      expect(response.body.data).toHaveProperty('workOrders');
      expect(response.body.data).toHaveProperty('integration');
    });
  });

  describe('Data Consistency', () => {
    test('Customer filtering should work correctly', async () => {
      const response = await request(app)
        .get('/api/crm/tickets?customerId=CUST-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(ticket => {
        expect(ticket.customerId).toBe('CUST-001');
      });
    });

    test('Work order filtering should work correctly', async () => {
      const response = await request(app)
        .get('/api/erp/work-orders?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(workOrder => {
        expect(workOrder.status).toBe('pending');
      });
    });
  });
});