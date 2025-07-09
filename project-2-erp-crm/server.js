const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Mock Data Stores
let customers = [
  {
    id: 'CRM001',
    name: 'ABC Manufacturing Corp',
    email: 'contact@abcmfg.com',
    phone: '+1-555-0123',
    address: '123 Industrial Blvd, Detroit, MI 48201',
    status: 'active',
    tier: 'enterprise',
    createdAt: '2024-01-15T10:30:00Z',
    lastContact: '2024-12-15T14:20:00Z'
  },
  {
    id: 'CRM002',
    name: 'TechFlow Solutions',
    email: 'info@techflow.com',
    phone: '+1-555-0456',
    address: '456 Tech Park Ave, Austin, TX 78701',
    status: 'active',
    tier: 'professional',
    createdAt: '2024-02-20T09:15:00Z',
    lastContact: '2024-12-10T11:45:00Z'
  },
  {
    id: 'CRM003',
    name: 'Global Logistics Inc',
    email: 'admin@globallogistics.com',
    phone: '+1-555-0789',
    address: '789 Shipping Way, Long Beach, CA 90802',
    status: 'pending',
    tier: 'standard',
    createdAt: '2024-03-10T16:00:00Z',
    lastContact: '2024-12-12T08:30:00Z'
  }
];

let tickets = [
  {
    id: 'TKT001',
    customerId: 'CRM001',
    title: 'Production Line Integration Issue',
    description: 'ERP system not syncing production schedules with CRM forecasts',
    priority: 'high',
    status: 'in_progress',
    category: 'integration',
    assignedTo: 'John Smith',
    createdAt: '2024-12-14T09:00:00Z',
    updatedAt: '2024-12-15T15:30:00Z',
    resolution: null
  },
  {
    id: 'TKT002',
    customerId: 'CRM002',
    title: 'Invoice Discrepancy',
    description: 'CRM showing different billing amounts than ERP financial module',
    priority: 'medium',
    status: 'open',
    category: 'billing',
    assignedTo: 'Sarah Johnson',
    createdAt: '2024-12-13T14:20:00Z',
    updatedAt: '2024-12-13T14:20:00Z',
    resolution: null
  },
  {
    id: 'TKT003',
    customerId: 'CRM003',
    title: 'Order Status Sync Delay',
    description: 'Customer portal not reflecting real-time order status from ERP',
    priority: 'low',
    status: 'resolved',
    category: 'sync',
    assignedTo: 'Mike Wilson',
    createdAt: '2024-12-10T11:15:00Z',
    updatedAt: '2024-12-12T16:45:00Z',
    resolution: 'Implemented real-time webhook for order status updates'
  }
];

let maintenanceSchedules = [
  {
    id: 'MAINT001',
    systemType: 'CRM',
    systemName: 'Salesforce Production',
    scheduledDate: '2024-12-20T02:00:00Z',
    duration: 4,
    type: 'upgrade',
    description: 'Quarterly system upgrade and security patches',
    status: 'scheduled',
    impactLevel: 'medium',
    notificationsSent: true
  },
  {
    id: 'MAINT002',
    systemType: 'ERP',
    systemName: 'SAP ECC Integration Layer',
    scheduledDate: '2024-12-18T01:00:00Z',
    duration: 6,
    type: 'maintenance',
    description: 'Database optimization and integration endpoint updates',
    status: 'in_progress',
    impactLevel: 'high',
    notificationsSent: true
  },
  {
    id: 'MAINT003',
    systemType: 'Integration',
    systemName: 'API Gateway',
    scheduledDate: '2024-12-22T03:00:00Z',
    duration: 2,
    type: 'patch',
    description: 'Security vulnerability patches and performance improvements',
    status: 'scheduled',
    impactLevel: 'low',
    notificationsSent: false
  }
];

let integrationLogs = [
  {
    id: 'LOG001',
    timestamp: '2024-12-15T15:45:30Z',
    source: 'CRM',
    target: 'ERP',
    operation: 'customer_sync',
    status: 'success',
    recordsProcessed: 150,
    duration: 2.3,
    details: 'Successfully synchronized 150 customer records'
  },
  {
    id: 'LOG002',
    timestamp: '2024-12-15T14:20:15Z',
    source: 'ERP',
    target: 'CRM',
    operation: 'order_update',
    status: 'partial_failure',
    recordsProcessed: 45,
    duration: 5.7,
    details: '3 records failed validation, 42 processed successfully',
    errorCount: 3
  },
  {
    id: 'LOG003',
    timestamp: '2024-12-15T13:10:00Z',
    source: 'Integration',
    target: 'Both',
    operation: 'health_check',
    status: 'success',
    recordsProcessed: 0,
    duration: 0.8,
    details: 'All systems responding normally'
  }
];

