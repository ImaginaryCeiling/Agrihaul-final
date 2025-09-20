# AgriHaul API Documentation

## Overview

The AgriHaul API is a RESTful service that connects farmers with carriers for agricultural logistics. The API provides endpoints for user authentication, job management, bidding, and user profiles.

## 🚀 Quick Start

### Base URL
```
Development: http://localhost:5001
Production: https://api.agrihaul.com (coming soon)
```

### Interactive Documentation
Visit the **Swagger UI** for interactive API testing:
```
http://localhost:5001/api-docs
```

### OpenAPI Specification
Get the raw OpenAPI 3.0 specification:
```
http://localhost:5001/api-docs/openapi.json
```

## 🔐 Authentication

All protected endpoints require a JWT Bearer token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

1. **Register** a new user account
2. **Login** with credentials to receive JWT token
3. Use token for subsequent API calls

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (farmer or carrier)
- `POST /api/auth/login` - Login and get JWT token

### Jobs
- `GET /api/jobs` - List all jobs (with filtering)
- `POST /api/jobs` - Create new job (farmers only)

### Bids
- `POST /api/bids` - Submit bid on job (carriers only)

### Users
- `GET /api/users/profile` - Get current user profile

### Health
- `GET /health` - API health check

## 🔧 User Types

### Farmers
- Post transportation jobs
- Review and accept bids from carriers
- Manage job listings

### Carriers
- Browse available jobs
- Submit bids on jobs
- Track delivery assignments

## 📝 Example Usage

### Register a Farmer
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "Password123",
    "userType": "farmer",
    "profile": {
      "farmName": "Green Valley Farm",
      "farmSize": 150,
      "farmLocation": "Sacramento, CA",
      "primaryCrops": ["corn", "soybeans"],
      "contactPhone": "+1-555-0123",
      "rating": 0,
      "totalJobs": 0
    }
  }'
```

### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "Password123"
  }'
```

### Create a Job (Authenticated)
```bash
curl -X POST http://localhost:5001/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "title": "Corn Harvest Transport",
    "description": "Need transport for fresh corn harvest",
    "cropType": "corn",
    "quantity": 25000,
    "unit": "lbs",
    "pickupLocation": "Green Valley Farm, Sacramento, CA",
    "deliveryLocation": "Processing Plant, Stockton, CA",
    "pickupDate": "2024-12-25T08:00:00Z",
    "deliveryDate": "2024-12-25T18:00:00Z",
    "budget": 1200,
    "equipmentRequired": ["bulk", "covered"],
    "specialInstructions": "Keep dry during transport"
  }'
```

## 🏗️ Data Models

### User Profile Types

**Farmer Profile:**
- `farmName` - Name of the farm
- `farmSize` - Size in acres
- `farmLocation` - Address
- `primaryCrops` - Array of crop types
- `contactPhone` - Phone number
- `rating` - Average rating (0-5)
- `totalJobs` - Number of jobs posted

**Carrier Profile:**
- `companyName` - Company name
- `vehicleType` - Type of vehicle
- `vehicleCapacity` - Capacity in pounds
- `serviceAreas` - Array of service areas
- `contactPhone` - Phone number
- `rating` - Average rating (0-5)
- `totalDeliveries` - Number of completed deliveries
- `equipmentTypes` - Available equipment types

## 🛡️ Security Features

- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, and numbers
- **JWT Tokens**: 24-hour expiration
- **Role-based Access**: Farmer and carrier specific endpoints
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for specific origins

## 📊 Response Format

All API responses follow this consistent format:

```json
{
  "success": boolean,
  "data": object | array | null,
  "error": string | null,
  "message": string | null
}
```

## 🔧 Development

### Environment Variables
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:3000
```

### Running the API
```bash
npm run dev:server  # Development with auto-reload
npm run build       # Build for production
npm start          # Run production server
```

## 📚 Additional Resources

- **Swagger UI**: Interactive API testing at `/api-docs`
- **OpenAPI Spec**: Machine-readable spec at `/api-docs/openapi.json`
- **Health Check**: Service status at `/health`

---

**AgriHaul API v1.0.0** - Connecting farmers with carriers for efficient agricultural logistics.