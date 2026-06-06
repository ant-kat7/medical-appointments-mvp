# Medical Appointments Test Environment (MVP)

A **simplified** medical appointments management system built for demonstration of Testing & QA methodologies for a thesis project.

## 🎯 Purpose

This system demonstrates essential testing strategies including unit tests, E2E testing, and performance testing. **This is a test environment using only safe, minimal fake data - no real PHI is stored.**

## 🏗️ Architecture

### Tech Stack
- **Backend**: Express.js + SQLite + JWT (simplified)
- **Frontend**: React + React Router (no complex frameworks)
- **Testing**: Jest + Playwright + k6
- **Infrastructure**: Simple Docker Compose

### Project Structure
```
medical-appointments-simple/
├── backend/              # Express API server
├── frontend/             # React web application  
├── tests/               # E2E and performance tests
└── docs/                # Documentation
```

## 👥 Roles & Features

### Admin
- Manage doctors and schedules
- View global reports and analytics
- Manage system settings

### Doctor  
- Define availability and working hours
- View and manage appointments
- Complete appointments with notes

### Patient
- Browse available appointment slots
- Book, reschedule, and cancel appointments
- Join waitlists when slots unavailable

## 🔐 Security & Access Control

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Route guards on frontend and API authorization
- Comprehensive audit logging

## 📊 Core Features

### Appointment Management
- **Booking**: Real-time availability with conflict prevention
- **Rescheduling**: Transactional updates with waitlist management
- **Cancellation**: Automatic waitlist notifications
- **Status Tracking**: BOOKED → CANCELLED/NO_SHOW/COMPLETED

### Availability System
- Flexible working hours and slot durations
- Exception handling (breaks, holidays)
- Server-side slot generation
- Overlap prevention

### Waitlist Management
- Priority-based queuing (FIFO or numeric)
- Automatic slot offers on cancellations
- Date range preferences

### Reporting & Analytics
- Cancellation rates by doctor/timeframe
- Slot utilization metrics
- Average wait times
- Audit trail reports

## 🧪 Testing Strategy

### Coverage Goals
- **Backend**: ≥80% lines/branches
- **Frontend**: ≥70% 

### Test Types
- **Unit Tests**: Business logic, validators, utilities
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: Complete user workflows with Playwright
- **Performance Tests**: Load testing with k6
- **Security Tests**: OWASP ZAP baseline scans
- **Accessibility Tests**: axe-core compliance

### Static Analysis
- TypeScript strict mode
- ESLint with security rules
- Prettier code formatting
- Dependency vulnerability scanning

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- (Optional) Docker & Docker Compose

### Setup
1. **Install Dependencies** (much faster now!)
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ../tests && npm install
   ```

2. **Start Development**
   ```bash
   # Start both backend and frontend
   npm run dev
   ```

3. **Access Applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Demo Credentials
- **Admin**: admin@test.com / admin123
- **Doctor**: dr.smith@test.com / doctor123

### Alternative: Docker
```bash
docker-compose up
```

## 📋 API Documentation

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token

### Appointments
- `GET /appointments` - List appointments
- `POST /appointments` - Book appointment
- `PATCH /appointments/:id/reschedule` - Reschedule
- `PATCH /appointments/:id/cancel` - Cancel
- `PATCH /appointments/:id/complete` - Mark complete

### Availability
- `GET /doctors` - List doctors
- `POST /doctors/:id/availability` - Set availability
- `GET /doctors/:id/slots` - Get available slots

### Reports
- `GET /reports/cancellations` - Cancellation metrics
- `GET /reports/utilization` - Slot utilization
- `GET /reports/wait-times` - Wait time analytics

## 🧪 Running Tests

### All Tests
```bash
npm run test:all
```

### Specific Test Types
```bash
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests  
npm run test:e2e          # End-to-end tests
npm run test:performance  # Load tests with k6
npm run test:security     # OWASP ZAP scan
npm run test:accessibility # axe-core checks
```

### Coverage Reports
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🔒 Privacy & Ethics

- **No Real Data**: Only fake, anonymized test data used
- **Academic Purpose**: Clearly labeled as test environment
- **HIPAA Simulation**: Demonstrates compliance patterns without real PHI
- **Audit Trail**: All actions logged for accountability

## 📈 Performance Targets

- **Slot Listing**: p95 < 300ms
- **Appointment Booking**: p95 < 500ms  
- **Concurrent Users**: 50 VUs with <1% error rate
- **Database**: Transactional guarantees prevent double-booking

## 🎓 Thesis Integration

This project demonstrates:
- **Comprehensive Testing**: Multiple testing methodologies
- **Quality Assurance**: Automated QA processes in CI/CD
- **Security Best Practices**: Authentication, authorization, audit
- **Performance Engineering**: Load testing and optimization
- **Accessibility**: WCAG compliance testing

## 📚 Documentation

- `/docs/test-plan.md` - Comprehensive test planning
- `/docs/test-cases.md` - Detailed test case specifications  
- `/docs/qa-reports/` - Test results and coverage reports
- `/docs/architecture.md` - System design documentation
- `/docs/api-reference.md` - Complete API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - This is an academic project for thesis demonstration.

---

**⚠️ DISCLAIMER**: This is a test environment for academic purposes. Do not use with real patient data.