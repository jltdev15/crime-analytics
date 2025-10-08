# 📚 API Reference Guide

## Overview

Complete reference for all Crime Analytics API endpoints, including request/response formats, parameters, and examples.

## 🔗 Base URL

```
http://localhost:3001/api
```

## 📊 Descriptive Analytics Endpoints

### 1. Get Summary Statistics
```http
GET /analytics/summary
```

**Description**: Get overall crime statistics and summary data

**Response**:
```json
{
  "success": true,
  "data": {
    "totalCrimes": 387,
    "totalBarangays": 44,
    "barangaysWithCrimes": 37,
    "lowCrimeRateBarangays": 7,
    "dateRange": "2010 - 2024",
    "totalRecords": 387
  }
}
```

### 2. Get Top Barangays by Crime Count
```http
GET /analytics/top-barangays?limit=10
```

**Parameters**:
- `limit` (optional): Number of results to return (default: 10)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "barangay": "SANTA CRUZ",
      "municipality": "LUBAO",
      "province": "PAMPANGA",
      "crimeCount": 45,
      "crimeRate": 0.12,
      "population": 3750
    }
  ]
}
```

### 3. Get Top Barangays by Crime Rate
```http
GET /analytics/top-barangays-rate?limit=10
```

**Parameters**:
- `limit` (optional): Number of results to return (default: 10)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "barangay": "SANTA CRUZ",
      "municipality": "LUBAO",
      "province": "PAMPANGA",
      "crimeCount": 45,
      "crimeRate": 0.12,
      "population": 3750
    }
  ]
}
```

### 4. Get Crime Distribution
```http
GET /analytics/crime-distribution
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "crimeType": "DRUGS",
      "count": 150,
      "percentage": 38.8
    },
    {
      "crimeType": "ROBBERY",
      "count": 120,
      "percentage": 31.0
    }
  ]
}
```

## 🧠 Predictive Analytics Endpoints

### 1. Generate All Predictions
```http
POST /predict/generate/predictions
```

**Description**: Train AI model and generate predictions for all barangays

**Response**:
```json
{
  "success": true,
  "message": "Enhanced predictions generated: 37 total, 37 using neural network",
  "data": {
    "totalPredictions": 37,
    "neuralNetworkPredictions": 37,
    "statisticalPredictions": 0
  }
}
```

### 2. Get Incident Forecast
```http
GET /predict/incidents
```

**Parameters**:
- `barangay` (required): Barangay name
- `municipality` (required): Municipality name
- `province` (required): Province name
- `crimeType` (required): Type of crime

**Example**:
```http
GET /predict/incidents?barangay=SANTA%20CRUZ&municipality=LUBAO&province=PAMPANGA&crimeType=DRUGS
```

**Response**:
```json
{
  "success": true,
  "data": {
    "barangay": "SANTA CRUZ",
    "municipality": "LUBAO",
    "province": "PAMPANGA",
    "crimeType": "DRUGS",
    "forecast": [
      {
        "month": "2024-07",
        "predicted": 7,
        "lower": 6,
        "upper": 8,
        "confidence": 0.67
      }
    ],
    "method": "neural-network",
    "trend": "increasing",
    "riskLevel": "medium"
  }
}
```

### 3. Get Risk Assessment
```http
GET /predict/risk
```

**Parameters**:
- `barangay` (required): Barangay name
- `municipality` (required): Municipality name
- `province` (required): Province name

**Example**:
```http
GET /predict/risk?barangay=SANTA%20CRUZ&municipality=LUBAO&province=PAMPANGA
```

**Response**:
```json
{
  "success": true,
  "data": {
    "barangay": "SANTA CRUZ",
    "municipality": "LUBAO",
    "province": "PAMPANGA",
    "riskLevel": "medium",
    "probability": 0.65,
    "factors": {
      "historicalTrend": "increasing",
      "populationDensity": "high",
      "crimeRate": 0.12
    },
    "recommendations": [
      "Increase patrol frequency",
      "Implement community watch programs"
    ]
  }
}
```

### 4. Get Model Performance
```http
GET /predict/model/performance
```

**Response**:
```json
{
  "success": true,
  "data": {
    "neuralNetwork": {
      "isTrained": true,
      "trainingDataPoints": 65,
      "architecture": "LSTM (6-10-5-1)",
      "confidence": 0.67,
      "lastTrained": "2024-01-15T10:30:00Z"
    },
    "statistical": {
      "isAvailable": true,
      "method": "Linear Regression",
      "reliability": "high"
    },
    "hybrid": {
      "isActive": true,
      "primaryMethod": "neural-network",
      "fallbackMethod": "statistical"
    }
  }
}
```

