# Portfolio Deployment Guide

## Five Independent Projects - Each Deployable Separately

This portfolio consists of **five completely independent projects** that can be deployed to separate servers, containers, or cloud platforms. Each project has its own dependencies, configuration, and can run standalone.

---

## Project 1: Water Utility Dashboard
**📁 Location:** `water-utility-dashboard/`
**🚀 Port:** 5000
**💾 Database:** PostgreSQL (configurable)

### Features:
- Real-time water usage monitoring
- SQL Report Generator with visual query builder
- Leak detection and maintenance scheduling
- Interactive dashboards and KPI tracking

### Independent Deployment:
```bash
# Clone/copy the water-utility-dashboard folder
cd water-utility-dashboard

# Install dependencies
npm install

# Configure environment (optional)
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Run in production
npm start

# Or run in development
npm run dev

# Access: http://localhost:5000
```

### Dependencies:
- All React/TypeScript frontend dependencies included
- Node.js backend with Express
- PostgreSQL database (can use in-memory fallback)
- Complete build system with Vite

---

## Project 2: ERP/CRM Integration Tool
**📁 Location:** `erp-crm-integration/`
**🚀 Port:** 3000
**💾 Storage:** In-Memory (no external database required)

### Features:
- Mock CRM and ERP system simulation
- Real-time integration monitoring
- Customer and financial data synchronization
- Integration health checks and logging

### Independent Deployment:
```bash
# Clone/copy the erp-crm-integration folder
cd erp-crm-integration

# Install dependencies
npm install

# Run the server
npm start

# Access: http://localhost:3000
```

### Dependencies:
- Express.js server
- CORS for cross-origin requests
- UUID for ID generation
- Complete in-memory data storage

---

## Project 3: Project Tracker with UAT Support
**📁 Location:** `project-tracker-uat/`
**🚀 Port:** 4000
**💾 Storage:** In-Memory JSON data structures

### Features:
- Complete project lifecycle management
- Business requirements documentation
- UAT session planning and tracking
- Stakeholder and risk management

### Independent Deployment:
```bash
# Clone/copy the project-tracker-uat folder
cd project-tracker-uat

# Install dependencies
npm install

# Run the application
npm start

# Access: http://localhost:4000
```

### Dependencies:
- Node.js with Express
- Moment.js for date handling
- Multer for file uploads
- Self-contained data management

---

## Project 4: SQL Report Generator
**📁 Location:** `sql-report-generator/`
**🚀 Port:** 5500
**💾 Database:** SQLite (embedded, no setup required)

### Features:
- Advanced SQL query execution engine
- Template library for common reports
- CSV and JSON export capabilities
- Query performance tracking and optimization

### Independent Deployment:
```bash
# Clone/copy the sql-report-generator folder
cd sql-report-generator

# Install dependencies
npm install

# Initialize sample database
npm run init-db

# Run the server
npm start

# Access: http://localhost:5500
```

### Dependencies:
- Express.js server
- SQLite3 database (embedded)
- CSV-writer and ExcelJS for exports
- Complete sample dataset included

---

## Project 5: Business Process Mapper
**📁 Location:** `business-process-mapper/`
**🚀 Port:** 6000
**💾 Storage:** In-Memory with optional file persistence

### Features:
- Business process documentation and modeling
- Workflow optimization analysis
- SOP generation and compliance tracking
- Process performance metrics and change management

### Independent Deployment:
```bash
# Clone/copy the business-process-mapper folder
cd business-process-mapper

# Install dependencies
npm install

# Run the application
npm start

# Access: http://localhost:6000
```

### Dependencies:
- Node.js with Express
- Canvas for process diagram generation
- UUID for process management
- Self-contained workflow engine

---

## Docker Deployment (Each Project)

Each project can be containerized independently:

```dockerfile
# Example Dockerfile for any project
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port (varies by project)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

## Cloud Platform Deployment

### Replit Deployments:
Each folder can be deployed as a separate Replit project:
1. Create new Replit project
2. Upload individual project folder
3. Run `npm install && npm start`
4. Get unique `.replit.app` URL

### Heroku/Railway/Vercel:
Each project includes:
- Complete `package.json` with all dependencies
- Proper start scripts
- Environment variable support
- Production-ready configuration

### Self-Hosted:
Each project can run on separate servers:
- Different domains/subdomains
- Independent scaling
- Isolated maintenance and updates
- Separate SSL certificates

---

## Production Considerations

### Security:
- Each project includes CORS configuration
- Input validation and sanitization
- Secure session management (where applicable)
- SQL injection protection

### Performance:
- In-memory storage for fast response times
- Query optimization and caching
- Efficient API design
- Minimal dependencies

### Monitoring:
- Health check endpoints included
- Error logging and handling
- Performance metrics tracking
- Integration status monitoring

### Maintenance:
- Independent version control
- Separate dependency management
- Isolated testing and deployment
- Modular architecture

This structure allows for:
- **Independent scaling** based on usage
- **Separate maintenance cycles**
- **Different deployment strategies** per project
- **Portfolio demonstration** without interdependencies
- **Technology diversity** showcase