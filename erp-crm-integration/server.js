const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory data stores (simulating databases)
let customers = [
  {
    id: 'CUST-001',
    name: 'Truckee Meadows Water Authority',
    email: 'contact@tmwa.com',
    phone: '(775) 834-8080',
    status: 'active',
    accountManager: 'John Smith',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'CUST-002',
    name: 'City of Reno Utilities',
    email: 'utilities@reno.gov',
    phone: '(775) 334-2000',
    status: 'active',
    accountManager: 'Sarah Johnson',
    createdAt: '2024-02-01T09:30:00Z'
  }
];

let tickets = [
  {
    id: 'TKT-001',
    customerId: 'CUST-001',
    subject: 'Pressure Monitoring System Integration',
    description: 'Request to integrate pressure monitoring data with work order system',
    priority: 'high',
    status: 'open',
    assignedTo: 'Mike Wilson',
    createdAt: '2024-07-08T14:30:00Z',
    category: 'integration'
  },
  {
    id: 'TKT-002',
    customerId: 'CUST-001',
    subject: 'Maintenance Schedule Sync',
    description: 'Synchronize maintenance schedules between CRM and ERP systems',
    priority: 'medium',
    status: 'in_progress',
    assignedTo: 'Lisa Chen',
    createdAt: '2024-07-09T11:15:00Z',
    category: 'maintenance'
  }
];

let workOrders = [
  {
    id: 'WO-001',
    ticketId: 'TKT-001',
    customerId: 'CUST-001',
    description: 'Install pressure monitoring integration module',
    status: 'pending',
    priority: 'high',
    estimatedHours: 16,
    assignedTechnician: 'Bob Anderson',
    scheduledDate: '2024-07-15T08:00:00Z',
    materials: ['Integration Module', 'Network Cable', 'Mounting Hardware'],
    createdAt: '2024-07-09T09:00:00Z'
  },
  {
    id: 'WO-002',
    ticketId: 'TKT-002',
    customerId: 'CUST-001',
    description: 'Configure maintenance schedule synchronization',
    status: 'in_progress',
    priority: 'medium',
    estimatedHours: 8,
    assignedTechnician: 'Carol Davis',
    scheduledDate: '2024-07-12T13:00:00Z',
    materials: ['Software License', 'Configuration Tools'],
    createdAt: '2024-07-09T10:30:00Z'
  }
];

let integrationLogs = [
  {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    operation: 'sync_customer_data',
    status: 'success',
    source: 'CRM',
    target: 'ERP',
    recordsProcessed: 2,
    message: 'Customer data synchronized successfully'
  },
  {
    id: uuidv4(),
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    operation: 'create_work_order',
    status: 'success',
    source: 'CRM',
    target: 'ERP',
    recordsProcessed: 1,
    message: 'Work order WO-002 created from ticket TKT-002'
  }
];

// Mock CRM API Endpoints
app.get('/api/crm/customers', (req, res) => {
  res.json({
    success: true,
    data: customers,
    total: customers.length
  });
});

app.get('/api/crm/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }
  res.json({ success: true, data: customer });
});

app.post('/api/crm/customers', (req, res) => {
  const newCustomer = {
    id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  customers.push(newCustomer);
  
  // Log integration event
  integrationLogs.push({
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    operation: 'create_customer',
    status: 'success',
    source: 'API',
    target: 'CRM',
    recordsProcessed: 1,
    message: `Customer ${newCustomer.id} created`
  });
  
  res.status(201).json({ success: true, data: newCustomer });
});

app.get('/api/crm/tickets', (req, res) => {
  let filteredTickets = tickets;
  
  if (req.query.customerId) {
    filteredTickets = tickets.filter(t => t.customerId === req.query.customerId);
  }
  
  if (req.query.status) {
    filteredTickets = filteredTickets.filter(t => t.status === req.query.status);
  }
  
  res.json({
    success: true,
    data: filteredTickets,
    total: filteredTickets.length
  });
});

app.post('/api/crm/tickets', (req, res) => {
  const newTicket = {
    id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  tickets.push(newTicket);
  
  // Auto-create work order for high priority tickets
  if (newTicket.priority === 'high') {
    const workOrder = {
      id: `WO-${String(workOrders.length + 1).padStart(3, '0')}`,
      ticketId: newTicket.id,
      customerId: newTicket.customerId,
      description: `Resolve: ${newTicket.subject}`,
      status: 'pending',
      priority: newTicket.priority,
      estimatedHours: 8,
      assignedTechnician: 'Auto-assigned',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      materials: ['Standard Tools'],
      createdAt: new Date().toISOString()
    };
    workOrders.push(workOrder);
    
    // Log integration event
    integrationLogs.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      operation: 'auto_create_work_order',
      status: 'success',
      source: 'CRM',
      target: 'ERP',
      recordsProcessed: 1,
      message: `Work order ${workOrder.id} auto-created for high priority ticket ${newTicket.id}`
    });
  }
  
  res.status(201).json({ success: true, data: newTicket });
});

