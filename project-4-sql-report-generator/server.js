const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const _ = require('lodash');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));

// Database initialization
const dbPath = path.join(__dirname, 'data', 'reports.db');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initializeDatabase() {
  const tables = {
    customers: `
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(500),
        city VARCHAR(100),
        state VARCHAR(50),
        zip_code VARCHAR(20),
        phone VARCHAR(20),
        email VARCHAR(255),
        account_type VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active',
        created_date DATE,
        billing_cycle VARCHAR(20)
      )
    `,
    
    water_meters: `
      CREATE TABLE IF NOT EXISTS water_meters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meter_id VARCHAR(20) UNIQUE NOT NULL,
        customer_id VARCHAR(20),
        location VARCHAR(255),
        meter_type VARCHAR(50),
        size VARCHAR(20),
        install_date DATE,
        last_service_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
      )
    `,
    
    meter_readings: `
      CREATE TABLE IF NOT EXISTS meter_readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meter_id VARCHAR(20),
        reading_date DATE,
        reading_value DECIMAL(12,2),
        consumption DECIMAL(12,2),
        read_type VARCHAR(20),
        reader_id VARCHAR(50),
        notes TEXT,
        FOREIGN KEY (meter_id) REFERENCES water_meters(meter_id)
      )
    `,
    
    billing: `
      CREATE TABLE IF NOT EXISTS billing (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id VARCHAR(20) UNIQUE NOT NULL,
        customer_id VARCHAR(20),
        billing_period_start DATE,
        billing_period_end DATE,
        consumption DECIMAL(12,2),
        base_charge DECIMAL(10,2),
        usage_charge DECIMAL(10,2),
        service_charges DECIMAL(10,2),
        taxes DECIMAL(10,2),
        total_amount DECIMAL(10,2),
        due_date DATE,
        paid_date DATE,
        payment_status VARCHAR(20) DEFAULT 'pending',
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
      )
    `,
    
    service_requests: `
      CREATE TABLE IF NOT EXISTS service_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id VARCHAR(20) UNIQUE NOT NULL,
        customer_id VARCHAR(20),
        request_type VARCHAR(100),
        description TEXT,
        priority VARCHAR(20),
        status VARCHAR(20) DEFAULT 'open',
        created_date DATETIME,
        scheduled_date DATE,
        completed_date DATE,
        assigned_technician VARCHAR(100),
        resolution_notes TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
      )
    `,
    
    water_quality: `
      CREATE TABLE IF NOT EXISTS water_quality (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sample_id VARCHAR(20) UNIQUE NOT NULL,
        location VARCHAR(255),
        test_date DATE,
        ph_level DECIMAL(4,2),
        chlorine_level DECIMAL(6,3),
        turbidity DECIMAL(6,3),
        bacteria_count INTEGER,
        lead_level DECIMAL(6,3),
        copper_level DECIMAL(6,3),
        fluoride_level DECIMAL(6,3),
        compliance_status VARCHAR(20),
        tested_by VARCHAR(100)
      )
    `,
    
    query_history: `
      CREATE TABLE IF NOT EXISTS query_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query_name VARCHAR(255),
        sql_query TEXT NOT NULL,
        created_by VARCHAR(100),
        created_date DATETIME,
        execution_time INTEGER,
        row_count INTEGER,
        is_favorite BOOLEAN DEFAULT 0
      )
    `,
    
    report_templates: `
      CREATE TABLE IF NOT EXISTS report_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_name VARCHAR(255) NOT NULL,
        description TEXT,
        sql_query TEXT NOT NULL,
        parameters TEXT,
        category VARCHAR(100),
        created_by VARCHAR(100),
        created_date DATETIME,
        is_public BOOLEAN DEFAULT 1
      )
    `
  };

  // Create tables
  Object.entries(tables).forEach(([tableName, sql]) => {
    db.run(sql, (err) => {
      if (err) {
        console.error(`Error creating table ${tableName}:`, err);
      }
    });
  });

  // Insert sample data
  setTimeout(() => {
    insertSampleData();
  }, 1000);
}

