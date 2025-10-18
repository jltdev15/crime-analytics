# 🔧 Environment Setup Guide

## Overview

This guide explains how to set up the environment variables for the Crime Analytics API.

## 📋 Quick Setup

### 1. Copy Environment Template
```bash
cp .env.example .env
```

### 2. Configure Database Connection
Edit the `.env` file and update the MongoDB connection string:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/crime-analytics

# For MongoDB Atlas (Production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crime-analytics?retryWrites=true&w=majority
```

### 3. Update Security Settings
Change the JWT secret to a strong, unique value:

```env
JWT_SECRET=your-very-strong-secret-key-here
```

## 🔑 Essential Variables

### Database Configuration
- **MONGODB_URI**: MongoDB connection string
- **DB_MAX_POOL_SIZE**: Maximum database connections (default: 10)
- **DB_MIN_POOL_SIZE**: Minimum database connections (default: 2)

### Server Configuration
- **PORT**: Server port (default: 3001)
- **NODE_ENV**: Environment (development/production)
- **CORS_ORIGIN**: Frontend URL for CORS

### Authentication
- **JWT_SECRET**: Secret key for JWT tokens
- **JWT_EXPIRES_IN**: Token expiration time

### AI Model Configuration
- **AI_TRAINING_ITERATIONS**: Number of training iterations (default: 3)
- **AI_CONFIDENCE_THRESHOLD**: Minimum confidence for predictions (default: 0.8)
- **PREDICTION_MONTHS_AHEAD**: How many months to predict (default: 6)

### Data Management
- **MAX_FILE_SIZE**: Maximum upload file size in bytes (default: 10MB)
- **ALLOWED_FILE_TYPES**: Allowed file extensions
- **BATCH_SIZE**: Number of records to process at once

### Analytics Configuration
- **HIGH_RISK_THRESHOLD**: Crime rate threshold for high risk (default: 10)
- **MEDIUM_RISK_THRESHOLD**: Crime rate threshold for medium risk (default: 5)
- **LOW_RISK_THRESHOLD**: Crime rate threshold for low risk (default: 0)

## 🚀 Development Setup

### Local Development
1. Install MongoDB locally or use MongoDB Atlas
2. Copy `.env.example` to `.env`
3. Update `MONGODB_URI` with your database connection
4. Update `JWT_SECRET` with a strong secret
5. Run `npm run dev`

### Production Setup
1. Use MongoDB Atlas or a production MongoDB instance
2. Set `NODE_ENV=production`
3. Use a strong, unique `JWT_SECRET`
4. Configure proper CORS origins
5. Set up proper logging and monitoring

## 🔒 Security Considerations

### JWT Secret
- Use a strong, random secret (at least 32 characters)
- Never commit the actual secret to version control
- Use different secrets for different environments

### Database Security
- Use authentication for MongoDB
- Enable SSL/TLS for production
- Use connection string with credentials

### CORS Configuration
- Set specific origins, not wildcards
- Use HTTPS in production
- Configure credentials properly

## 📊 Performance Tuning

### Database Connection Pool
```env
DB_MAX_POOL_SIZE=20        # Increase for high traffic
DB_MIN_POOL_SIZE=5         # Minimum connections
DB_MAX_IDLE_TIME_MS=30000  # Connection timeout
```

### Caching
```env
ENABLE_CACHING=true
CACHE_TTL=3600            # Cache time in seconds
```

### File Upload
```env
MAX_FILE_SIZE=20971520    # 20MB limit
BATCH_SIZE=200           # Process more records at once
```

## 🧪 Testing Configuration

### Test Database
```env
TEST_MONGODB_URI=mongodb://localhost:27017/crime-analytics-test
LOAD_TEST_DATA=false
TEST_DATA_PATH=./base_data/
```

## 📈 Monitoring & Logging

### Logging Levels
- **error**: Only errors
- **warn**: Warnings and errors
- **info**: General information (default)
- **debug**: Detailed debugging information

### Performance Monitoring
```env
ENABLE_PERFORMANCE_MONITORING=true
METRICS_COLLECTION_INTERVAL=60000
HEALTH_CHECK_INTERVAL=30000
```

## 🔄 Background Jobs

### AI Model Retraining
```env
AI_RETRAIN_SCHEDULE=0 2 * * *    # Daily at 2 AM
```

### Data Backup
```env
BACKUP_SCHEDULE=0 1 * * *        # Daily at 1 AM
```

## 📁 File Storage

### Upload Directories
```env
UPLOAD_DIR=./uploads             # File uploads
TEMP_DIR=./temp                  # Temporary files
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **CORS Errors**
   - Verify CORS_ORIGIN matches frontend URL
   - Check if frontend is running on correct port

3. **File Upload Issues**
   - Check MAX_FILE_SIZE setting
   - Verify ALLOWED_FILE_TYPES
   - Ensure upload directory exists

4. **AI Model Training Fails**
   - Check AI_TRAINING_ITERATIONS
   - Verify data quality
   - Check AI_CONFIDENCE_THRESHOLD

### Environment Validation
The API will validate required environment variables on startup and show helpful error messages if any are missing.

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅
