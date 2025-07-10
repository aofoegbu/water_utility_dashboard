# Water Utility Dashboard

![Water Utility Dashboard](https://img.shields.io/badge/Project-Water%20Utility%20Dashboard-blue) ![React](https://img.shields.io/badge/React-TypeScript-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)

## Overview

A comprehensive real-time monitoring and analytics dashboard for municipal water systems. This full-stack application provides operational intelligence for water utility management with real-time data visualization, leak detection, maintenance scheduling, and an integrated SQL report generator.

## 🎯 Business Value

- **Real-time Monitoring**: Immediate visibility into water system performance
- **Predictive Maintenance**: Proactive maintenance scheduling to prevent service disruptions
- **Regulatory Compliance**: Automated reporting for EPA and state regulations
- **Operational Efficiency**: Streamlined workflows for utility operations staff
- **Data-Driven Decisions**: Comprehensive analytics and reporting capabilities

## 🚀 Key Features

### Core Dashboard Features
- **Real-time KPI Monitoring**: Water usage, system pressure, leak alerts, maintenance status
- **Interactive Data Visualization**: Charts and graphs with Chart.js integration
- **Alert Management**: Priority-based notification system with filtering
- **Activity Tracking**: Comprehensive audit trail of system events

### Advanced Capabilities
- **SQL Report Generator**: Visual query builder with template library
- **Leak Detection System**: Automated monitoring with severity classification
- **Maintenance Scheduling**: Task management with completion tracking
- **User Authentication**: Role-based access control (Analyst, Supervisor, Admin)
- **AI Chatbot Assistant**: Water utility operations support with instant guidance

### Water Utility Domain Features
- **Water Usage Analytics**: Consumption tracking with trend analysis
- **Pressure Monitoring**: Real-time system pressure with threshold alerts
- **Quality Assurance**: Water quality metrics and compliance tracking
- **Asset Management**: Equipment maintenance and lifecycle management
- **Emergency Response**: Critical alerts and response coordination

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **shadcn/ui** component library with Tailwind CSS
- **TanStack Query** (React Query) for server state management
- **Wouter** for client-side routing
- **Recharts** for data visualization
- **Lucide React** for consistent iconography

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for end-to-end type safety
- **PostgreSQL** with Drizzle ORM for database operations
- **Express Sessions** for authentication management
- **CORS** enabled for cross-origin requests

### Database Schema
- **Users**: Role-based access with department assignments
- **Water Usage**: Consumption metrics with location tracking
- **Leaks**: Detection alerts with severity classification
- **Maintenance**: Task scheduling and completion tracking
- **Alerts**: System notifications with priority levels
- **Activities**: Comprehensive audit trail

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher) or use DATABASE_URL environment variable
- **Git** for version control

## 🚀 Quick Start

### 1. Installation
```bash
# Navigate to project directory
cd water-utility-dashboard

# Install dependencies
npm install
```

### 2. Environment Setup
```bash
# Optional: Set database connection
export DATABASE_URL="postgresql://user:password@localhost:5432/water_utility"

# The application will use PostgreSQL if available, or fallback to in-memory storage
```

### 3. Run the Application
```bash
# Development mode (hot reload enabled)
npm run dev

# Production mode
npm start

# Access the dashboard
# Frontend: http://localhost:5000
# API: http://localhost:5000/api
```

### 4. Default Demo Data
The application automatically seeds with comprehensive demo data including:
- Sample water usage readings
- Active leak alerts
- Scheduled maintenance tasks
- System alerts and notifications
- User accounts for testing

## 📊 API Endpoints

### Dashboard & Analytics
- `GET /api/dashboard/kpis` - Key performance indicators
- `GET /api/activities` - System activity logs

### Water Management
- `GET /api/water-usage` - Water consumption data
- `POST /api/water-usage` - Record new usage reading
- `GET /api/water-usage/chart-data/:period` - Chart visualization data

### Leak Detection
- `GET /api/leaks` - Active leak alerts
- `POST /api/leaks` - Report new leak
- `PATCH /api/leaks/:id` - Update leak status

