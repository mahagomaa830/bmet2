# Medical Equipment Management System

## Overview

This is a comprehensive medical equipment management system built with React, Express, and PostgreSQL. The application supports both Arabic and English interfaces and is designed for healthcare facilities to manage their medical equipment, maintenance records, fault reports, and daily checks. The system provides role-based access for technicians and nurses with mobile-optimized interfaces.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom medical theme
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Bundler**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket support for live updates
- **Authentication**: Session-based authentication with PostgreSQL session store
- **File Processing**: Excel import/export functionality using SheetJS

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Structured tables for users, equipment, maintenance records, fault reports, daily checks, and notes
- **Migrations**: Database schema versioning with drizzle-kit

## Key Components

### User Management
- Role-based access control (technician, nurse, admin)
- Simple authentication with name and user ID (no passwords required)
- Special admin credentials: "admin/admin" with enhanced privileges
- Department-specific user assignment
- New user registration system

### Equipment Management
- Comprehensive equipment tracking with barcodes
- Status management (operational, maintenance, out of service)
- Maintenance scheduling and history
- Specification storage in JSON format

### Maintenance System
- Preventive, corrective, and emergency maintenance types
- Cost tracking and parts replacement records
- Technician assignment and completion tracking

### Fault Reporting
- Priority-based fault reporting system
- Real-time notifications via WebSocket
- Status tracking from report to resolution

### Daily Checks
- Scheduled equipment inspections
- Status validation and notes
- Date-based tracking

### Data Import/Export
- Excel file import/export capabilities
- Bulk equipment and maintenance data processing
- Google Drive automatic backup integration
- Complete project ZIP download functionality
- Google Sheets database connection (admin-only feature)
- Real-time data synchronization options

## Data Flow

1. **Authentication Flow**: Users authenticate via name and user ID (simplified system), no passwords required
2. **Equipment Discovery**: Barcode scanning or manual search to locate equipment
3. **Real-time Updates**: WebSocket connections provide live notifications for new fault reports
4. **Data Persistence**: All operations use Drizzle ORM with PostgreSQL for reliable data storage
5. **File Processing**: Excel import/export handled server-side with validation and error handling

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Query)
- Radix UI components for accessible UI primitives
- Lucide React for icons
- Wouter for routing
- Date-fns for date manipulation

### Backend Dependencies
- Express.js for web server
- Drizzle ORM for database operations
- @neondatabase/serverless for PostgreSQL connection
- WebSocket (ws) for real-time communication
- SheetJS (xlsx) for Excel file processing
- Multer for file uploads

### Database
- PostgreSQL as primary database
- Neon Database as PostgreSQL provider
- Connection pooling for performance

## Deployment Strategy

### Development
- Vite development server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Environment-based configuration

### Production Build
- Vite builds optimized static assets
- ESBuild bundles server code for Node.js
- Single-container deployment with static file serving

### Environment Configuration
- Database connection via DATABASE_URL environment variable
- Development/production mode switching
- Replit-specific development tooling integration

## Changelog

```
Changelog:
- July 08, 2025. Initial setup
- July 08, 2025. Added Google Drive integration with automatic backup
- July 08, 2025. Removed username/password authentication system
- July 08, 2025. Added simple user registration with name, email, phone, role, department
- July 08, 2025. Added Excel import/export functionality
- July 08, 2025. Added ZIP export for complete project download
- July 08, 2025. Updated schema to support passwordless authentication
- July 08, 2025. Implemented admin authentication system (admin/admin)
- July 08, 2025. Added Google Sheets integration feature for admin users only
- July 08, 2025. Enhanced admin dashboard with exclusive Google Sheets connection
- July 08, 2025. Added database configuration management for admin users
- July 08, 2025. Implemented PostgreSQL URL update functionality
- July 08, 2025. Added logout functionality to all pages and components
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```