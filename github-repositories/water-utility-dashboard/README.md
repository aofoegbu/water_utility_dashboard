# Water Utility Dashboard

A comprehensive real-time monitoring and analytics dashboard for municipal water systems, demonstrating SQL expertise, business intelligence capabilities, and water utility domain knowledge for TMWA MIS Analyst position.

![Dashboard Preview](./assets/dashboard-preview.png)

## 🎯 Skills Demonstrated

- **SQL Expertise**: Complex PostgreSQL queries, aggregations, and optimizations
- **Business Intelligence**: Real-time KPI dashboards and data visualization
- **Full-Stack Development**: React/TypeScript frontend with Node.js backend
- **Database Design**: Comprehensive schema modeling for utility operations
- **Water Utility Knowledge**: Leak detection, maintenance scheduling, regulatory compliance

## 🏗️ Technical Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **shadcn/ui** components with Tailwind CSS
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js REST API
- **PostgreSQL** with Drizzle ORM
- **Real-time data aggregation** and reporting
- **PDF/CSV export** capabilities

### Database Schema
```sql
-- Users (role-based access)
users: id, username, password, role, fullName, department

-- Water Usage Metrics
water_usage: id, location, timestamp, gallons, pressure, flowRate, temperature, qualityMetrics

-- Leak Detection & Management
leaks: id, location, severity, status, detectedAt, resolvedAt, estimatedGallonsLost, assignedTechnician

-- Maintenance Scheduling
maintenance: id, taskType, location, priority, status, scheduledDate, assignedTechnician

-- System Alerts & Notifications
alerts: id, type, severity, location, message, timestamp, isRead

-- Activity Audit Trail
activities: id, eventType, location, status, technician, timestamp, details
```

## 🚀 Features

### Real-Time Monitoring
- **Live KPI Dashboard**: Water usage, pressure monitoring, leak detection
- **System Map**: Visual representation of distribution network
- **Alert Management**: Critical, warning, and info level notifications
- **Usage Analytics**: Historical trends and consumption patterns

### Leak Detection & Management
- **Automatic Leak Detection**: Based on pressure and flow anomalies
- **Severity Classification**: Critical, high, medium, low priority levels
- **Technician Assignment**: Work order distribution and tracking
- **Resolution Tracking**: Time-to-repair and cost analysis

### Maintenance Scheduling
- **Preventive Maintenance**: Scheduled inspections and calibrations
- **Work Order Management**: Task assignment and completion tracking
- **Cost Tracking**: Labor and material cost analysis
- **Equipment History**: Maintenance logs and performance metrics

### Reporting & Analytics
- **Usage Reports**: Daily, weekly, monthly consumption analysis
- **Leak Reports**: Detection trends and resolution metrics
- **Maintenance Reports**: Task completion and cost analysis
- **Export Options**: PDF, CSV formats for regulatory compliance

## 📊 Water Utility Domain Features

### Operational Metrics
- **Water Quality Monitoring**: pH, chlorine, turbidity tracking
- **Pressure Management**: Distribution system pressure monitoring
- **Flow Rate Analysis**: Peak demand and capacity planning
- **Temperature Monitoring**: Water temperature across distribution points

### Regulatory Compliance
- **EPA Standards**: Water quality compliance tracking
- **State Regulations**: Local regulatory requirement monitoring
- **Reporting Requirements**: Automated report generation for authorities
- **Audit Trail**: Complete activity logging for compliance reviews

### Emergency Response
- **Critical Alert System**: Immediate notification for emergencies
- **Response Coordination**: Technician dispatch and communication
- **Public Notification**: Customer communication for service disruptions
- **Recovery Tracking**: Service restoration timeline monitoring

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd water-utility-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection details

# Set up database
npm run db:push

# Start development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL=postgresql://username:password@localhost:5432/water_utility
PGHOST=localhost
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=water_utility
```

### Database Setup
```bash
# Create database tables
npm run db:push

# Seed with sample data (optional)
npm run db:seed
```

## 🎮 Usage

1. **Access Dashboard**: Navigate to `http://localhost:5000`
2. **Monitor KPIs**: View real-time water usage, pressure, and leak alerts
3. **Manage Alerts**: Click alerts to view details and mark as read
4. **Schedule Maintenance**: Add and track maintenance tasks
5. **Generate Reports**: Export data in PDF or CSV format

## 📋 API Endpoints

### Dashboard KPIs
```
GET /api/dashboard/kpis - Real-time system metrics
```

### Water Usage
```
GET /api/water-usage - Historical usage data
POST /api/water-usage - Record new usage data
GET /api/water-usage/chart-data/:period - Chart data for visualization
```

### Leak Management
```
GET /api/leaks - Active and resolved leaks
POST /api/leaks - Report new leak
PATCH /api/leaks/:id - Update leak status
```

### Maintenance
```
GET /api/maintenance - Scheduled maintenance tasks
POST /api/maintenance - Schedule new task
PATCH /api/maintenance/:id - Update task status
GET /api/maintenance/today - Today's scheduled tasks
```

### Alerts & Activities
```
GET /api/alerts - System alerts and notifications
POST /api/alerts - Create new alert
PATCH /api/alerts/:id/read - Mark alert as read
GET /api/activities - Recent system activities
```

### Reports
```
POST /api/reports/generate - Generate PDF/CSV reports
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

## 📈 Performance Features

- **Database Indexing**: Optimized queries for large datasets
- **Connection Pooling**: Efficient database connection management
- **Caching Strategy**: Redis caching for frequently accessed data
- **Real-time Updates**: WebSocket connections for live data
- **Lazy Loading**: Progressive data loading for better UX

## 🔒 Security Features

- **Role-Based Access**: Admin, Supervisor, Analyst user levels
- **Input Validation**: Comprehensive data validation with Zod
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM
- **CORS Configuration**: Secure cross-origin resource sharing
- **Environment Security**: Encrypted environment variables

## 📁 Project Structure

```
water-utility-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── db.ts              # Database connection
│   └── services/          # Business logic services
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
├── tests/                  # Test files
└── package.json           # Dependencies and scripts
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t water-utility-dashboard .
docker run -p 5000:5000 water-utility-dashboard
```

### Environment Setup
- Configure PostgreSQL database
- Set production environment variables
- Enable SSL/TLS for secure connections
- Configure backup and monitoring

## 📊 Sample Data

The application includes comprehensive sample data demonstrating:
- **30 days of water usage** across 5 locations
- **Active and resolved leaks** with severity levels
- **Scheduled maintenance tasks** with technician assignments
- **System alerts** with various priority levels
- **Activity logs** for audit trail demonstration

## 🎯 Business Value

This dashboard demonstrates understanding of:
- **Operational Efficiency**: Real-time monitoring reduces response times
- **Cost Management**: Leak detection prevents water loss and costly repairs
- **Regulatory Compliance**: Automated reporting ensures compliance requirements
- **Data-Driven Decisions**: Analytics support strategic planning
- **Customer Service**: Proactive maintenance improves service reliability

## 📞 Support

For questions about this portfolio project:
- **Email**: [Your Email]
- **LinkedIn**: [Your LinkedIn]
- **Portfolio**: [Your Portfolio URL]

---

*This project demonstrates practical application of SQL expertise, business intelligence, and water utility domain knowledge suitable for a TMWA MIS Analyst position.*