function insertSampleData() {
  // Check if data already exists
  db.get("SELECT COUNT(*) as count FROM customers", (err, row) => {
    if (err || row.count > 0) return;

    const sampleData = {
      customers: [
        ['CUST-001', 'TMWA Operations Center', '1355 Capital Blvd', 'Reno', 'NV', '89502', '(775) 834-8080', 'operations@tmwa.com', 'commercial', 'active', '2020-01-15', 'monthly'],
        ['CUST-002', 'Meadows Mall Complex', '4300 Meadows Ln', 'Las Vegas', 'NV', '89107', '(702) 878-4900', 'facilities@meadowsmall.com', 'commercial', 'active', '2020-03-22', 'monthly'],
        ['CUST-003', 'Johnson Residence', '1234 Pine Street', 'Reno', 'NV', '89511', '(775) 555-0123', 'mary.johnson@email.com', 'residential', 'active', '2021-06-10', 'monthly'],
        ['CUST-004', 'Smith Family', '5678 Oak Avenue', 'Sparks', 'NV', '89431', '(775) 555-0456', 'john.smith@email.com', 'residential', 'active', '2021-08-05', 'monthly'],
        ['CUST-005', 'Davis Manufacturing', '999 Industrial Way', 'Reno', 'NV', '89512', '(775) 555-0789', 'billing@davismfg.com', 'industrial', 'active', '2019-11-30', 'monthly']
      ],
      
      water_meters: [
        ['METER-001', 'CUST-001', '1355 Capital Blvd - Main Building', 'Commercial Grade', '3 inch', '2020-01-20', '2024-06-15', 'active'],
        ['METER-002', 'CUST-002', 'Meadows Mall - North Wing', 'Commercial Grade', '4 inch', '2020-03-25', '2024-05-10', 'active'],
        ['METER-003', 'CUST-003', '1234 Pine Street - Front Yard', 'Residential', '5/8 inch', '2021-06-15', '2024-07-01', 'active'],
        ['METER-004', 'CUST-004', '5678 Oak Avenue - Side Yard', 'Residential', '5/8 inch', '2021-08-10', '2024-06-20', 'active'],
        ['METER-005', 'CUST-005', '999 Industrial Way - Building A', 'Industrial', '6 inch', '2019-12-05', '2024-04-30', 'active']
      ]
    };

    // Insert customers
    const customerStmt = db.prepare(`
      INSERT INTO customers (customer_id, name, address, city, state, zip_code, phone, email, account_type, status, created_date, billing_cycle)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    sampleData.customers.forEach(customer => {
      customerStmt.run(customer);
    });
    customerStmt.finalize();

    // Insert water meters
    const meterStmt = db.prepare(`
      INSERT INTO water_meters (meter_id, customer_id, location, meter_type, size, install_date, last_service_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    sampleData.water_meters.forEach(meter => {
      meterStmt.run(meter);
    });
    meterStmt.finalize();

    // Generate meter readings for the past 12 months
    const startDate = moment().subtract(12, 'months');
    const readingStmt = db.prepare(`
      INSERT INTO meter_readings (meter_id, reading_date, reading_value, consumption, read_type, reader_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    sampleData.water_meters.forEach(([meterId], meterIndex) => {
      let cumulativeReading = 10000 + (meterIndex * 5000);
      
      for (let month = 0; month < 12; month++) {
        const readingDate = startDate.clone().add(month, 'months').format('YYYY-MM-DD');
        const consumption = 1000 + Math.random() * 2000 + (meterIndex * 500);
        cumulativeReading += consumption;
        
        readingStmt.run([
          meterId,
          readingDate,
          cumulativeReading.toFixed(2),
          consumption.toFixed(2),
          'automatic',
          'SYSTEM'
        ]);
      }
    });
    readingStmt.finalize();

    // Generate billing records
    const billingStmt = db.prepare(`
      INSERT INTO billing (invoice_id, customer_id, billing_period_start, billing_period_end, consumption, base_charge, usage_charge, service_charges, taxes, total_amount, due_date, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let invoiceCounter = 1;
    sampleData.customers.forEach(([customerId]) => {
      for (let month = 0; month < 6; month++) {
        const periodStart = moment().subtract(month + 1, 'months').startOf('month').format('YYYY-MM-DD');
        const periodEnd = moment().subtract(month + 1, 'months').endOf('month').format('YYYY-MM-DD');
        const consumption = 1000 + Math.random() * 2000;
        const baseCharge = 25.00;
        const usageCharge = consumption * 0.003;
        const serviceCharges = 5.00;
        const taxes = (baseCharge + usageCharge + serviceCharges) * 0.08;
        const totalAmount = baseCharge + usageCharge + serviceCharges + taxes;
        const dueDate = moment(periodEnd).add(30, 'days').format('YYYY-MM-DD');
        
        billingStmt.run([
          `INV-${String(invoiceCounter).padStart(6, '0')}`,
          customerId,
          periodStart,
          periodEnd,
          consumption.toFixed(2),
          baseCharge.toFixed(2),
          usageCharge.toFixed(2),
          serviceCharges.toFixed(2),
          taxes.toFixed(2),
          totalAmount.toFixed(2),
          dueDate,
          month < 2 ? 'pending' : 'paid'
        ]);
        invoiceCounter++;
      }
    });
    billingStmt.finalize();

    // Insert report templates
    const templates = [
      {
        name: 'Monthly Consumption Report',
        description: 'Monthly water consumption by customer',
        sql: `SELECT 
          c.customer_id,
          c.name,
          c.account_type,
          AVG(mr.consumption) as avg_monthly_consumption,
          MAX(mr.consumption) as peak_consumption,
          MIN(mr.consumption) as min_consumption
        FROM customers c
        JOIN water_meters wm ON c.customer_id = wm.customer_id
        JOIN meter_readings mr ON wm.meter_id = mr.meter_id
        WHERE mr.reading_date >= date('now', '-12 months')
        GROUP BY c.customer_id, c.name, c.account_type
        ORDER BY avg_monthly_consumption DESC`,
        category: 'Consumption Reports'
      },
      {
        name: 'Revenue Analysis',
        description: 'Revenue breakdown by account type and billing period',
        sql: `SELECT 
          c.account_type,
          strftime('%Y-%m', b.billing_period_start) as billing_month,
          COUNT(*) as invoice_count,
          SUM(b.consumption) as total_consumption,
          SUM(b.total_amount) as total_revenue,
          AVG(b.total_amount) as avg_invoice_amount
        FROM billing b
        JOIN customers c ON b.customer_id = c.customer_id
        WHERE b.billing_period_start >= date('now', '-12 months')
        GROUP BY c.account_type, strftime('%Y-%m', b.billing_period_start)
        ORDER BY billing_month DESC, total_revenue DESC`,
        category: 'Financial Reports'
      },
      {
        name: 'Customer Service Dashboard',
        description: 'Service request metrics and customer satisfaction',
        sql: `SELECT 
          sr.status,
          sr.priority,
          COUNT(*) as request_count,
          AVG(julianday(COALESCE(sr.completed_date, date('now'))) - julianday(sr.created_date)) as avg_resolution_days,
          COUNT(CASE WHEN sr.completed_date IS NOT NULL THEN 1 END) as completed_count
        FROM service_requests sr
        WHERE sr.created_date >= datetime('now', '-3 months')
        GROUP BY sr.status, sr.priority
        ORDER BY sr.priority, sr.status`,
        category: 'Service Reports'
      },
      {
        name: 'Water Quality Compliance',
        description: 'Water quality test results and compliance status',
        sql: `SELECT 
          wq.location,
          COUNT(*) as total_tests,
          AVG(wq.ph_level) as avg_ph,
          AVG(wq.chlorine_level) as avg_chlorine,
          AVG(wq.turbidity) as avg_turbidity,
          COUNT(CASE WHEN wq.compliance_status = 'compliant' THEN 1 END) as compliant_tests,
          ROUND(100.0 * COUNT(CASE WHEN wq.compliance_status = 'compliant' THEN 1 END) / COUNT(*), 2) as compliance_rate
        FROM water_quality wq
        WHERE wq.test_date >= date('now', '-6 months')
        GROUP BY wq.location
        ORDER BY compliance_rate DESC`,
        category: 'Quality Reports'
      }
    ];

    const templateStmt = db.prepare(`
      INSERT INTO report_templates (template_name, description, sql_query, category, created_by, created_date, is_public)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    templates.forEach(template => {
      templateStmt.run([
        template.name,
        template.description,
        template.sql,
        template.category,
        'System',
        new Date().toISOString(),
        1
      ]);
    });
    templateStmt.finalize();

    console.log('Sample data inserted successfully');
  });
}

// API Routes

// Execute SQL query
app.post('/api/query/execute', (req, res) => {
  const { sql, queryName } = req.body;
  
  if (!sql) {
    return res.status(400).json({ success: false, message: 'SQL query is required' });
  }

  // Basic SQL injection protection (allow only SELECT statements)
  const trimmedSql = sql.trim().toLowerCase();
  if (!trimmedSql.startsWith('select')) {
    return res.status(400).json({ 
      success: false, 
      message: 'Only SELECT queries are allowed for security reasons' 
    });
  }

  const startTime = Date.now();
  
  db.all(sql, [], (err, rows) => {
    const executionTime = Date.now() - startTime;
    
    if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message,
        executionTime 
      });
    }

    // Save to query history
    if (queryName) {
      const historyStmt = db.prepare(`
        INSERT INTO query_history (query_name, sql_query, created_by, created_date, execution_time, row_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      historyStmt.run([
        queryName,
        sql,
        'user', // In a real app, this would be the authenticated user
        new Date().toISOString(),
        executionTime,
        rows.length
      ]);
      historyStmt.finalize();
    }

    // Get column names
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    res.json({
      success: true,
      data: {
        columns,
        rows,
        rowCount: rows.length,
        executionTime
      }
    });
  });
});

// Get database schema
app.get('/api/schema', (req, res) => {
  const schemaQueries = [
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    "SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  ];

  db.all(schemaQueries[0], [], (err, tables) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    const promises = tables.map(table => {
      return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              table: table.name,
              columns: columns.map(col => ({
                name: col.name,
                type: col.type,
                nullable: !col.notnull,
                primaryKey: col.pk === 1
              }))
            });
          }
        });
      });
    });

    Promise.all(promises)
      .then(schema => {
        res.json({ success: true, data: schema });
      })
      .catch(err => {
        res.status(500).json({ success: false, message: err.message });
      });
  });
});

