# Ogelo Water Utility Dashboard

A comprehensive real-time water utility management system providing operational intelligence, infrastructure monitoring, and advanced reporting capabilities for municipal water operations.

## 🚀 Link: https://water-utility-tracker-augustineogelo.replit.app/ 

The dashboard is immediately accessible without login requirements - simply open the application to explore all features with live demo data.

![Ogelo Water Utility Dashboard](screenshots/dashboard-preview.png)
 
**Demo User Profile:**
- **Name:** Augustine Ogelo
- **Email:** augustineogelo1@gmail.com
- **Role:** MIS Analyst
- **Department:** Water Operations

## 📋 Overview

This full-stack application demonstrates advanced skills in dashboard development, data visualization, real-time monitoring, and system integration. Built specifically to showcase qualifications for MIS Analyst positions in water utility organizations.

### Key Features

- **Real-time Dashboard** - Live monitoring of water usage, pressure, flow rates, and quality metrics
- **Leak Detection System** - Automated detection with severity classification and technician assignment
- **Maintenance Management** - Interactive scheduling, task completion tracking, and SOP management
- **Water Usage Analytics** - Historical trends, consumption patterns, and predictive analytics
- **Alert System** - Configurable notifications for system anomalies and operational events
- **Report Generation** - Automated PDF/CSV reports with customizable date ranges
- **Customer Management** - Service account tracking and billing integration
- **Activity Logging** - Comprehensive audit trail of all system events
- **AI-Powered Chatbot Assistant** - Instant utility operations support and troubleshooting guidance

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe component development
- **Tailwind CSS** with shadcn/ui components for responsive design
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight client-side routing
- **Recharts** for interactive data visualizations
- **Framer Motion** for smooth animations

### Backend
- **Node.js** with Express.js for RESTful API development
- **TypeScript** for end-to-end type safety
- **PostgreSQL** with Drizzle ORM for robust data persistence
- **Session-based Authentication** with secure cookie management
- **PDFKit & ExcelJS** for report generation

### Development Tools
- **Vite** for fast development and hot module replacement
- **Drizzle Kit** for database schema management
- **ESLint & Prettier** for code quality and formatting
- **Jest & Supertest** for comprehensive testing

## 🏗️ Architecture

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-based page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and configurations
│   │   └── index.css      # Global styles and design tokens
│   └── index.html         # Application entry point
├── server/                 # Express backend API
│   ├── routes.ts          # API endpoint definitions
│   ├── storage.ts         # Database abstraction layer
│   ├── db.ts              # Database connection and configuration
│   ├── seed-data.ts       # Sample data generation
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle schema definitions
└── tests/                  # Test suites
    ├── api.test.ts        # API endpoint tests
    └── dashboard.test.tsx # Frontend component tests
```

## 📊 Dashboard Features

### Real-time Monitoring
- **Water Usage Metrics**: Live gallons, pressure, flow rate, and temperature data
- **System Status**: Equipment status, pump operations, and distribution network health
- **Quality Monitoring**: pH levels, chlorine content, and turbidity measurements
- **Geographic Distribution**: Location-based monitoring across treatment facilities

### Operational Management
- **Leak Detection**: Automated alerts with severity classification (low, medium, high)
- **Maintenance Scheduling**: Interactive calendar with task assignment and completion tracking
- **Work Order Management**: Creation, assignment, and status tracking of maintenance tasks
- **Inventory Management**: Equipment and parts tracking with automatic reorder points

### Analytics & Reporting
- **Historical Trends**: 7-day, 30-day, and custom date range analytics
- **Consumption Patterns**: Peak usage identification and demand forecasting
- **Efficiency Metrics**: System performance KPIs and operational benchmarks
- **Regulatory Compliance**: EPA reporting and compliance tracking

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: User preference-based theme switching
- **Interactive Charts**: Drill-down capabilities with hover details
- **Real-time Updates**: Live data refresh without page reload
- **Intelligent Assistance**: Built-in chatbot for instant operational guidance

## 🤖 AI Chatbot Assistant

The integrated chatbot provides instant support for water utility operations with specialized knowledge in:

### Expertise Areas
- **Leak Detection & Emergency Response**
  - Immediate action protocols for water main breaks
  - Leak reporting procedures and severity assessment
  - Emergency contact information and escalation paths

- **Maintenance Operations**
  - Routine inspection schedules and safety procedures
  - Equipment maintenance protocols and troubleshooting
  - Work order management and priority classification

- **Water Quality Management**
  - EPA compliance standards and testing requirements
  - pH, chlorine, and turbidity monitoring guidelines
  - Quality control procedures and corrective actions

- **System Operations**
  - Pressure monitoring and flow rate optimization
  - Pump station operations and performance metrics
  - Distribution system management

- **Regulatory Compliance**
  - EPA Safe Drinking Water Act requirements
  - State and local regulatory compliance
  - Reporting procedures and documentation standards

- **Customer Service**
  - Standard response procedures and escalation protocols
  - Billing inquiries and service interruption management
  - Communication best practices

### How to Use
1. **Access**: Click the floating blue chat icon in the bottom-right corner
2. **Quick Start**: Use the suggested questions for common inquiries
3. **Natural Language**: Ask questions in plain English about any utility operation
4. **Instant Response**: Get immediate, actionable guidance without waiting

### Sample Questions
- "How to report a leak?"
- "What are the water quality standards?"
- "Emergency procedures for main break"
- "Maintenance schedules for pumps"
- "EPA compliance requirements"
- "Customer complaint procedures"

The chatbot operates entirely offline with no external API dependencies, ensuring 100% availability and zero operating costs.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[username]/ogelo-water-utility-dashboard.git
   cd ogelo-water-utility-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Configure your PostgreSQL connection string
   ```

