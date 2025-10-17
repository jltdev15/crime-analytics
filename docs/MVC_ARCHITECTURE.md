# MVC Architecture Documentation

This document describes the Model-View-Controller (MVC) architecture implemented in the Crime Analytics API.

## Directory Structure

```
src/
├── config/           # Configuration files
│   └── database.ts   # Database connection setup
├── controllers/      # Controllers (Business Logic)
│   ├── analytics.controller.ts
│   ├── crime.controller.ts
│   ├── barangay.controller.ts
│   └── index.ts
├── middleware/       # Custom middleware
│   ├── error.middleware.ts
│   ├── validation.middleware.ts
│   └── index.ts
├── models/          # Data Models (MongoDB/Mongoose)
│   ├── Crime.ts
│   ├── Barangay.ts
│   ├── User.ts
│   ├── Prediction.ts
│   ├── Prescription.ts
│   ├── AuditLog.ts
│   └── index.ts
├── routes/          # Route definitions
│   ├── analytics.descriptive.ts
│   ├── crimes.routes.ts
│   ├── barangays.routes.ts
│   └── index.ts
├── services/        # Business Logic Services
│   ├── analytics.service.ts
│   └── index.ts
├── types/           # TypeScript type definitions
│   └── index.ts
└── server.ts        # Application entry point
```

## Architecture Components

### 1. Models (Data Layer)
- **Location**: `src/models/`
- **Purpose**: Define data structures and database schemas
- **Technology**: Mongoose ODM for MongoDB
- **Examples**: `Crime`, `Barangay`, `User`, `Prediction`, `Prescription`

### 2. Views (Presentation Layer)
- **Note**: In this API-only backend, "Views" are JSON responses
- **Purpose**: Data serialization and response formatting
- **Implementation**: Handled by Express.js response methods

### 3. Controllers (Application Logic)
- **Location**: `src/controllers/`
- **Purpose**: Handle HTTP requests, validate input, coordinate with services
- **Responsibilities**:
  - Request/response handling
  - Input validation
  - Error handling
  - Calling appropriate services
  - Response formatting

### 4. Services (Business Logic)
- **Location**: `src/services/`
- **Purpose**: Contains core business logic and data processing
- **Responsibilities**:
  - Complex database queries
  - Data aggregation and analysis
  - Business rule implementation
  - Data transformation

### 5. Routes (Routing Layer)
- **Location**: `src/routes/`
- **Purpose**: Define API endpoints and route handlers
- **Responsibilities**:
  - URL pattern matching
  - HTTP method handling
  - Middleware application
  - Controller method binding

### 6. Middleware (Cross-cutting Concerns)
- **Location**: `src/middleware/`
- **Purpose**: Handle cross-cutting concerns
- **Examples**:
  - Error handling
  - Request validation
  - Authentication (future)
  - Logging (future)

## API Endpoints

### Analytics Endpoints
- `GET /api/analytics/descriptive/summary` - Summary statistics (includes date range)
- `GET /api/analytics/descriptive/top/barangays/crime-count` - Top barangays by crime count
- `GET /api/analytics/descriptive/top/barangays/crime-rate` - Top barangays by crime rate
- `GET /api/analytics/descriptive/distribution` - Crime distribution by barangay
- `GET /api/analytics/descriptive/types/distribution` - Crime type distribution
- `GET /api/analytics/descriptive/barangays/count` - Barangay counts
- `GET /api/analytics/descriptive/low/barangays/crime-rate` - Low crime rate barangays

### Crime Endpoints
- `GET /api/crimes` - Get all crimes (with filtering and pagination)
- `GET /api/crimes/:id` - Get crime by ID
- `POST /api/crimes` - Create new crime
- `PUT /api/crimes/:id` - Update crime
- `DELETE /api/crimes/:id` - Delete crime
- `GET /api/crimes/stats/date-range` - Crime statistics by date range

### Barangay Endpoints
- `GET /api/barangays` - Get all barangays (with filtering and pagination)
- `GET /api/barangays/search` - Search barangays
- `GET /api/barangays/municipality/:municipality` - Get barangays by municipality
- `GET /api/barangays/province/:province` - Get barangays by province
- `GET /api/barangays/:id` - Get barangay by ID
- `POST /api/barangays` - Create new barangay
- `PUT /api/barangays/:id` - Update barangay
- `DELETE /api/barangays/:id` - Delete barangay

## Benefits of MVC Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Maintainability**: Code is organized and easy to modify
3. **Testability**: Each component can be tested independently
4. **Scalability**: Easy to add new features and endpoints
5. **Reusability**: Services can be reused across different controllers
6. **Error Handling**: Centralized error handling with custom middleware

## Development Guidelines

### Adding New Endpoints
1. Create service methods in appropriate service class
2. Create controller methods to handle HTTP requests
3. Define routes in route files
4. Add validation middleware if needed
5. Update this documentation

### Error Handling
- Use `CustomError` class for application errors
- Use `asyncHandler` wrapper for async controller methods
- Implement proper HTTP status codes
- Provide meaningful error messages

### Validation
- Use validation middleware for input validation
- Validate query parameters, request body, and route parameters
- Return appropriate error responses for invalid input

## Future Enhancements

1. **Authentication Middleware**: JWT-based authentication
2. **Authorization Middleware**: Role-based access control
3. **Logging Middleware**: Request/response logging
4. **Rate Limiting**: API rate limiting
5. **Caching**: Redis-based caching for frequently accessed data
6. **API Documentation**: Swagger/OpenAPI documentation