// Helper functions
function generateId(prefix) {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${timestamp}${random}`;
}

function addIntegrationLog(source, target, operation, status, details, recordsProcessed = 0, errorCount = 0) {
  const log = {
    id: generateId('LOG'),
    timestamp: new Date().toISOString(),
    source,
    target,
    operation,
    status,
    recordsProcessed,
    duration: Math.random() * 5 + 0.5, // Random duration between 0.5-5.5 seconds
    details,
    ...(errorCount > 0 && { errorCount })
  };
  integrationLogs.unshift(log); // Add to beginning for chronological order
  
  // Keep only last 100 logs
  if (integrationLogs.length > 100) {
    integrationLogs = integrationLogs.slice(0, 100);
  }
  
  return log;
}

// ==================== CRM API ENDPOINTS ====================

// Get all customers
app.get('/api/crm/customers', (req, res) => {
  const { status, tier } = req.query;
  let filtered = customers;
  
  if (status) {
    filtered = filtered.filter(c => c.status === status);
  }
  if (tier) {
    filtered = filtered.filter(c => c.tier === tier);
  }
  
  addIntegrationLog('CRM', 'API', 'customer_fetch', 'success', `Retrieved ${filtered.length} customer records`);
  
  res.json({
    success: true,
    data: filtered,
    total: filtered.length,
    timestamp: new Date().toISOString()
  });
});

// Get customer by ID
app.get('/api/crm/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  
  if (!customer) {
    addIntegrationLog('CRM', 'API', 'customer_fetch', 'failure', `Customer ${req.params.id} not found`);
    return res.status(404).json({
      success: false,
      error: 'Customer not found',
      timestamp: new Date().toISOString()
    });
  }
  
  addIntegrationLog('CRM', 'API', 'customer_fetch', 'success', `Retrieved customer ${customer.name}`);
  
  res.json({
    success: true,
    data: customer,
    timestamp: new Date().toISOString()
  });
});

// Create new customer
app.post('/api/crm/customers', (req, res) => {
  const { name, email, phone, address, tier = 'standard' } = req.body;
  
  if (!name || !email) {
    addIntegrationLog('CRM', 'API', 'customer_create', 'failure', 'Missing required fields: name, email');
    return res.status(400).json({
      success: false,
      error: 'Name and email are required',
      timestamp: new Date().toISOString()
    });
  }
  
  const customer = {
    id: generateId('CRM'),
    name,
    email,
    phone: phone || '',
    address: address || '',
    status: 'active',
    tier,
    createdAt: new Date().toISOString(),
    lastContact: new Date().toISOString()
  };
  
  customers.push(customer);
  addIntegrationLog('CRM', 'ERP', 'customer_sync', 'success', `New customer ${name} synchronized to ERP`);
  
  res.status(201).json({
    success: true,
    data: customer,
    message: 'Customer created and synchronized with ERP',
    timestamp: new Date().toISOString()
  });
});

// Update customer
app.put('/api/crm/customers/:id', (req, res) => {
  const customerIndex = customers.findIndex(c => c.id === req.params.id);
  
  if (customerIndex === -1) {
    addIntegrationLog('CRM', 'API', 'customer_update', 'failure', `Customer ${req.params.id} not found`);
    return res.status(404).json({
      success: false,
      error: 'Customer not found',
      timestamp: new Date().toISOString()
    });
  }
  
  customers[customerIndex] = {
    ...customers[customerIndex],
    ...req.body,
    lastContact: new Date().toISOString()
  };
  
  addIntegrationLog('CRM', 'ERP', 'customer_update', 'success', `Customer ${customers[customerIndex].name} updated and synchronized`);
  
  res.json({
    success: true,
    data: customers[customerIndex],
    message: 'Customer updated and synchronized with ERP',
    timestamp: new Date().toISOString()
  });
});

// ==================== TICKET MANAGEMENT ====================

// Get all tickets
app.get('/api/crm/tickets', (req, res) => {
  const { status, priority, customerId } = req.query;
  let filtered = tickets;
  
  if (status) {
    filtered = filtered.filter(t => t.status === status);
  }
  if (priority) {
    filtered = filtered.filter(t => t.priority === priority);
  }
  if (customerId) {
    filtered = filtered.filter(t => t.customerId === customerId);
  }
  
  // Enrich with customer data
  const enriched = filtered.map(ticket => {
    const customer = customers.find(c => c.id === ticket.customerId);
    return {
      ...ticket,
      customer: customer ? { name: customer.name, email: customer.email } : null
    };
  });
  
  addIntegrationLog('CRM', 'API', 'ticket_fetch', 'success', `Retrieved ${enriched.length} tickets`);
  
  res.json({
    success: true,
    data: enriched,
    total: enriched.length,
    timestamp: new Date().toISOString()
  });
});

// Create new ticket
app.post('/api/crm/tickets', (req, res) => {
  const { customerId, title, description, priority = 'medium', category = 'general' } = req.body;
  
  if (!customerId || !title || !description) {
    addIntegrationLog('CRM', 'API', 'ticket_create', 'failure', 'Missing required fields');
    return res.status(400).json({
      success: false,
      error: 'Customer ID, title, and description are required',
      timestamp: new Date().toISOString()
    });
  }
  
  const customer = customers.find(c => c.id === customerId);
  if (!customer) {
    addIntegrationLog('CRM', 'API', 'ticket_create', 'failure', `Customer ${customerId} not found`);
    return res.status(404).json({
      success: false,
      error: 'Customer not found',
      timestamp: new Date().toISOString()
    });
  }
  
  const ticket = {
    id: generateId('TKT'),
    customerId,
    title,
    description,
    priority,
    status: 'open',
    category,
    assignedTo: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolution: null
  };
  
  tickets.push(ticket);
  addIntegrationLog('CRM', 'ERP', 'ticket_sync', 'success', `New ticket ${ticket.id} created and synchronized`);
  
  res.status(201).json({
    success: true,
    data: ticket,
    message: 'Ticket created and synchronized with ERP',
    timestamp: new Date().toISOString()
  });
});

// Update ticket
app.put('/api/crm/tickets/:id', (req, res) => {
  const ticketIndex = tickets.findIndex(t => t.id === req.params.id);
  
  if (ticketIndex === -1) {
    addIntegrationLog('CRM', 'API', 'ticket_update', 'failure', `Ticket ${req.params.id} not found`);
    return res.status(404).json({
      success: false,
      error: 'Ticket not found',
      timestamp: new Date().toISOString()
    });
  }
  
  tickets[ticketIndex] = {
    ...tickets[ticketIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  addIntegrationLog('CRM', 'ERP', 'ticket_update', 'success', `Ticket ${tickets[ticketIndex].id} updated and synchronized`);
  
  res.json({
    success: true,
    data: tickets[ticketIndex],
    message: 'Ticket updated and synchronized with ERP',
    timestamp: new Date().toISOString()
  });
});

// ==================== ERP API ENDPOINTS ====================

// Get financial summary
app.get('/api/erp/financial-summary', (req, res) => {
  const summary = {
    totalRevenue: 2847569.50,
    monthlyRecurring: 124890.00,
    outstandingInvoices: 45200.75,
    accountsReceivable: 189650.25,
    lastUpdated: new Date().toISOString(),
    metrics: {
      customerGrowth: 12.5,
      revenueGrowth: 8.7,
      collectionRate: 94.2
    }
  };
  
  addIntegrationLog('ERP', 'API', 'financial_fetch', 'success', 'Financial summary retrieved');
  
  res.json({
    success: true,
    data: summary,
    timestamp: new Date().toISOString()
  });
});

// Get inventory status
app.get('/api/erp/inventory', (req, res) => {
  const inventory = [
    {
      id: 'INV001',
      sku: 'PROD-A001',
      name: 'Industrial Pump Unit',
      quantity: 45,
      reorderLevel: 10,
      unitCost: 1250.00,
      totalValue: 56250.00,
      status: 'in_stock'
    },
    {
      id: 'INV002',
      sku: 'PROD-B002',
      name: 'Control Valve Assembly',
      quantity: 8,
      reorderLevel: 15,
      unitCost: 850.00,
      totalValue: 6800.00,
      status: 'low_stock'
    },
    {
      id: 'INV003',
      sku: 'PROD-C003',
      name: 'Sensor Module',
      quantity: 0,
      reorderLevel: 25,
      unitCost: 320.00,
      totalValue: 0.00,
      status: 'out_of_stock'
    }
  ];
  
  addIntegrationLog('ERP', 'API', 'inventory_fetch', 'success', `Retrieved ${inventory.length} inventory items`);
  
  res.json({
    success: true,
    data: inventory,
    total: inventory.length,
    summary: {
      totalValue: inventory.reduce((sum, item) => sum + item.totalValue, 0),
      lowStockItems: inventory.filter(item => item.status === 'low_stock').length,
      outOfStockItems: inventory.filter(item => item.status === 'out_of_stock').length
    },
    timestamp: new Date().toISOString()
  });
});

// Get order status
app.get('/api/erp/orders', (req, res) => {
  const orders = [
    {
      id: 'ORD001',
      customerId: 'CRM001',
      orderNumber: 'PO-2024-1201',
      status: 'shipped',
      total: 12500.00,
      orderDate: '2024-12-01T10:00:00Z',
      expectedDelivery: '2024-12-18T16:00:00Z',
      items: [
        { sku: 'PROD-A001', quantity: 2, unitPrice: 1250.00 },
        { sku: 'PROD-C003', quantity: 32, unitPrice: 320.00 }
      ]
    },
    {
      id: 'ORD002',
      customerId: 'CRM002',
      orderNumber: 'PO-2024-1205',
      status: 'processing',
      total: 8500.00,
      orderDate: '2024-12-05T14:30:00Z',
      expectedDelivery: '2024-12-20T12:00:00Z',
      items: [
        { sku: 'PROD-B002', quantity: 10, unitPrice: 850.00 }
      ]
    }
  ];
  
  addIntegrationLog('ERP', 'API', 'order_fetch', 'success', `Retrieved ${orders.length} orders`);
  
  res.json({
    success: true,
    data: orders,
    total: orders.length,
    timestamp: new Date().toISOString()
  });
});

// ==================== MAINTENANCE SCHEDULING ====================

// Get maintenance schedules
app.get('/api/maintenance/schedules', (req, res) => {
  const { systemType, status } = req.query;
  let filtered = maintenanceSchedules;
  
  if (systemType) {
    filtered = filtered.filter(m => m.systemType.toLowerCase() === systemType.toLowerCase());
  }
  if (status) {
    filtered = filtered.filter(m => m.status === status);
  }
  
  addIntegrationLog('Integration', 'API', 'maintenance_fetch', 'success', `Retrieved ${filtered.length} maintenance schedules`);
  
  res.json({
    success: true,
    data: filtered,
    total: filtered.length,
    timestamp: new Date().toISOString()
  });
});

// Create maintenance schedule
app.post('/api/maintenance/schedules', (req, res) => {
  const { systemType, systemName, scheduledDate, duration, type, description, impactLevel = 'medium' } = req.body;
  
  if (!systemType || !systemName || !scheduledDate || !duration || !type) {
    addIntegrationLog('Integration', 'API', 'maintenance_create', 'failure', 'Missing required fields');
    return res.status(400).json({
      success: false,
      error: 'System type, name, scheduled date, duration, and type are required',
      timestamp: new Date().toISOString()
    });
  }
  
  const schedule = {
    id: generateId('MAINT'),
    systemType,
    systemName,
    scheduledDate,
    duration,
    type,
    description: description || '',
    status: 'scheduled',
    impactLevel,
    notificationsSent: false
  };
  
  maintenanceSchedules.push(schedule);
  addIntegrationLog('Integration', 'Both', 'maintenance_schedule', 'success', `Maintenance scheduled for ${systemName}`);
  
  res.status(201).json({
    success: true,
    data: schedule,
    message: 'Maintenance scheduled and notifications queued',
    timestamp: new Date().toISOString()
  });
});

// Update maintenance schedule
app.put('/api/maintenance/schedules/:id', (req, res) => {
  const scheduleIndex = maintenanceSchedules.findIndex(m => m.id === req.params.id);
  
  if (scheduleIndex === -1) {
    addIntegrationLog('Integration', 'API', 'maintenance_update', 'failure', `Schedule ${req.params.id} not found`);
    return res.status(404).json({
      success: false,
      error: 'Maintenance schedule not found',
      timestamp: new Date().toISOString()
    });
  }
  
  maintenanceSchedules[scheduleIndex] = {
    ...maintenanceSchedules[scheduleIndex],
    ...req.body
  };
  
  addIntegrationLog('Integration', 'Both', 'maintenance_update', 'success', `Maintenance schedule ${req.params.id} updated`);
  
  res.json({
    success: true,
    data: maintenanceSchedules[scheduleIndex],
    message: 'Maintenance schedule updated',
    timestamp: new Date().toISOString()
  });
});

// ==================== INTEGRATION ENDPOINTS ====================

// Get integration logs
app.get('/api/integration/logs', (req, res) => {
  const { source, status, limit = 50 } = req.query;
  let filtered = integrationLogs;
  
  if (source) {
    filtered = filtered.filter(log => log.source.toLowerCase() === source.toLowerCase());
  }
  if (status) {
    filtered = filtered.filter(log => log.status === status);
  }
  
  const limited = filtered.slice(0, parseInt(limit));
  
  res.json({
    success: true,
    data: limited,
    total: limited.length,
    available: filtered.length,
    timestamp: new Date().toISOString()
  });
});

// Trigger manual sync
app.post('/api/integration/sync', (req, res) => {
  const { source, target, operation } = req.body;
  
  if (!source || !target || !operation) {
    return res.status(400).json({
      success: false,
      error: 'Source, target, and operation are required',
      timestamp: new Date().toISOString()
    });
  }
  
  // Simulate sync process
  setTimeout(() => {
    const recordsProcessed = Math.floor(Math.random() * 100) + 10;
    const hasErrors = Math.random() < 0.1; // 10% chance of errors
    const status = hasErrors ? 'partial_failure' : 'success';
    const errorCount = hasErrors ? Math.floor(Math.random() * 5) + 1 : 0;
    
    const details = hasErrors 
      ? `${errorCount} records failed validation, ${recordsProcessed - errorCount} processed successfully`
      : `Successfully synchronized ${recordsProcessed} records`;
    
    addIntegrationLog(source, target, operation, status, details, recordsProcessed, errorCount);
  }, 1000);
  
  res.json({
    success: true,
    message: 'Sync process initiated',
    estimatedDuration: '2-5 seconds',
    timestamp: new Date().toISOString()
  });
});

// Get system health status
app.get('/api/integration/health', (req, res) => {
  const health = {
    overall: 'healthy',
    systems: {
      crm: {
        status: 'online',
        responseTime: 45,
        lastCheck: new Date().toISOString(),
        uptime: 99.8
      },
      erp: {
        status: 'online',
        responseTime: 78,
        lastCheck: new Date().toISOString(),
        uptime: 99.5
      },
      integration: {
        status: 'online',
        responseTime: 23,
        lastCheck: new Date().toISOString(),
        uptime: 99.9
      }
    },
    lastSync: integrationLogs[0]?.timestamp || new Date().toISOString(),
    errorRate: 2.1,
    dailyTransactions: 1847
  };
  
  addIntegrationLog('Integration', 'API', 'health_check', 'success', 'System health check completed');
  
  res.json({
    success: true,
    data: health,
    timestamp: new Date().toISOString()
  });
});

// ==================== REPORTING ENDPOINTS ====================

// Get dashboard metrics
app.get('/api/reports/dashboard', (req, res) => {
  const metrics = {
    customers: {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      newThisMonth: customers.filter(c => {
        const created = new Date(c.createdAt);
        const month = new Date().getMonth();
        return created.getMonth() === month;
      }).length
    },
    tickets: {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      highPriority: tickets.filter(t => t.priority === 'high').length
    },
    maintenance: {
      scheduled: maintenanceSchedules.filter(m => m.status === 'scheduled').length,
      inProgress: maintenanceSchedules.filter(m => m.status === 'in_progress').length,
      upcoming: maintenanceSchedules.filter(m => {
        const scheduled = new Date(m.scheduledDate);
        const now = new Date();
        return scheduled > now && scheduled < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      }).length
    },
    integration: {
      successRate: 97.9,
      errorRate: 2.1,
      dailyTransactions: 1847,
      lastSync: integrationLogs[0]?.timestamp || new Date().toISOString()
    }
  };
  
  addIntegrationLog('Integration', 'API', 'dashboard_metrics', 'success', 'Dashboard metrics generated');
  
  res.json({
    success: true,
    data: metrics,
    timestamp: new Date().toISOString()
  });
});

// Generate integration report
app.get('/api/reports/integration', (req, res) => {
  // Default 7-day report for GET request
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = new Date().toISOString();
  const format = 'json';
  
  // Use same logic as POST
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const filtered = integrationLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= start && logDate <= end;
  });
  
  const report = {
    period: {
      start: start.toISOString(),
      end: end.toISOString()
    },
    summary: {
      totalOperations: filtered.length,
      successfulOperations: filtered.filter(log => log.status === 'success').length,
      failedOperations: filtered.filter(log => log.status === 'failure').length,
      partialFailures: filtered.filter(log => log.status === 'partial_failure').length,
      averageDuration: filtered.reduce((sum, log) => sum + log.duration, 0) / filtered.length || 0,
      totalRecordsProcessed: filtered.reduce((sum, log) => sum + log.recordsProcessed, 0)
    },
    operationBreakdown: {
      customer_sync: filtered.filter(log => log.operation === 'customer_sync').length,
      ticket_sync: filtered.filter(log => log.operation === 'ticket_sync').length,
      order_update: filtered.filter(log => log.operation === 'order_update').length,
      health_check: filtered.filter(log => log.operation === 'health_check').length
    },
    systemBreakdown: {
      CRM: filtered.filter(log => log.source === 'CRM').length,
      ERP: filtered.filter(log => log.source === 'ERP').length,
      Integration: filtered.filter(log => log.source === 'Integration').length
    },
    logs: filtered
  };
  
  addIntegrationLog('Integration', 'API', 'report_generation', 'success', `Generated integration report for ${report.summary.totalOperations} operations`);
  
  res.json({
    success: true,
    data: report,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/reports/integration', (req, res) => {
  const { startDate, endDate, format = 'json' } = req.body;
  
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();
  
  const filtered = integrationLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= start && logDate <= end;
  });
  
  const report = {
    period: {
      start: start.toISOString(),
      end: end.toISOString()
    },
    summary: {
      totalOperations: filtered.length,
      successfulOperations: filtered.filter(log => log.status === 'success').length,
      failedOperations: filtered.filter(log => log.status === 'failure').length,
      partialFailures: filtered.filter(log => log.status === 'partial_failure').length,
      averageDuration: filtered.reduce((sum, log) => sum + log.duration, 0) / filtered.length || 0,
      totalRecordsProcessed: filtered.reduce((sum, log) => sum + log.recordsProcessed, 0)
    },
    operationBreakdown: {
      customer_sync: filtered.filter(log => log.operation === 'customer_sync').length,
      ticket_sync: filtered.filter(log => log.operation === 'ticket_sync').length,
      order_update: filtered.filter(log => log.operation === 'order_update').length,
      health_check: filtered.filter(log => log.operation === 'health_check').length
    },
    systemBreakdown: {
      CRM: filtered.filter(log => log.source === 'CRM').length,
      ERP: filtered.filter(log => log.source === 'ERP').length,
      Integration: filtered.filter(log => log.source === 'Integration').length
    },
    logs: filtered
  };
  
  addIntegrationLog('Integration', 'API', 'report_generation', 'success', `Generated integration report for ${report.summary.totalOperations} operations`);
  
  if (format === 'csv') {
    // Simple CSV format
    const csvHeaders = 'Timestamp,Source,Target,Operation,Status,Records,Duration,Details\n';
    const csvData = filtered.map(log => 
      `${log.timestamp},${log.source},${log.target},${log.operation},${log.status},${log.recordsProcessed},${log.duration},"${log.details}"`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=integration-report.csv');
    res.send(csvHeaders + csvData);
  } else {
    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    available_endpoints: [
      'GET /api/crm/customers',
      'POST /api/crm/customers',
      'GET /api/crm/tickets',
      'POST /api/crm/tickets',
      'GET /api/erp/financial-summary',
      'GET /api/erp/inventory',
      'GET /api/erp/orders',
      'GET /api/maintenance/schedules',
      'POST /api/maintenance/schedules',
      'GET /api/integration/logs',
      'POST /api/integration/sync',
      'GET /api/integration/health',
      'GET /api/reports/dashboard',
      'POST /api/reports/integration',
      'GET /api/reports/integration'
    ],
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  addIntegrationLog('System', 'API', 'error', 'failure', `Server error: ${err.message}`);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 ERP/CRM Integration Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/api/integration/health`);
  console.log(`\n📈 Key Endpoints:`);
  console.log(`   CRM: http://localhost:${PORT}/api/crm/customers`);
  console.log(`   ERP: http://localhost:${PORT}/api/erp/financial-summary`);
  console.log(`   Integration: http://localhost:${PORT}/api/integration/logs`);
  
  // Initialize with a health check log
  addIntegrationLog('System', 'All', 'startup', 'success', 'ERP/CRM Integration Server started successfully');
});

module.exports = app;