### 5. Test AI Training
```http
POST /predict/test/training
```

**Description**: Manually trigger AI training for testing

**Response**:
```json
{
  "success": true,
  "message": "AI training completed successfully",
  "data": {
    "trainingDataPoints": 65,
    "trainingIterations": 500,
    "finalError": 0.023,
    "confidence": 0.67
  }
}
```

## 🏘️ Crime Data Endpoints

### 1. Get All Crimes
```http
GET /crimes
```

**Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `barangay` (optional): Filter by barangay
- `municipality` (optional): Filter by municipality
- `province` (optional): Filter by province
- `crimeType` (optional): Filter by crime type

**Example**:
```http
GET /crimes?page=1&limit=10&search=DRUGS&barangay=SANTA%20CRUZ
```

**Response**:
```json
{
  "success": true,
  "data": {
    "crimes": [
      {
        "_id": "65a1b2c3d4e5f6789abcdef0",
        "barangay": "SANTA CRUZ",
        "municipality": "LUBAO",
        "province": "PAMPANGA",
        "crimeType": "DRUGS",
        "confinementDate": "2023-12-15T00:00:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 39,
      "totalItems": 387,
      "itemsPerPage": 10
    }
  }
}
```

### 2. Get Crime by ID
```http
GET /crimes/:id
```

**Parameters**:
- `id` (required): Crime record ID

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789abcdef0",
    "barangay": "SANTA CRUZ",
    "municipality": "LUBAO",
    "province": "PAMPANGA",
    "crimeType": "DRUGS",
    "confinementDate": "2023-12-15T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🏘️ Barangay Endpoints

### 1. Get All Barangays
```http
GET /barangays
```

**Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `municipality` (optional): Filter by municipality
- `province` (optional): Filter by province

**Response**:
```json
{
  "success": true,
  "data": {
    "barangays": [
      {
        "_id": "65a1b2c3d4e5f6789abcdef1",
        "name": "SANTA CRUZ",
        "municipality": "LUBAO",
        "province": "PAMPANGA",
        "population": 3750,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 44,
      "itemsPerPage": 20
    }
  }
}
```

### 2. Get Barangay by ID
```http
GET /barangays/:id
```

**Parameters**:
- `id` (required): Barangay ID

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6789abcdef1",
    "name": "SANTA CRUZ",
    "municipality": "LUBAO",
    "province": "PAMPANGA",
    "population": 3750,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🚨 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request parameters
- `NOT_FOUND`: Resource not found
- `INTERNAL_ERROR`: Server internal error
- `TRAINING_FAILED`: AI model training failed
- `INSUFFICIENT_DATA`: Not enough data for prediction

### HTTP Status Codes

- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## 🔧 Authentication

### Firebase Integration
The API integrates with Firebase for authentication. Include the Firebase ID token in the Authorization header:

```http
Authorization: Bearer <firebase-id-token>
```

## 📊 Rate Limiting

- **Analytics Endpoints**: 100 requests per minute
- **Predictive Endpoints**: 50 requests per minute
- **Data Endpoints**: 200 requests per minute

## 🧪 Testing

### Health Check
```http
GET /health
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Test Endpoints
```http
GET /test
```

**Response**:
```json
{
  "message": "API is working correctly",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📚 Examples

### JavaScript/Axios
```javascript
// Get summary statistics
const response = await axios.get('/api/analytics/summary');

// Get incident forecast
const forecast = await axios.get('/api/predict/incidents', {
  params: {
    barangay: 'SANTA CRUZ',
    municipality: 'LUBAO',
    province: 'PAMPANGA',
    crimeType: 'DRUGS'
  }
});

// Retrain AI model
const training = await axios.post('/api/predict/test/training');
```

### cURL
```bash
# Get summary statistics
curl -X GET "http://localhost:3001/api/analytics/summary"

# Get incident forecast
curl -X GET "http://localhost:3001/api/predict/incidents?barangay=SANTA%20CRUZ&municipality=LUBAO&province=PAMPANGA&crimeType=DRUGS"

# Retrain AI model
curl -X POST "http://localhost:3001/api/predict/test/training"
```

## 🔮 Future Endpoints

### Planned Features
- `POST /predict/generate/recommendations`: Generate prescriptive recommendations
- `GET /predict/trends`: Get crime trend analysis
- `POST /crimes`: Create new crime records
- `PUT /crimes/:id`: Update crime records
- `DELETE /crimes/:id`: Delete crime records

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅
