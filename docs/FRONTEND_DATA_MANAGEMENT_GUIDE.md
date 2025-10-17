# 🎯 Frontend Data Management Guide

## Overview

The **Data Management** page provides a user-friendly interface for uploading new crime data, monitoring system health, and managing your dataset through the web interface.

## 🚀 Getting Started

### Access the Data Management Page

1. **Navigate to Data Management**: Click on "Data Management" in the main navigation menu
2. **URL**: `http://localhost:5173/data-management`

## 📊 Features

### 1. **File Upload Interface**

#### **Upload New Crime Data**
- **Drag & Drop**: Simply drag your Excel file onto the upload area
- **Click to Browse**: Click the upload area to select a file from your computer
- **Supported Formats**: `.xlsx` and `.xls` files only
- **File Size Limit**: Maximum 10MB per file

#### **Required Excel Columns**

**For Crime Data Files:**
- `barangay` (required)
- `municipality` (required)
- `province` (required)
- `crimeType` (required)
- `confinementDate` (required)

**For Population Data Files:**
- `Barangay` or `barangay` (required)
- `Population` or `population` (required)
- `Municipality` or `municipality` (optional, defaults to LUBAO)
- `Province` or `province` (optional, defaults to PAMPANGA)

#### **Valid Crime Types**
- DRUGS
- ROBBERY
- THEFT
- HOMICIDE
- FRUSTRATED HOMICIDE
- ASSAULT
- BURGLARY

### 2. **System Health Dashboard**

#### **Health Cards**
- **Total Crimes**: Shows current number of crime records
- **Total Barangays**: Shows number of barangays in the system
- **AI Model Status**: Indicates if the neural network is trained
- **Last Updated**: Shows when data was last refreshed

#### **Data Quality Metrics**
- **Overall Health**: Excellent, Good, Fair, Poor, or Critical
- **Data Completeness**: Percentage of complete records
- **Missing Records**: Number of records with missing data

#### **Model Performance**
- **Training Status**: Completed, In Progress, or Failed
- **Confidence Level**: AI model confidence percentage
- **Predictions Generated**: Total number of predictions

### 3. **Interactive Controls**

#### **Refresh Data**
- **Button**: "Refresh" button in the top-right corner
- **Action**: Updates all system health metrics
- **Frequency**: Use whenever you want current data

#### **Retrain AI Model**
- **Button**: "Retrain AI Model" button
- **Action**: Trains the neural network with latest data
- **Duration**: Takes 30-60 seconds to complete
- **Automatic**: Also happens after successful data upload

## 🔄 Data Upload Process

### **Step-by-Step Process**

1. **Prepare Your Excel File**
   - **Crime Data**: Ensure all required columns are present, use valid crime types
   - **Population Data**: Ensure Barangay and Population columns are present
   - Check date formats are correct (for crime data)

2. **Upload the File**
   - Drag and drop or click to browse
   - System automatically detects file type (crime vs population)
   - Wait for file validation
   - Click "Upload and Import Data"

3. **Processing**
   - File type is automatically detected
   - Data is validated and cleaned based on type
   - Duplicates are removed
   - Data is imported to appropriate database collection
   - AI model is automatically retrained (for crime data)

4. **Results**
   - Success/error message displayed with file type
   - System health updated
   - Recent activity logged

### **What Happens Automatically**

✅ **Data Validation**: Checks format and quality  
✅ **Data Cleaning**: Normalizes and standardizes  
✅ **Duplicate Removal**: Prevents duplicate entries  
✅ **Database Import**: Efficient batch insertion  
✅ **AI Retraining**: Updates the neural network  
✅ **New Predictions**: Generates updated forecasts  

## 📈 Monitoring and Alerts

### **System Health Indicators**

#### **Green Status** ✅
- Model trained and active
- Data quality excellent
- All systems operational

#### **Yellow Status** ⚠️
- Model training in progress
- Data quality needs attention
- Some issues detected

#### **Red Status** ❌
- Model training failed
- Data quality critical
- System issues detected

### **Recent Activity Log**

The system tracks and displays:
- File uploads and results
- AI model training events
- System health checks
- Error occurrences

## 🚨 Troubleshooting

### **Common Issues**

#### **"File Upload Failed"**
- **Check file format**: Must be `.xlsx` or `.xls`
- **Check file size**: Must be under 10MB
- **Check columns**: Ensure all required columns exist
- **Check data**: Verify crime types are valid

#### **"AI Training Failed"**
- **Check data quality**: Ensure sufficient valid data
- **Check server**: Verify backend is running
- **Retry**: Click "Retrain AI Model" button
- **Check logs**: Look for error messages

#### **"System Health Poor"**
- **Check data completeness**: Look for missing fields
- **Upload new data**: Add more complete records
- **Validate existing data**: Fix any data quality issues

### **Error Messages**

#### **File Format Errors**
```
"Only Excel files (.xlsx, .xls) are allowed"
```
**Solution**: Convert your file to Excel format

#### **Data Validation Errors**
```
"Invalid crime type: [TYPE]"
```
**Solution**: Use only valid crime types from the list

#### **Upload Size Errors**
```
"File too large"
```
**Solution**: Reduce file size or split into smaller files

## 🎯 Best Practices

### **Before Uploading**

1. ✅ **Validate Excel Format**: Check all required columns
2. ✅ **Check Data Quality**: Ensure dates and types are correct
3. ✅ **Backup Current Data**: Use backup feature if needed
4. ✅ **Test with Small Sample**: Try with a few records first

### **After Uploading**

1. ✅ **Verify Upload Success**: Check success message
2. ✅ **Monitor System Health**: Watch for any issues
3. ✅ **Check AI Training**: Ensure model retrained successfully
4. ✅ **Test Predictions**: Verify new predictions are working

### **Regular Maintenance**

- **Weekly**: Check system health status
- **Monthly**: Upload new data if available
- **Quarterly**: Review data quality metrics
- **As Needed**: Retrain AI model for better accuracy

## 🔧 Advanced Features

### **Data Backup**
- **Automatic**: System creates backups before major changes
- **Manual**: Use backup button for additional safety
- **Restore**: Contact admin for data restoration

### **Activity Monitoring**
- **Real-time**: See all system activities
- **Historical**: Track changes over time
- **Alerts**: Get notified of important events

### **Performance Optimization**
- **Batch Processing**: Efficient handling of large files
- **Progress Indicators**: Visual feedback during operations
- **Error Recovery**: Automatic retry mechanisms

## 📞 Support

### **Getting Help**

1. **Check Status**: Look at system health indicators
2. **Review Activity**: Check recent activity log
3. **Try Refresh**: Click refresh button to update
4. **Contact Admin**: For persistent issues

### **Quick Actions**

```bash
# Check if backend is running
curl http://localhost:3001/health

# Check system health
curl http://localhost:3001/api/data/health

# Test file upload
curl -X POST -F "file=@your-file.xlsx" http://localhost:3001/api/data/upload
```

---

**Quick Reference:**
- **Upload**: Drag & drop Excel file → Click "Upload and Import Data"
- **Refresh**: Click "Refresh" button to update system health
- **Retrain**: Click "Retrain AI Model" to update predictions
- **Monitor**: Watch system health cards for status updates

**Last Updated**: January 2024  
**Version**: 1.0.0
