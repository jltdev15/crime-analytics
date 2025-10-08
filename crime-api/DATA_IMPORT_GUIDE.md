# 📊 Data Import System Guide

## Overview

The Crime Analytics system now includes a comprehensive data import functionality that allows administrators to easily upload new crime data and population data through the Vue.js frontend. This system automatically retrains the AI model with new data, ensuring predictions remain accurate and up-to-date.

## 🎯 Features

### ✅ **What's Implemented**

1. **Frontend Data Import Interface**
   - Drag-and-drop file upload
   - Support for Excel (.xlsx, .xls), CSV, and JSON files
   - Real-time file validation
   - Import progress tracking
   - Import history tracking

2. **Backend API Endpoints**
   - `/api/import/crime-data` - Upload and import crime data
   - `/api/import/population-data` - Upload and import population data
   - `/api/import/templates` - Download import templates
   - `/api/import/history` - View import history

3. **Automatic AI Retraining**
   - Neural network retrains automatically after data import
   - Enhanced predictions generated with new data
   - Fallback to statistical methods if retraining fails

4. **Data Validation**
   - File format validation
   - Data structure validation
   - Required field checking
   - Date format validation

## 🚀 How to Use

### 1. **Access the Data Import Interface**

Navigate to the **Data Management** page in the Vue.js frontend. You'll see the new **Data Import** section with three tabs:

- **Crime Data Import** - Upload new crime records
- **Population Data Import** - Upload population data
- **Import History** - View past imports

### 2. **Import Crime Data**

#### Step 1: Download Template (Optional)
Click the **"Crime Template"** button to download a sample CSV file with the correct format.

#### Step 2: Prepare Your Data
Your crime data file should include these **required fields**:
- `type` - Crime type (e.g., "DRUGS", "THEFT")
- `status` - Case status ("ONGOING" or "RELEASED")
- `confinementDate` - Date of confinement (YYYY-MM-DD format)
- `barangay` - Barangay name
- `municipality` - Municipality name
- `province` - Province name

**Optional fields**:
- `caseId` - Case ID
- `caseNumber` - Case number
- `gender` - Gender ("MALE", "FEMALE", "OTHER")
- `age` - Age (number)
- `civilStatus` - Civil status ("SINGLE", "MARRIED", etc.)
- `confinementTime` - Time of confinement
- `country` - Country (defaults to "PHILIPPINES")

#### Step 3: Upload File
1. Drag and drop your file or click to browse
2. Select import mode:
   - **Append**: Add to existing data
   - **Replace**: Replace all existing data
3. Click **"Import Crime Data"**

#### Step 4: Monitor Progress
- The system will validate your data
- Import records to the database
- Automatically retrain the AI model
- Generate new predictions

### 3. **Import Population Data**

#### Step 1: Download Template (Optional)
Click the **"Population Template"** button to download a sample CSV file.

#### Step 2: Prepare Your Data
Your population data file should include these **required fields**:
- `name` - Barangay name
- `municipality` - Municipality name
- `province` - Province name
- `country` - Country (defaults to "PHILIPPINES")
- `population` - Population number

#### Step 3: Upload File
1. Drag and drop your file or click to browse
2. Click **"Import Population Data"**

## 📋 File Format Examples

### Crime Data CSV Example
```csv
type,status,gender,age,civilStatus,confinementDate,confinementTime,barangay,municipality,province,country
DRUGS,ONGOING,MALE,25,SINGLE,2024-01-15,14:30,SANTA CRUZ,LUBAO,PAMPANGA,PHILIPPINES
THEFT,RELEASED,FEMALE,30,MARRIED,2024-01-16,09:15,SANTA CRUZ,LUBAO,PAMPANGA,PHILIPPINES
```

### Population Data CSV Example
```csv
name,municipality,province,country,population
SANTA CRUZ,LUBAO,PAMPANGA,PHILIPPINES,5000
SAN AGUSTIN,LUBAO,PAMPANGA,PHILIPPINES,3500
```

## 🔧 API Endpoints

### Upload Crime Data
```http
POST /api/import/crime-data
Content-Type: multipart/form-data

Body:
- file: [Excel/CSV/JSON file]
- importType: "append" | "replace"
```

**Response:**
```json
{
  "success": true,
  "message": "Data imported successfully",
  "data": {
    "totalRows": 150,
    "processedRows": 148,
    "importedCount": 148,
    "skippedCount": 2,
    "aiRetraining": {
      "success": true,
      "message": "AI model retrained successfully with new data"
    }
  }
}
```

### Upload Population Data
```http
POST /api/import/population-data
Content-Type: multipart/form-data

Body:
- file: [Excel/CSV/JSON file]
```

**Response:**
```json
{
  "success": true,
  "message": "Population data imported successfully",
  "data": {
    "totalRows": 50,
    "processedRows": 50,
    "upsertedCount": 30,
    "modifiedCount": 20
  }
}
```

### Get Import Templates
```http
GET /api/import/templates
```

**Response:**
```json
{
  "success": true,
  "data": {
    "crimeData": {
      "filename": "crime_data_template.xlsx",
      "description": "Template for crime data import",
      "requiredFields": ["type", "status", "confinementDate", "barangay", "municipality", "province"],
      "optionalFields": ["caseId", "caseNumber", "gender", "age", "civilStatus", "confinementTime", "country"],
      "sampleData": [...]
    },
    "populationData": {
      "filename": "population_data_template.xlsx",
      "description": "Template for population data import",
      "requiredFields": ["name", "municipality", "province", "country", "population"],
      "sampleData": [...]
    }
  }
}
```

