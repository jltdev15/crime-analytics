# 📊 Data Management Guide

## Overview

This guide explains how to handle new datasets, update existing data, and maintain the machine learning model when new crime data becomes available.

## 🔄 Adding New Data

### 1. **Import New Crime Records**

#### Option A: Excel File Import (Recommended)
```bash
# Place your new Excel file in the crime-api directory
# Example: new-crime-data.xlsx

# Run the import script
cd crime-api
node import-crimes.js
```

#### Option B: Manual Database Insert
```javascript
// Use MongoDB directly or create a custom import script
const newCrimeData = [
  {
    barangay: "NEW BARANGAY",
    municipality: "LUBAO",
    province: "PAMPANGA",
    crimeType: "THEFT",
    confinementDate: new Date("2024-01-15"),
    // ... other fields
  }
];

// Insert into database
await Crime.insertMany(newCrimeData);
```

### 2. **Update Population Data**

If you have new population data:
```bash
# Update the population Excel file
# Example: lubaoPopulation.xlsx

# Re-run the import script to update barangay populations
node import-crimes.js
```

## 🤖 Retraining the AI Model

### 1. **Automatic Retraining**

The system automatically retrains when new data is detected:

```typescript
// In enhanced-predictive.service.ts
async initialize() {
  // Check if new data is available
  const latestCrime = await Crime.findOne().sort({ createdAt: -1 });
  const lastTraining = await this.getLastTrainingDate();
  
  if (latestCrime.createdAt > lastTraining) {
    console.log('🔄 New data detected, retraining AI model...');
    await this.retrainModel();
  }
}
```

### 2. **Manual Retraining**

#### Via Frontend
1. Go to **Predictive Analytics** page
2. Click **"Retrain AI Model"** button
3. Wait for training to complete (30-60 seconds)

#### Via API
```bash
# Trigger manual retraining
curl -X POST "http://localhost:3001/api/predict/test/training"
```

#### Via Script
```bash
# Run the standalone training script
cd crime-api
node train-ai.js
```

## 📈 Data Validation and Quality

### 1. **Data Quality Checks**

Before importing new data, validate:

```javascript
// Data validation checklist
const validateCrimeData = (data) => {
  const errors = [];
  
  // Required fields
  if (!data.barangay) errors.push('Missing barangay');
  if (!data.municipality) errors.push('Missing municipality');
  if (!data.province) errors.push('Missing province');
  if (!data.crimeType) errors.push('Missing crime type');
  if (!data.confinementDate) errors.push('Missing confinement date');
  
  // Date validation
  if (data.confinementDate && isNaN(new Date(data.confinementDate))) {
    errors.push('Invalid confinement date');
  }
  
  // Crime type validation
  const validCrimeTypes = ['DRUGS', 'ROBBERY', 'THEFT', 'HOMICIDE', 'FRUSTRATED HOMICIDE'];
  if (!validCrimeTypes.includes(data.crimeType)) {
    errors.push('Invalid crime type');
  }
  
  return errors;
};
```

### 2. **Data Cleaning**

```javascript
// Clean and normalize data
const cleanCrimeData = (data) => {
  return {
    ...data,
    barangay: data.barangay.toUpperCase().trim(),
    municipality: data.municipality.toUpperCase().trim(),
    province: data.province.toUpperCase().trim(),
    crimeType: data.crimeType.toUpperCase().trim(),
    confinementDate: new Date(data.confinementDate)
  };
};
```

## 🔧 Data Management Scripts

### 1. **Create Import Script for New Data**

```javascript
// scripts/import-new-data.js
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const { Crime, Barangay } = require('../src/models');

async function importNewData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Read Excel file
    const workbook = XLSX.readFile('new-crime-data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${data.length} new records`);
    
    // Clean and validate data
    const cleanedData = data.map(cleanCrimeData);
    const validData = cleanedData.filter(record => 
      validateCrimeData(record).length === 0
    );
    
    console.log(`✅ ${validData.length} valid records after cleaning`);
    
    // Insert new data
    const result = await Crime.insertMany(validData, { ordered: false });
    console.log(`💾 Inserted ${result.length} new crime records`);
    
    // Retrain AI model
    console.log('🤖 Retraining AI model with new data...');
    // Trigger retraining here
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

importNewData();
```

### 2. **Data Backup Script**

```javascript
// scripts/backup-data.js
const mongoose = require('mongoose');
const fs = require('fs');
const { Crime, Barangay, Prediction } = require('../src/models');