// Get report templates
app.get('/api/templates', (req, res) => {
  const sql = `
    SELECT id, template_name, description, category, created_by, created_date
    FROM report_templates
    WHERE is_public = 1
    ORDER BY category, template_name
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    res.json({ success: true, data: rows });
  });
});

// Get specific template
app.get('/api/templates/:id', (req, res) => {
  const sql = `
    SELECT * FROM report_templates WHERE id = ?
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!row) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    res.json({ success: true, data: row });
  });
});

// Get query history
app.get('/api/history', (req, res) => {
  const sql = `
    SELECT id, query_name, created_by, created_date, execution_time, row_count, is_favorite
    FROM query_history
    ORDER BY created_date DESC
    LIMIT 50
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    res.json({ success: true, data: rows });
  });
});

// Get specific query from history
app.get('/api/history/:id', (req, res) => {
  const sql = `
    SELECT * FROM query_history WHERE id = ?
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!row) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    res.json({ success: true, data: row });
  });
});

// Toggle favorite query
app.patch('/api/history/:id/favorite', (req, res) => {
  const sql = `
    UPDATE query_history 
    SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END
    WHERE id = ?
  `;

  db.run(sql, [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    res.json({ success: true, data: { updated: this.changes > 0 } });
  });
});

// Export query results
app.post('/api/export', (req, res) => {
  const { sql, format = 'csv', filename = 'export' } = req.body;

  if (!sql) {
    return res.status(400).json({ success: false, message: 'SQL query is required' });
  }

  // Execute query
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No data to export' });
    }

    switch (format.toLowerCase()) {
      case 'csv':
        exportCSV(res, rows, filename);
        break;
      case 'json':
        exportJSON(res, rows, filename);
        break;
      default:
        res.status(400).json({ success: false, message: 'Unsupported format' });
    }
  });
});

