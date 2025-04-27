# AI-Based IT Training System Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup](#setup)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [API Documentation](#api-documentation)
8. [Contributing](#contributing)

## Project Overview

The AI-Based IT Training System is a web application built with:
- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- ORM: TypeORM
- Authentication: JWT
- Testing: Jest, React Testing Library

## Architecture

### Frontend Architecture
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── store/         # Redux store
│   ├── hooks/         # Custom hooks
│   ├── utils/         # Utility functions
│   └── types/         # TypeScript types
```

### Backend Architecture
```
backend/
├── src/
│   ├── controllers/   # Route controllers
│   ├── services/      # Business logic
│   ├── entities/      # Database models
│   ├── middleware/    # Custom middleware
│   ├── routes/        # API routes
│   ├── utils/         # Utility functions
│   └── config/        # Configuration files
```

## Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn
- Git

### Installation
1. Clone the repository
```bash
git clone https://github.com/your-org/training-system.git
cd training-system
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

4. Set up database
```bash
# Create database
createdb training_system

# Run migrations
cd backend
npm run migration:run
```

5. Start development servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm start
```

## Development Workflow

### Branching Strategy
- `main`: Production branch
- `develop`: Development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches
- `release/*`: Release branches

### Code Style
- Follow ESLint rules
- Use Prettier for formatting
- Follow TypeScript best practices
- Write meaningful commit messages

### Git Workflow
1. Create feature branch
```bash
git checkout -b feature/your-feature
```

2. Make changes and commit
```bash
git add .
git commit -m "feat: add new feature"
```

3. Push changes
```bash
git push origin feature/your-feature
```

4. Create pull request
- Target: develop branch
- Include description
- Request review

## Testing

### Unit Testing
```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

### Integration Testing
```bash
# Run API tests
cd backend
npm run test:api

# Run frontend integration tests
cd frontend
npm run test:integration
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage
```

## Deployment

### CI/CD Pipeline
- GitHub Actions for CI/CD
- Automated tests
- Automated deployment
- Environment-specific configurations

### Deployment Steps
1. Push to main branch
2. CI/CD pipeline runs
3. Tests execute
4. Build artifacts created
5. Deployment to production

### Environment Configuration
- Development: Local environment
- Staging: Pre-production testing
- Production: Live environment

## API Documentation

### API Endpoints
- Authentication: `/api/auth/*`
- Users: `/api/users/*`
- Courses: `/api/courses/*`
- Assessments: `/api/assessments/*`
- Progress: `/api/progress/*`

### API Versioning
- Current version: v1
- Version prefix: `/api/v1/*`

### API Documentation
- Swagger UI: `/api/docs`
- OpenAPI spec: `/api/docs.json`

## Contributing

### Code Review Process
1. Create pull request
2. Automated checks run
3. Code review by team
4. Address feedback
5. Merge to develop

### Documentation
- Update relevant documentation
- Include API changes
- Update user guide if needed

### Bug Reports
1. Check existing issues
2. Create new issue
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details

### Feature Requests
1. Create feature request
2. Include:
   - Description
   - Use cases
   - Benefits
   - Implementation suggestions 