// Mock ERP API Endpoints
app.get('/api/erp/work-orders', (req, res) => {
  let filteredOrders = workOrders;
  
  if (req.query.customerId) {
    filteredOrders = workOrders.filter(wo => wo.customerId === req.query.customerId);
  }
  
  if (req.query.status) {
    filteredOrders = filteredOrders.filter(wo => wo.status === req.query.status);
  }
  
  res.json({
    success: true,
    data: filteredOrders,
    total: filteredOrders.length
  });
});

app.post('/api/erp/work-orders', (req, res) => {
  const newWorkOrder = {
    id: `WO-${String(workOrders.length + 1).padStart(3, '0')}`,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  workOrders.push(newWorkOrder);
  
  // Log integration event
  integrationLogs.push({
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    operation: 'create_work_order',
    status: 'success',
    source: 'API',
    target: 'ERP',
    recordsProcessed: 1,
    message: `Work order ${newWorkOrder.id} created`
  });
  
  res.status(201).json({ success: true, data: newWorkOrder });
});

app.patch('/api/erp/work-orders/:id', (req, res) => {
  const workOrderIndex = workOrders.findIndex(wo => wo.id === req.params.id);
  if (workOrderIndex === -1) {
    return res.status(404).json({ success: false, message: 'Work order not found' });
  }
  
  workOrders[workOrderIndex] = { ...workOrders[workOrderIndex], ...req.body };
  
  // If work order is completed, update related ticket
  if (req.body.status === 'completed') {
    const relatedTicket = tickets.find(t => t.id === workOrders[workOrderIndex].ticketId);
    if (relatedTicket) {
      relatedTicket.status = 'resolved';
      
      // Log integration event
      integrationLogs.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        operation: 'sync_ticket_status',
        status: 'success',
        source: 'ERP',
        target: 'CRM',
        recordsProcessed: 1,
        message: `Ticket ${relatedTicket.id} marked as resolved when work order ${req.params.id} completed`
      });
    }
  }
  
  res.json({ success: true, data: workOrders[workOrderIndex] });
});

// Integration endpoints
app.get('/api/integration/logs', (req, res) => {
  const logs = integrationLogs
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 50); // Return last 50 logs
    
  res.json({
    success: true,
    data: logs,
    total: logs.length
  });
});

app.post('/api/integration/sync', (req, res) => {
  const { operation } = req.body;
  
  try {
    let result = { recordsProcessed: 0, message: '' };
    
    switch (operation) {
      case 'sync_customers':
        // Simulate customer data sync
        result.recordsProcessed = customers.length;
        result.message = 'Customer data synchronized between CRM and ERP';
        break;
        
      case 'sync_work_orders':
        // Simulate work order sync
        result.recordsProcessed = workOrders.length;
        result.message = 'Work orders synchronized between systems';
        break;
        
      case 'full_sync':
        // Simulate full synchronization
        result.recordsProcessed = customers.length + workOrders.length + tickets.length;
        result.message = 'Full system synchronization completed';
        break;
        
      default:
        throw new Error('Unknown operation');
    }
    
    // Log the sync operation
    integrationLogs.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      operation,
      status: 'success',
      source: 'Integration Service',
      target: 'All Systems',
      recordsProcessed: result.recordsProcessed,
      message: result.message
    });
    
    res.json({ success: true, data: result });
    
  } catch (error) {
    // Log the error
    integrationLogs.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      operation,
      status: 'error',
      source: 'Integration Service',
      target: 'All Systems',
      recordsProcessed: 0,
      message: error.message
    });
    
    res.status(500).json({ success: false, message: error.message });
  }
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    customers: {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length
    },
    tickets: {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length
    },
    workOrders: {
      total: workOrders.length,
      pending: workOrders.filter(wo => wo.status === 'pending').length,
      inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
      completed: workOrders.filter(wo => wo.status === 'completed').length
    },
    integration: {
      totalLogs: integrationLogs.length,
      successfulOperations: integrationLogs.filter(log => log.status === 'success').length,
      errors: integrationLogs.filter(log => log.status === 'error').length,
      lastSync: integrationLogs.length > 0 ? integrationLogs[integrationLogs.length - 1].timestamp : null
    }
  };
  
  res.json({ success: true, data: stats });
});

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ERP/CRM Integration Server running on port ${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}`);
});

module.exports = app;