const request = require('supertest');
const app = require('../server');

describe('SQL Report Generator API', () => {
  describe('Query Execution', () => {
    test('POST /api/query/execute should execute valid SELECT query', async () => {
      const query = {
        sql: 'SELECT COUNT(*) as count FROM customers',
        queryName: 'Test Count Query'
      };

      const response = await request(app)
        .post('/api/query/execute')
        .send(query)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('columns');
      expect(response.body.data).toHaveProperty('rows');
      expect(response.body.data).toHaveProperty('rowCount');
      expect(response.body.data).toHaveProperty('executionTime');
      expect(response.body.data.columns).toContain('count');
    });

    test('POST /api/query/execute should reject non-SELECT queries', async () => {
      const query = {
        sql: 'UPDATE customers SET name = "test" WHERE id = 1'
      };

      const response = await request(app)
        .post('/api/query/execute')
        .send(query)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only SELECT queries are allowed');
    });

    test('POST /api/query/execute should handle SQL syntax errors', async () => {
      const query = {
        sql: 'SELECT * FROM nonexistent_table'
      };

      const response = await request(app)
        .post('/api/query/execute')
        .send(query)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    test('POST /api/query/execute should save query to history when name provided', async () => {
      const query = {
        sql: 'SELECT * FROM customers LIMIT 1',
        queryName: 'Sample Customer Query'
      };

      await request(app)
        .post('/api/query/execute')
        .send(query)
        .expect(200);

      // Check if query was saved to history
      const historyResponse = await request(app)
        .get('/api/history')
        .expect(200);

      expect(historyResponse.body.success).toBe(true);
      const savedQuery = historyResponse.body.data.find(
        q => q.query_name === 'Sample Customer Query'
      );
      expect(savedQuery).toBeDefined();
    });

    test('POST /api/query/execute should return empty result set for no matches', async () => {
      const query = {
        sql: "SELECT * FROM customers WHERE customer_id = 'NONEXISTENT'"
      };

      const response = await request(app)
        .post('/api/query/execute')
        .send(query)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.rowCount).toBe(0);
      expect(response.body.data.rows).toEqual([]);
    });
  });

  describe('Database Schema', () => {
    test('GET /api/schema should return database schema', async () => {
      const response = await request(app)
        .get('/api/schema')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check for expected tables
      const tableNames = response.body.data.map(table => table.table);
      expect(tableNames).toContain('customers');
      expect(tableNames).toContain('water_meters');
      expect(tableNames).toContain('meter_readings');
      expect(tableNames).toContain('billing');

      // Check table structure
      const customersTable = response.body.data.find(table => table.table === 'customers');
      expect(customersTable).toBeDefined();
      expect(customersTable.columns).toBeInstanceOf(Array);
      expect(customersTable.columns.length).toBeGreaterThan(0);
      
      // Check column properties
      const customerIdColumn = customersTable.columns.find(col => col.name === 'customer_id');
      expect(customerIdColumn).toBeDefined();
      expect(customerIdColumn).toHaveProperty('type');
      expect(customerIdColumn).toHaveProperty('nullable');
      expect(customerIdColumn).toHaveProperty('primaryKey');
    });
  });

  describe('Report Templates', () => {
    test('GET /api/templates should return available templates', async () => {
      const response = await request(app)
        .get('/api/templates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check template structure
      const template = response.body.data[0];
      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('template_name');
      expect(template).toHaveProperty('description');
      expect(template).toHaveProperty('category');
    });

    test('GET /api/templates/:id should return specific template', async () => {
      // First get list of templates
      const templatesResponse = await request(app)
        .get('/api/templates')
        .expect(200);

      const templateId = templatesResponse.body.data[0].id;

      const response = await request(app)
        .get(`/api/templates/${templateId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', templateId);
      expect(response.body.data).toHaveProperty('sql_query');
      expect(response.body.data.sql_query).toBeTruthy();
    });

    test('GET /api/templates/:id should return 404 for invalid template', async () => {
      const response = await request(app)
        .get('/api/templates/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Template not found');
    });
  });

  describe('Query History', () => {
    test('GET /api/history should return query history', async () => {
      const response = await request(app)
        .get('/api/history')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      if (response.body.data.length > 0) {
        const historyItem = response.body.data[0];
        expect(historyItem).toHaveProperty('id');
        expect(historyItem).toHaveProperty('created_date');
        expect(historyItem).toHaveProperty('execution_time');
        expect(historyItem).toHaveProperty('row_count');
      }
    });

    test('GET /api/history/:id should return specific query', async () => {
      // First execute a query to create history
      await request(app)
        .post('/api/query/execute')
        .send({
          sql: 'SELECT COUNT(*) FROM customers',
          queryName: 'Test History Query'
        });

      // Get history list
      const historyResponse = await request(app)
        .get('/api/history')
        .expect(200);

      if (historyResponse.body.data.length > 0) {
        const queryId = historyResponse.body.data[0].id;

        const response = await request(app)
          .get(`/api/history/${queryId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id', queryId);
        expect(response.body.data).toHaveProperty('sql_query');
      }
    });

    test('PATCH /api/history/:id/favorite should toggle favorite status', async () => {
      // First execute a query to create history
      await request(app)
        .post('/api/query/execute')
        .send({
          sql: 'SELECT COUNT(*) FROM customers',
          queryName: 'Favorite Test Query'
        });

      // Get the query ID
      const historyResponse = await request(app)
        .get('/api/history')
        .expect(200);

      if (historyResponse.body.data.length > 0) {
        const queryId = historyResponse.body.data[0].id;

        const response = await request(app)
          .patch(`/api/history/${queryId}/favorite`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('updated');
      }
    });
  });

  describe('Export Functionality', () => {
    test('POST /api/export should export query results as CSV', async () => {
      const exportData = {
        sql: 'SELECT customer_id, name FROM customers LIMIT 3',
        format: 'csv',
        filename: 'test_customers'
      };

      const response = await request(app)
        .post('/api/export')
        .send(exportData)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('test_customers.csv');
      expect(response.text).toContain('customer_id,name');
    });

    test('POST /api/export should export query results as JSON', async () => {
      const exportData = {
        sql: 'SELECT customer_id, name FROM customers LIMIT 2',
        format: 'json',
        filename: 'test_customers'
      };

      const response = await request(app)
        .post('/api/export')
        .send(exportData)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('test_customers.json');
      
      const jsonData = JSON.parse(response.text);
      expect(jsonData).toBeInstanceOf(Array);
      if (jsonData.length > 0) {
        expect(jsonData[0]).toHaveProperty('customer_id');
        expect(jsonData[0]).toHaveProperty('name');
      }
    });

    test('POST /api/export should handle empty result sets', async () => {
      const exportData = {
        sql: "SELECT * FROM customers WHERE customer_id = 'NONEXISTENT'",
        format: 'csv'
      };

      const response = await request(app)
        .post('/api/export')
        .send(exportData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No data to export');
    });

    test('POST /api/export should handle unsupported formats', async () => {
      const exportData = {
        sql: 'SELECT * FROM customers LIMIT 1',
        format: 'xml'
      };

      const response = await request(app)
        .post('/api/export')
        .send(exportData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Unsupported format');
    });
  });

  describe('Dashboard Statistics', () => {
    test('GET /api/dashboard/stats should return comprehensive statistics', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      
      const stats = response.body.data;
      expect(stats).toHaveProperty('customers');
      expect(stats).toHaveProperty('meters');
      expect(stats).toHaveProperty('templates');
      expect(stats).toHaveProperty('queries');
      expect(stats).toHaveProperty('totalRevenue');
      expect(stats).toHaveProperty('monthlyConsumption');

      // Verify data types
      expect(typeof stats.customers).toBe('number');
      expect(typeof stats.meters).toBe('number');
      expect(typeof stats.templates).toBe('number');
      expect(typeof stats.queries).toBe('number');
      expect(typeof stats.totalRevenue).toBe('number');
      expect(typeof stats.monthlyConsumption).toBe('number');
    });
  });

  describe('Complex Queries', () => {
    test('Should handle JOIN queries correctly', async () => {
      const query = {
        sql: `SELECT c.name, c.account_type, COUNT(wm.meter_id) as meter_count
               FROM customers c 
               LEFT JOIN water_meters wm ON c.customer_id = wm.customer_id 
               GROUP BY c.customer_id, c.name, c.account_type
               ORDER BY meter_count DESC`
      };

      const response = await request(app)
        .post('/api/query/execute')
        .send(query)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.columns).toContain('name');
      expect(response.body.data.columns).toContain('account_type');
      expect(response.body.data.columns).toContain('meter_count');
    });

    test('Should handle aggregate functions correctly', async () => {
      const query = {
        sql: `SELECT 
                account_type,
                COUNT(*) as customer_count,
                MIN(created_date) as earliest_customer,
                MAX(created_date) as latest_customer
               FROM customers 
               GROUP BY account_type`
      };

      const response = await request(app)
        .post('/api/query/execute')
        .send(query)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.columns).toContain('account_type');
      expect(response.body.data.columns).toContain('customer_count');
      expect(response.body.data.rowCount).toBeGreaterThan(0);
    });

    test('Should handle date functions and filtering', async () => {
      const query = {
        sql: `SELECT 
                strftime('%Y-%m', created_date) as month,
                COUNT(*) as new_customers
               FROM customers 
               WHERE created_date >= date('now', '-12 months')
               GROUP BY strftime('%Y-%m', created_date)
               ORDER BY month DESC`
      };

      const response = await request(app)
        .post('/api/query/execute')
        .send(query)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.columns).toContain('month');
      expect(response.body.data.columns).toContain('new_customers');
    });
  });
});