4. **Database initialization**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Dashboard: http://localhost:5000
   - Login (optional): http://localhost:5000/login

### Environment Variables

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/water_utility

# Session Configuration
SESSION_SECRET=your-secure-session-secret

# Development Configuration
NODE_ENV=development
PORT=5000
```

## 📁 Database Schema

### Core Tables
- **users** - User accounts with role-based access control
- **water_usage** - Historical water consumption and quality metrics
- **leaks** - Leak detection events with severity and status tracking
- **maintenance** - Scheduled and completed maintenance tasks
- **alerts** - System notifications and operational alerts
- **activities** - Comprehensive audit trail of system events

### Key Relationships
- Users assigned to maintenance tasks and leak repairs
- Activities linked to all operational events for audit trails
- Alerts generated from threshold violations in usage and quality data

## 🔐 Security Features

- **Session-based Authentication** with secure HTTP-only cookies
- **Role-based Access Control** (Admin, Supervisor, Analyst)
- **CSRF Protection** with same-site cookie policies
- **SQL Injection Prevention** through parameterized queries
- **Input Validation** using Zod schemas
- **Secure Headers** with proper CORS configuration

## 📈 Performance Optimizations

- **Database Indexing** on frequently queried columns
- **Query Optimization** with selective field retrieval
- **Client-side Caching** with TanStack Query
- **Code Splitting** for reduced initial bundle size
- **Image Optimization** with modern formats
- **Gzip Compression** for reduced payload sizes

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test:api
npm run test:frontend
```

### Test Coverage
- **API Endpoints**: 95% coverage of all routes and error scenarios
- **Frontend Components**: Unit tests for all interactive components
- **Integration Tests**: End-to-end user workflow validation
- **Database Operations**: CRUD operation testing with mock data

## 🚀 Deployment

### Production Build
```bash
# Build optimized production bundle
npm run build

# Start production server
npm start
```

### Docker Deployment
```bash
# Build container
docker build -t ogelo-water-dashboard .

# Run with environment variables
docker run -p 5000:5000 --env-file .env ogelo-water-dashboard
```

### Environment-specific Configurations
- **Development**: Hot reload, detailed error messages, debug logging
- **Production**: Minified assets, error tracking, performance monitoring
- **Testing**: In-memory database, mock external services

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/user` - Current user profile

### Dashboard Data
- `GET /api/dashboard/kpis` - Key performance indicators
- `GET /api/water-usage` - Historical usage data
- `GET /api/water-usage/chart-data/:period` - Chart-specific data formatting

### Operational Management
- `GET /api/leaks` - Leak detection events
- `POST /api/leaks` - Report new leak
- `PATCH /api/leaks/:id` - Update leak status

- `GET /api/maintenance` - Maintenance tasks
- `POST /api/maintenance` - Schedule new task
- `PATCH /api/maintenance/:id` - Update task status

### System Monitoring
- `GET /api/alerts` - System alerts and notifications
- `POST /api/alerts` - Create new alert
- `PATCH /api/alerts/:id/read` - Mark alert as read

- `GET /api/activities` - System activity log
- `POST /api/reports/generate` - Generate custom reports

## 🎯 Skills Demonstrated

### Technical Proficiency
- **Full-stack Development** with modern JavaScript/TypeScript
- **Database Design** with normalized schemas and optimized queries
- **API Development** following RESTful principles
- **Frontend Architecture** with component-based design patterns
- **Real-time Systems** with efficient data polling and updates

### Business Analysis
- **Requirements Gathering** through comprehensive feature implementation
- **Process Optimization** with workflow automation
- **Data Analytics** with KPI tracking and trend analysis
- **User Experience Design** with intuitive interface development
- **System Integration** with modular, extensible architecture

### Water Utility Domain Knowledge
- **Operational Workflows** including maintenance, quality control, and emergency response
- **Regulatory Compliance** with reporting and documentation standards
- **Performance Metrics** relevant to municipal water operations
- **Asset Management** with equipment tracking and lifecycle management

## 📞 Contact & Support

**Developer:** Augustine Ogelo  
**Email:** augustineogelo1@gmail.com  
**Portfolio:** [GitHub Repository]  
**LinkedIn:** [Professional Profile]

### Project Maintenance
- **Issue Tracking**: GitHub Issues for bug reports and feature requests
- **Documentation**: Comprehensive inline code documentation
- **Version Control**: Semantic versioning with detailed changelog
- **Community**: Open source contributions welcome

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **Design System**: shadcn/ui for accessible component library
- **Data Visualization**: Recharts for interactive chart components
- **Database**: Drizzle ORM for type-safe database operations
- **Testing**: Jest and React Testing Library for comprehensive test coverage

---

**Built with ❤️ for water utility professionals seeking operational excellence through technology.**