### Maintenance Management
- `GET /api/maintenance` - All maintenance tasks
- `GET /api/maintenance/today` - Today's scheduled tasks
- `POST /api/maintenance` - Create maintenance task
- `PATCH /api/maintenance/:id` - Update task status

### Alert System
- `GET /api/alerts` - System alerts
- `POST /api/alerts` - Create new alert
- `PATCH /api/alerts/:id/read` - Mark alert as read

### Project Management
- `GET /api/projects` - Project tracking
- `GET /api/requirements` - Business requirements
- `GET /api/test-cases` - UAT test cases

### SQL Report Generator
- `POST /api/sql/execute` - Execute SQL queries
- `POST /api/sql/export/:format` - Export data (CSV/JSON)

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/user` - Current user info

## 🎮 Usage Guide

### Dashboard Navigation
1. **Main Dashboard**: Real-time KPIs and system overview
2. **Water Usage**: Consumption tracking and analytics
3. **Leak Detection**: Active alerts and incident management
4. **Maintenance**: Task scheduling and completion tracking
5. **Reports**: SQL query builder and export tools

### Authentication Roles
- **Analyst**: View dashboards, create reports, basic maintenance tasks
- **Supervisor**: All analyst permissions plus advanced maintenance management
- **Admin**: Full system access including user management and system configuration

### AI Chatbot Features
- **Operational Guidance**: Instant answers for common water utility operations
- **Emergency Procedures**: Step-by-step emergency response protocols
- **Compliance Information**: EPA standards and regulatory requirements
- **Maintenance Support**: Equipment troubleshooting and repair guidance

## 🧪 Testing

### Automated Testing
```bash
# Run test suite
npm test

# Test coverage report
npm run test:coverage

# API endpoint testing
npm run test:api
```

### Manual Testing Checklist
- [ ] Dashboard loads with real-time data
- [ ] Water usage charts display correctly
- [ ] Leak alerts can be created and updated
- [ ] Maintenance tasks can be scheduled and completed
- [ ] SQL report generator executes queries
- [ ] Authentication system works properly
- [ ] AI chatbot responds to queries

## 📈 Performance Metrics

- **Dashboard Load Time**: < 2 seconds
- **Real-time Updates**: 30-60 second intervals
- **Database Query Performance**: < 500ms average
- **API Response Time**: < 200ms average
- **Concurrent Users Supported**: 100+

## 🔧 Configuration

### Environment Variables
```bash
# Database connection (optional)
DATABASE_URL=postgresql://user:pass@host:port/db

# Server configuration
PORT=5000
NODE_ENV=production

# Session configuration
SESSION_SECRET=your-secret-key
```

### Customization Options
- Modify dashboard themes in `client/src/index.css`
- Add custom SQL report templates in seed data
- Configure alert thresholds in server configuration
- Customize user roles and permissions

## 🚀 Deployment

### Development Deployment
```bash
npm run dev
```

### Production Deployment
```bash
# Build and start
npm run build
npm start

# Docker deployment
docker build -t water-utility-dashboard .
docker run -p 5000:5000 water-utility-dashboard
```

### Cloud Platform Deployment
- **Replit**: Upload project folder and run `npm install && npm start`
- **Heroku**: Connect repository and deploy with Node.js buildpack
- **Railway**: Import from Git with automatic PostgreSQL provisioning
- **Vercel**: Deploy with serverless functions for API routes

## 📋 System Requirements

### Minimum Requirements
- **RAM**: 512MB
- **CPU**: 1 vCPU
- **Storage**: 1GB
- **Network**: 10Mbps

### Recommended Requirements
- **RAM**: 2GB
- **CPU**: 2 vCPU
- **Storage**: 5GB
- **Network**: 50Mbps

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📄 License

This project is part of Augustine Ogelo's MIS Analyst Portfolio demonstrating comprehensive water utility management capabilities.

## 🆘 Support

For technical support or questions about water utility operations:
- Use the integrated AI chatbot for immediate assistance
- Review API documentation for integration guidance
- Check the troubleshooting section for common issues

---

**Water Utility Dashboard** - Comprehensive operational intelligence for modern water utility management.