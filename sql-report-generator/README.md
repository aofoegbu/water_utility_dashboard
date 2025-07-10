# SQL Report Generator

![SQL Report Generator](https://img.shields.io/badge/Project-SQL%20Report%20Generator-red) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![SQLite](https://img.shields.io/badge/Database-SQLite-blue) ![Reports](https://img.shields.io/badge/Reports-CSV%2FJSON-orange)

## Overview

An advanced SQL query execution engine with comprehensive reporting capabilities designed for business analysts, data analysts, and operations teams. Features a visual query builder, template library, performance tracking, and multiple export formats for water utility and business data analysis.

## 🎯 Business Value

- **Self-Service Analytics**: Empower users to create custom reports without IT dependency
- **Query Performance Optimization**: Built-in query analysis and optimization suggestions
- **Template Library**: Pre-built reports for common business scenarios
- **Data Export Flexibility**: Multiple formats (CSV, JSON, Excel) for various business needs
- **Audit Trail**: Complete query execution history and performance tracking
- **Regulatory Compliance**: Standardized reporting for regulatory requirements

## 🚀 Key Features

### SQL Execution Engine
- **Advanced Query Parser**: Support for complex SQL with joins, subqueries, and aggregations
- **Performance Monitoring**: Query execution time tracking and optimization suggestions
- **Security Controls**: Read-only access with SQL injection protection
- **Query Validation**: Syntax checking and query plan analysis
- **Result Caching**: Intelligent caching for improved performance

### Report Generation
- **Multiple Export Formats**: CSV, JSON, Excel with formatting options
- **Scheduled Reports**: Automated report generation and delivery
- **Interactive Dashboards**: Real-time data visualization
- **Custom Formatting**: Professional report layouts with branding
- **Large Dataset Support**: Efficient handling of large result sets

### Template Management
- **Pre-built Templates**: Common water utility and business reports
- **Custom Template Creation**: Save and share custom query templates
- **Parameter Support**: Dynamic queries with user-defined parameters
- **Template Categories**: Organized library by business function
- **Version Control**: Template versioning and change tracking

### Data Schema Browser
- **Interactive Schema Explorer**: Browse tables, columns, and relationships
- **Data Dictionary**: Comprehensive metadata and column descriptions
- **Sample Data Preview**: View sample data to understand table contents
- **Relationship Mapping**: Visual representation of table relationships
- **Index Information**: Database optimization insights

## 🛠️ Technology Stack

### Backend Framework
- **Node.js** with Express.js for robust API development
- **SQLite3** embedded database for demonstration and development
- **ExcelJS** for advanced Excel report generation
- **CSV-Writer** for optimized CSV export functionality
- **PDFKit** for PDF report generation

### Query Engine
- **SQL Parser** for query validation and analysis
- **Performance Profiler** for execution time tracking
- **Result Set Management** for large dataset handling
- **Caching Layer** for improved response times

### Data Management
- **Embedded SQLite** with comprehensive sample data
- **Schema Management** for database structure documentation
- **Data Seeding** with realistic water utility datasets
- **Backup and Recovery** for data protection

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Installation
```bash
# Navigate to project directory
cd sql-report-generator

# Install dependencies
npm install
```

### 2. Initialize Database
```bash
# Create sample database with demo data
npm run init-db

# This creates a comprehensive SQLite database with:
# - Customer records
# - Water meter data  
# - Billing information
# - Service requests
# - Water quality data
```

### 3. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm start

# Access the application
# Dashboard: http://localhost:5500
# API Base: http://localhost:5500/api
```

### 4. Sample Data Overview
The demo database includes:
- **500+ Customer Records**: Residential and commercial accounts
- **1000+ Meter Readings**: Historical water consumption data
- **300+ Billing Records**: 6 months of billing history
- **150+ Service Requests**: Customer service and maintenance requests
- **200+ Water Quality Tests**: Compliance and quality assurance data

## 📊 API Endpoints

### Query Execution
```bash
# Execute SQL Query
POST   /api/query/execute
Body: {
  "sql": "SELECT * FROM customers LIMIT 10",
  "queryName": "Customer List"
}

# Get Query History
GET    /api/query/history

# Get Query Performance
GET    /api/query/performance/:queryId
```

### Schema Management
```bash
# Database Schema
GET    /api/schema/tables           # List all tables
GET    /api/schema/tables/:table    # Table details and columns
GET    /api/schema/relationships    # Table relationships
GET    /api/schema/indexes          # Database indexes
```

### Template Management
```bash
# Report Templates
GET    /api/templates               # List all templates
GET    /api/templates/:id           # Get template details
POST   /api/templates               # Create new template
PUT    /api/templates/:id           # Update template
DELETE /api/templates/:id           # Delete template

# Template Categories
GET    /api/templates/categories    # Template categories
GET    /api/templates/category/:cat # Templates by category
```

### Report Generation
```bash
# Export Data
POST   /api/export/csv              # Export to CSV
POST   /api/export/json             # Export to JSON  
POST   /api/export/excel            # Export to Excel
POST   /api/export/pdf              # Export to PDF

# Report History
GET    /api/reports/history         # Generated report history
GET    /api/reports/:id             # Download generated report
```

### System Health
```bash
# System Status
GET    /api/health                  # System health check
GET    /api/stats                   # Database statistics
GET    /api/performance             # Query performance metrics
```

## 🎮 Usage Guide

### Basic Query Execution
1. **Write SQL Query**: Use the query editor with syntax highlighting
2. **Validate Query**: Check syntax and preview execution plan
3. **Execute Query**: Run query and view results in tabular format
4. **Export Results**: Choose format (CSV, JSON, Excel) and download

### Template Usage
1. **Browse Templates**: Explore pre-built report templates by category
2. **Select Template**: Choose from consumption, revenue, service, or quality reports
3. **Customize Parameters**: Modify date ranges and filter criteria
4. **Generate Report**: Execute template and export results

### Schema Exploration
1. **Browse Tables**: View all available tables and their descriptions
2. **Examine Columns**: Review column details, data types, and constraints
3. **View Relationships**: Understand table connections and foreign keys
4. **Sample Data**: Preview actual data to understand content and format

## 📈 Sample Reports & Templates

### Monthly Consumption Report
```sql
SELECT 
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
ORDER BY avg_monthly_consumption DESC
```

### Revenue Analysis Report
```sql
SELECT 
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
ORDER BY billing_month DESC, total_revenue DESC
```

### Water Quality Compliance Report
```sql
SELECT 
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
ORDER BY compliance_rate DESC
```

## 🧪 Testing

### Automated Testing
```bash
# Run test suite
npm test

# Test with coverage
npm run test:coverage

# Database integration tests
npm run test:db
```

### Manual Testing Scenarios

#### Test 1: Query Execution
1. Execute simple SELECT query
2. Verify results display correctly
3. Test query performance tracking
4. Export results in multiple formats

#### Test 2: Template Management
1. Create new template with parameters
2. Save template to library
3. Execute template with different parameters
4. Share template with other users

#### Test 3: Schema Exploration
1. Browse database tables
2. View column details and constraints
3. Explore table relationships
4. Generate data dictionary

## 📊 Query Performance Optimization

### Performance Metrics
- **Execution Time**: Track query response times
- **Memory Usage**: Monitor memory consumption
- **I/O Operations**: Analyze disk read/write operations
- **Query Plan**: Examine SQL execution plans

### Optimization Suggestions
- **Index Recommendations**: Suggest indexes for slow queries
- **Query Rewriting**: Provide optimized query alternatives
- **Performance Alerts**: Warn about potentially slow operations
- **Best Practices**: Query optimization guidelines

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration
PORT=5500
NODE_ENV=production

# Database Configuration
DATABASE_PATH=./data/reports.db
MAX_QUERY_TIME=30000
RESULT_LIMIT=10000

# Export Configuration
EXPORT_PATH=./exports
MAX_EXPORT_SIZE=100MB
```

### Customization Options
- **Query Templates**: Add custom report templates
- **Export Formats**: Configure export format options
- **Performance Limits**: Set query timeout and result limits
- **Security Rules**: Configure allowed SQL operations

## 🚀 Deployment

### Development Deployment
```bash
npm run dev
```

### Production Deployment
```bash
# Standard deployment
npm start

# Process management
pm2 start server.js --name sql-report-generator

# Docker deployment
docker build -t sql-report-generator .
docker run -p 5500:5500 sql-report-generator
```

### Database Configuration
For production use, configure external databases:

```javascript
// PostgreSQL Configuration
const config = {
  client: 'postgresql',
  connection: {
    host: 'localhost',
    user: 'username',
    password: 'password',
    database: 'water_utility'
  }
};

// MySQL Configuration
const config = {
  client: 'mysql2',
  connection: {
    host: 'localhost',
    user: 'username',
    password: 'password',
    database: 'water_utility'
  }
};
```

## 📋 Security Features

### SQL Injection Protection
- **Query Validation**: Parse and validate all SQL queries
- **Read-Only Access**: Restrict to SELECT statements only
- **Parameter Binding**: Use parameterized queries where possible
- **Query Complexity Limits**: Prevent resource-intensive queries

### Access Control
- **User Authentication**: Secure login and session management
- **Role-Based Access**: Different permissions for different user roles
- **Audit Logging**: Track all query executions and user activities
- **Data Masking**: Sensitive data protection options

## 📈 Business Intelligence Features

### Data Visualization
- **Chart Generation**: Automatic chart creation from query results
- **Dashboard Builder**: Create interactive dashboards
- **Trend Analysis**: Time-series data visualization
- **Comparative Reports**: Side-by-side data comparison

### Analytics Capabilities
- **Statistical Functions**: Built-in statistical analysis
- **Predictive Modeling**: Basic forecasting capabilities
- **Anomaly Detection**: Identify unusual patterns in data
- **Correlation Analysis**: Discover data relationships

## 🔍 Use Cases

### Water Utility Operations
- **Consumption Analysis**: Customer usage patterns and trends
- **Revenue Reporting**: Billing analysis and revenue forecasting
- **Service Performance**: Response times and customer satisfaction
- **Compliance Reporting**: Regulatory requirement fulfillment

### Business Operations
- **Financial Reporting**: Budget analysis and cost tracking
- **Performance Metrics**: KPI tracking and trend analysis
- **Customer Analytics**: Behavior analysis and segmentation
- **Operational Efficiency**: Process optimization insights

## 🆘 Troubleshooting

### Common Issues
1. **Query Timeout**: Increase timeout limits or optimize query
2. **Memory Errors**: Reduce result set size or increase memory allocation
3. **Export Failures**: Check file permissions and disk space
4. **Connection Issues**: Verify database connectivity and credentials

### Debug Mode
```bash
# Enable debug logging
DEBUG=true npm start

# Check system status
curl http://localhost:5500/api/health
```

---

**SQL Report Generator** - Advanced SQL execution engine with comprehensive reporting capabilities for business intelligence and data analysis.