function exportCSV(res, data, filename) {
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  res.send(csvContent);
}

function exportJSON(res, data, filename) {
  const jsonContent = JSON.stringify(data, null, 2);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
  res.send(jsonContent);
}

// Dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
  const queries = [
    'SELECT COUNT(*) as customer_count FROM customers WHERE status = "active"',
    'SELECT COUNT(*) as meter_count FROM water_meters WHERE status = "active"',
    'SELECT COUNT(*) as template_count FROM report_templates WHERE is_public = 1',
    'SELECT COUNT(*) as query_count FROM query_history',
    'SELECT SUM(total_amount) as total_revenue FROM billing WHERE payment_status = "paid"',
    'SELECT SUM(consumption) as total_consumption FROM meter_readings WHERE reading_date >= date("now", "-30 days")'
  ];

  Promise.all(queries.map(query => {
    return new Promise((resolve, reject) => {
      db.get(query, [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }))
  .then(results => {
    const stats = {
      customers: results[0].customer_count,
      meters: results[1].meter_count,
      templates: results[2].template_count,
      queries: results[3].query_count,
      totalRevenue: results[4].total_revenue || 0,
      monthlyConsumption: results[5].total_consumption || 0
    };

    res.json({ success: true, data: stats });
  })
  .catch(err => {
    res.status(500).json({ success: false, message: err.message });
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start server
initializeDatabase();

app.listen(PORT, () => {
  console.log(`SQL Report Generator running on port ${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}`);
});

module.exports = app;