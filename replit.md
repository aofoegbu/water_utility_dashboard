# Water Utility Dashboard - replit.md

## Overview

This is a comprehensive Water Utility Dashboard application built for Truckee Meadows Water Authority (TMWA). The application provides real-time monitoring, analytics, and management capabilities for municipal water systems, including water usage tracking, leak detection, maintenance scheduling, and alert management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Monorepo Structure
- **Frontend**: React with TypeScript using Vite as the build tool
- **Backend**: Node.js with Express.js serving REST APIs
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **UI Framework**: shadcn/ui components with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management

### Project Structure
```
├── client/           # React frontend application
├── server/           # Express backend API
├── shared/           # Shared types and schemas
├── tests/            # Test files
└── migrations/       # Database migration files
```

## Key Components

### Frontend Architecture
- **React SPA** with TypeScript for type safety
- **Component-based architecture** using shadcn/ui design system
- **Responsive design** with Tailwind CSS
- **Client-side routing** with Wouter
- **Real-time data updates** via polling with React Query
- **Dashboard-centric UI** with multiple data visualization components

### Backend Architecture
- **RESTful API** using Express.js
- **Type-safe data layer** with Drizzle ORM
- **In-memory storage** implementation with interface for easy database swapping
- **Report generation** capabilities (PDF/CSV exports)
- **Real-time data aggregation** for dashboard KPIs

### Database Schema
The application models a complete water utility system with tables for:
- **Users**: Role-based access control (analyst, supervisor, admin)
- **Water Usage**: Metrics including location, gallons, pressure, flow rate, temperature
- **Leaks**: Detection alerts with severity levels and tracking
- **Maintenance**: Task scheduling and completion tracking
- **Alerts**: System notifications with priority levels
- **Activities**: Audit trail of system events

## Data Flow

1. **Real-time Monitoring**: Frontend polls backend APIs every 30-60 seconds for fresh data
2. **Dashboard KPIs**: Aggregated statistics calculated on-demand from raw data
3. **CRUD Operations**: Standard create, read, update, delete operations for all entities
4. **Report Generation**: Server-side PDF/CSV generation with downloadable exports
5. **Alert System**: Automatic alert generation based on system thresholds

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe ORM with schema validation
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **recharts**: Data visualization and charting

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Vite**: Fast frontend build tool with HMR
- **esbuild**: Backend bundling for production
- **Tailwind CSS**: Utility-first styling framework

### Water Utility Specific Features
- **Role-based access control** for different user types
- **Real-time system monitoring** with configurable refresh intervals
- **Comprehensive reporting** with multiple export formats
- **Interactive dashboard** with customizable time ranges
- **Maintenance scheduling** with priority-based task management

## Deployment Strategy

### Development Environment
- **Vite dev server** for frontend with hot module replacement
- **tsx** for running TypeScript backend directly
- **Development middleware** for API logging and error handling

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations applied via `db:push` command
- **Environment**: PostgreSQL connection via `DATABASE_URL` environment variable

### Key Features for Water Utility Use Case
- **Dashboard-first design** showing critical KPIs at a glance
- **Geographic system mapping** with status indicators
- **Leak detection and tracking** with severity classification
- **Maintenance workflow management** with technician assignment
- **Usage analytics** with trend analysis and reporting
- **Alert management** with priority-based notification system
- **Export capabilities** for regulatory compliance and reporting

The application is designed to meet the specific needs of municipal water authorities, providing both operational oversight and detailed analytics for water system management.