async function backupData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Backup crimes
    const crimes = await Crime.find({});
    fs.writeFileSync(`backup/crimes-${timestamp}.json`, JSON.stringify(crimes, null, 2));
    
    // Backup barangays
    const barangays = await Barangay.find({});
    fs.writeFileSync(`backup/barangays-${timestamp}.json`, JSON.stringify(barangays, null, 2));
    
    // Backup predictions
    const predictions = await Prediction.find({});
    fs.writeFileSync(`backup/predictions-${timestamp}.json`, JSON.stringify(predictions, null, 2));
    
    console.log(`✅ Data backed up to backup/ directory`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

backupData();
```

## 📊 Data Monitoring and Analytics

### 1. **Data Quality Dashboard**

```javascript
// scripts/data-quality-report.js
async function generateDataQualityReport() {
  const report = {
    totalRecords: await Crime.countDocuments(),
    dateRange: {
      earliest: await Crime.findOne().sort({ confinementDate: 1 }).select('confinementDate'),
      latest: await Crime.findOne().sort({ confinementDate: -1 }).select('confinementDate')
    },
    missingData: {
      missingBarangay: await Crime.countDocuments({ barangay: { $exists: false } }),
      missingCrimeType: await Crime.countDocuments({ crimeType: { $exists: false } }),
      missingDate: await Crime.countDocuments({ confinementDate: { $exists: false } })
    },
    crimeTypeDistribution: await Crime.aggregate([
      { $group: { _id: '$crimeType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    barangayDistribution: await Crime.aggregate([
      { $group: { _id: '$barangay', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  };
  
  console.log('📊 Data Quality Report:', JSON.stringify(report, null, 2));
  return report;
}
```

### 2. **Data Freshness Monitoring**

```javascript
// scripts/monitor-data-freshness.js
async function monitorDataFreshness() {
  const latestCrime = await Crime.findOne().sort({ createdAt: -1 });
  const daysSinceLastUpdate = Math.floor(
    (new Date() - latestCrime.createdAt) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastUpdate > 30) {
    console.log(`⚠️  Warning: Data is ${daysSinceLastUpdate} days old`);
    // Send alert or notification
  } else {
    console.log(`✅ Data is fresh (${daysSinceLastUpdate} days old)`);
  }
}
```

## 🔄 Automated Data Pipeline

### 1. **Scheduled Data Updates**

```javascript
// scripts/scheduled-updates.js
const cron = require('node-cron');

// Run every Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
  console.log('🔄 Running weekly data update...');
  
  try {
    // Check for new data files
    const newDataFiles = await checkForNewDataFiles();
    
    if (newDataFiles.length > 0) {
      // Import new data
      await importNewData();
      
      // Retrain AI model
      await retrainAIModel();
      
      // Generate new predictions
      await generateNewPredictions();
      
      console.log('✅ Weekly update completed successfully');
    } else {
      console.log('ℹ️  No new data files found');
    }
  } catch (error) {
    console.error('❌ Weekly update failed:', error);
  }
});
```

### 2. **Data Validation Pipeline**

```javascript
// scripts/data-validation-pipeline.js
async function runDataValidationPipeline() {
  const steps = [
    { name: 'Check Data Integrity', fn: checkDataIntegrity },
    { name: 'Validate Date Ranges', fn: validateDateRanges },
    { name: 'Check Crime Type Consistency', fn: checkCrimeTypeConsistency },
    { name: 'Validate Barangay References', fn: validateBarangayReferences },
    { name: 'Check for Duplicates', fn: checkForDuplicates }
  ];
  
  const results = [];
  
  for (const step of steps) {
    try {
      console.log(`🔍 Running: ${step.name}`);
      const result = await step.fn();
      results.push({ step: step.name, status: 'success', result });
    } catch (error) {
      console.error(`❌ Failed: ${step.name}`, error);
      results.push({ step: step.name, status: 'failed', error: error.message });
    }
  }
  
  return results;
}
```

## 🚨 Error Handling and Recovery

### 1. **Data Import Error Recovery**

```javascript
// scripts/error-recovery.js
async function recoverFromImportError() {
  try {
    // Check for partial imports
    const lastSuccessfulImport = await getLastSuccessfulImport();
    const failedRecords = await getFailedRecords(lastSuccessfulImport);
    
    if (failedRecords.length > 0) {
      console.log(`🔄 Recovering ${failedRecords.length} failed records`);
      
      // Retry failed records
      for (const record of failedRecords) {
        try {
          await Crime.create(record);
          console.log(`✅ Recovered record: ${record._id}`);
        } catch (error) {
          console.error(`❌ Still failed: ${record._id}`, error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Recovery failed:', error);
  }
}
```

### 2. **Model Training Error Recovery**

```javascript
// scripts/model-recovery.js
async function recoverFromTrainingError() {
  try {
    // Check if model training failed
    const modelStatus = await getModelStatus();
    
    if (!modelStatus.isTrained) {
      console.log('🔄 Model training failed, attempting recovery...');
      
      // Try with statistical fallback
      await enableStatisticalFallback();
      
      // Retry neural network training
      await retryNeuralNetworkTraining();
      
      console.log('✅ Model recovery completed');
    }
  } catch (error) {
    console.error('❌ Model recovery failed:', error);
  }
}
```

## 📋 Best Practices

### 1. **Data Management**
- ✅ Always backup data before importing new records
- ✅ Validate data quality before importing
- ✅ Use transactions for bulk operations
- ✅ Monitor data freshness regularly
- ✅ Keep audit logs of all data changes

### 2. **Model Maintenance**
- ✅ Retrain model when new data is added
- ✅ Monitor model performance over time
- ✅ Keep statistical fallback as backup
- ✅ Test predictions against actual outcomes
- ✅ Document model changes and improvements

### 3. **System Monitoring**
- ✅ Set up alerts for data quality issues
- ✅ Monitor API performance and response times
- ✅ Track prediction accuracy and confidence
- ✅ Log all system events and errors
- ✅ Regular system health checks

## 🔮 Future Enhancements

### Planned Features
1. **Real-time Data Streaming**: Live data updates
2. **Automated Data Validation**: AI-powered data quality checks
3. **Data Versioning**: Track data changes over time
4. **A/B Testing**: Compare different model versions
5. **Data Lineage**: Track data sources and transformations

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅
