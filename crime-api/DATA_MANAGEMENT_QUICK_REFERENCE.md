# 🚀 Data Management Quick Reference

## 📋 Quick Actions

### 1. **Add New Crime Data**

```bash
# Step 1: Place your Excel file in crime-api directory
# Example: new-crime-data.xlsx

# Step 2: Run the import script
cd crime-api
node scripts/import-new-data.js new-crime-data.xlsx

# Step 3: Verify the import
node scripts/monitor-data-health.js
```

### 2. **Check Data Health**

```bash
# Run data health monitoring
cd crime-api
node scripts/monitor-data-health.js
```

### 3. **Backup Data**

```bash
# Create backup
cd crime-api
node scripts/backup-data.js

# Or specify custom directory
node scripts/backup-data.js my-backups/
```

### 4. **Retrain AI Model**

```bash
# Via API
curl -X POST "http://localhost:3001/api/predict/test/training"

# Via Frontend
# Go to Predictive Analytics page → Click "Retrain AI Model"

# Via Script
cd crime-api
node train-ai.js
```

## 📊 Data Requirements

### **Excel File Format**
Your Excel file should have these columns:
- `barangay` (required)
- `municipality` (required) 
- `province` (required)
- `crimeType` (required)
- `confinementDate` (required)

### **Valid Crime Types**
- DRUGS
- ROBBERY
- THEFT
- HOMICIDE
- FRUSTRATED HOMICIDE
- ASSAULT
- BURGLARY

### **Date Format**
- Excel date serial numbers
- ISO date strings (YYYY-MM-DD)
- JavaScript Date objects

## 🔧 Troubleshooting

### **Common Issues**

1. **"File not found" Error**
   ```bash
   # Make sure file is in the correct directory
   ls -la *.xlsx
   ```

2. **"Database connection failed"**
   ```bash
   # Check if MongoDB is running
   mongosh --eval "db.runCommand('ping')"
   ```

3. **"Invalid crime type" Error**
   ```bash
   # Check your crime types match the valid list
   # Use uppercase letters
   ```

4. **"AI training failed"**
   ```bash
   # Check if you have enough data (minimum 6 months)
   # Verify date fields are valid
   ```

### **Data Validation**

```bash
# Check data quality
node scripts/monitor-data-health.js

# Look for:
# - Missing required fields
# - Invalid dates
# - Duplicate records
# - Data freshness
```

## 📈 Monitoring Commands

### **Check System Status**
```bash
# Health check
curl http://localhost:3001/health

# Model performance
curl http://localhost:3001/api/predict/model/performance

# Data summary
curl http://localhost:3001/api/analytics/summary
```

### **View Logs**
```bash
# Check server logs
tail -f logs/server.log

# Check import logs
tail -f logs/import.log
```

## 🎯 Best Practices

### **Before Adding New Data**
1. ✅ **Backup existing data**
2. ✅ **Validate Excel file format**
3. ✅ **Check data quality**
4. ✅ **Test with small sample first**

### **After Adding New Data**
1. ✅ **Verify import success**
2. ✅ **Check data health**
3. ✅ **Retrain AI model**
4. ✅ **Test predictions**
5. ✅ **Monitor performance**

### **Regular Maintenance**
- **Weekly**: Check data health
- **Monthly**: Backup all data
- **Quarterly**: Review model performance
- **Annually**: Update documentation

## 🚨 Emergency Procedures

### **Data Corruption**
```bash
# 1. Stop the server
# 2. Restore from backup
node scripts/restore-data.js backups/backup-YYYY-MM-DD/

# 3. Verify data integrity
node scripts/monitor-data-health.js

# 4. Restart server
npm run dev
```

### **Model Failure**
```bash
# 1. Check model status
curl http://localhost:3001/api/predict/model/performance

# 2. Force retrain
curl -X POST http://localhost:3001/api/predict/test/training

# 3. Verify predictions work
curl "http://localhost:3001/api/predict/incidents?barangay=SANTA%20CRUZ&municipality=LUBAO&province=PAMPANGA&crimeType=DRUGS"
```

## 📞 Support

### **Get Help**
1. **Check logs**: Look for error messages
2. **Run health check**: `node scripts/monitor-data-health.js`
3. **Verify data**: Check Excel file format
4. **Test API**: Use curl commands above

### **Common Solutions**
- **Restart server**: `npm run dev`
- **Clear cache**: Delete `node_modules` and reinstall
- **Check MongoDB**: Ensure database is running
- **Validate data**: Use monitoring scripts

---

**Quick Commands Summary:**
```bash
# Import new data
node scripts/import-new-data.js your-file.xlsx

# Check health
node scripts/monitor-data-health.js

# Backup data
node scripts/backup-data.js

# Retrain AI
curl -X POST http://localhost:3001/api/predict/test/training
```

**Last Updated**: January 2024  
**Version**: 1.0.0