### Get Import History
```http
GET /api/import/history
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "type": "crime_data",
      "filename": "crime_data_2024.xlsx",
      "importedCount": 150,
      "status": "completed",
      "importedAt": "2024-01-15T10:30:00Z",
      "retrainedAI": true
    }
  ]
}
```

## 🛡️ Data Validation

### File Validation
- **File Size**: Maximum 10MB
- **File Types**: Excel (.xlsx, .xls), CSV, JSON
- **File Structure**: Must contain valid data rows

### Crime Data Validation
- **Required Fields**: type, status, confinementDate, barangay, municipality, province
- **Date Format**: Must be valid date (YYYY-MM-DD)
- **Enum Values**: status must be "ONGOING" or "RELEASED"
- **Data Types**: age must be numeric, other fields must be strings

### Population Data Validation
- **Required Fields**: name, municipality, province, country, population
- **Data Types**: population must be numeric
- **Uniqueness**: Barangay names are unique per municipality/province

## 🔄 Automatic AI Retraining

When new crime data is imported:

1. **Data Processing**: New records are validated and stored
2. **AI Training**: Neural network retrains with updated dataset
3. **Prediction Generation**: New predictions are generated for all barangays
4. **Fallback**: If AI training fails, statistical methods are used

### Retraining Process
```typescript
// After successful data import
await this.enhancedPredictiveService.initialize(); // Retrain AI
await this.enhancedPredictiveService.generateAllPredictions(); // Generate new predictions
```

## 📊 Import Results

### Success Response
- **Total Rows**: Number of rows in uploaded file
- **Processed Rows**: Number of valid rows processed
- **Imported Count**: Number of records successfully imported
- **Skipped Count**: Number of records skipped (duplicates, invalid data)
- **AI Retraining**: Status of automatic AI retraining

### Error Handling
- **File Format Errors**: Invalid file type or structure
- **Validation Errors**: Missing required fields or invalid data
- **Database Errors**: Connection or constraint violations
- **AI Training Errors**: Neural network training failures

## 🎨 Frontend Components

### DataImport.vue
Main component with three tabs:
- **Crime Data Import**: File upload with import options
- **Population Data Import**: Simple file upload
- **Import History**: List of past imports

### Key Features
- **Drag & Drop**: Intuitive file upload interface
- **Progress Tracking**: Real-time import status
- **Error Display**: Clear error messages and validation feedback
- **Template Download**: Sample files for correct formatting

## 🔧 Technical Implementation

### Backend Architecture
```
DataImportController
├── uploadCrimeData() - Handle crime data import
├── uploadPopulationData() - Handle population data import
├── getImportTemplates() - Provide template files
├── getImportHistory() - Return import history
├── parseUploadedFile() - Parse different file formats
├── validateCrimeData() - Validate crime data structure
├── validatePopulationData() - Validate population data
├── importCrimeData() - Import to database
└── importPopulationData() - Import to database
```

### File Processing Pipeline
```
Upload File → Parse Format → Validate Data → Import to DB → Retrain AI → Generate Predictions
```

### Supported File Formats
- **Excel**: .xlsx, .xls (using XLSX library)
- **CSV**: Comma-separated values
- **JSON**: JavaScript Object Notation

## 🚨 Error Handling

### Common Errors and Solutions

1. **"No file uploaded"**
   - Solution: Select a file before clicking import

2. **"Invalid file type"**
   - Solution: Use Excel (.xlsx, .xls), CSV, or JSON files only

3. **"Missing required fields"**
   - Solution: Ensure all required fields are present in your data

4. **"Invalid date format"**
   - Solution: Use YYYY-MM-DD format for dates

5. **"AI retraining failed"**
   - Solution: Data is imported, but predictions use statistical fallback

## 📈 Performance Considerations

### File Size Limits
- **Maximum File Size**: 10MB
- **Recommended Batch Size**: 1000-5000 records per import
- **Large Files**: Consider splitting into multiple smaller files

### Processing Time
- **Small Files** (< 100 records): 5-10 seconds
- **Medium Files** (100-1000 records): 10-30 seconds
- **Large Files** (1000+ records): 30+ seconds

### Memory Usage
- Files are processed in memory
- Large files may require more server memory
- Consider server resources for very large imports

## 🔮 Future Enhancements

### Planned Features
1. **Batch Import**: Process multiple files simultaneously
2. **Scheduled Imports**: Automatic data import from external sources
3. **Data Mapping**: Custom field mapping for different data formats
4. **Import Scheduling**: Set up recurring data imports
5. **Data Transformation**: Built-in data cleaning and transformation
6. **Real-time Validation**: Live validation as users type

### Performance Improvements
1. **Streaming Processing**: Handle very large files without memory issues
2. **Parallel Processing**: Import multiple files simultaneously
3. **Incremental Training**: Update AI model incrementally
4. **Caching**: Cache validation results and templates

## 🆘 Troubleshooting

### Import Fails
1. Check file format and size
2. Verify required fields are present
3. Check date formats
4. Review server logs for detailed errors

### AI Retraining Fails
1. Data is still imported successfully
2. Predictions will use statistical methods
3. Check server logs for training errors
4. Try manual retraining from Data Management page

### Performance Issues
1. Reduce file size
2. Split large files into smaller batches
3. Check server resources
4. Consider upgrading server specifications

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅

For technical support or questions about the data import system, please refer to the development team or check the system logs for detailed error information.
