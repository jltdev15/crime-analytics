#!/usr/bin/env node

/**
 * Import New Crime Data Script
 * 
 * This script handles importing new crime data from Excel files,
 * validates the data, and retrains the AI model.
 * 
 * Usage:
 *   node scripts/import-new-data.js [excel-file-path]
 * 
 * Example:
 *   node scripts/import-new-data.js new-crime-data.xlsx
 */

const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import models
const { Crime, Barangay } = require('../src/models');

// Configuration
const CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/crime-analytics',
  BATCH_SIZE: 100,
  VALID_CRIME_TYPES: ['DRUGS', 'ROBBERY', 'THEFT', 'HOMICIDE', 'FRUSTRATED HOMICIDE', 'ASSAULT', 'BURGLARY'],
  REQUIRED_FIELDS: ['barangay', 'municipality', 'province', 'crimeType', 'confinementDate']
};

class DataImporter {
  constructor() {
    this.stats = {
      totalRecords: 0,
      validRecords: 0,
      invalidRecords: 0,
      duplicates: 0,
      newRecords: 0,
      errors: []
    };
  }

  /**
   * Main import function
   */
  async importData(excelFilePath) {
    try {
      console.log('🚀 Starting data import process...');
      
      // Connect to MongoDB
      await this.connectToDatabase();
      
      // Validate file exists
      if (!fs.existsSync(excelFilePath)) {
        throw new Error(`File not found: ${excelFilePath}`);
      }
      
      // Read Excel file
      const rawData = await this.readExcelFile(excelFilePath);
      console.log(`📊 Found ${rawData.length} records in Excel file`);
      
      // Clean and validate data
      const cleanedData = await this.cleanAndValidateData(rawData);
      console.log(`✅ ${cleanedData.length} valid records after cleaning`);
      
      // Check for duplicates
      const uniqueData = await this.removeDuplicates(cleanedData);
      console.log(`🔄 ${uniqueData.length} unique records after duplicate removal`);
      
      // Import to database
      await this.importToDatabase(uniqueData);
      
      // Retrain AI model
      await this.retrainAIModel();
      
      // Generate summary report
      this.generateSummaryReport();
      
    } catch (error) {
      console.error('❌ Import failed:', error.message);
      this.stats.errors.push(error.message);
    } finally {
      await mongoose.disconnect();
      console.log('🔌 Database connection closed');
    }
  }

  /**
   * Connect to MongoDB
   */
  async connectToDatabase() {
    try {
      await mongoose.connect(CONFIG.MONGODB_URI);
      console.log('🗄️  Connected to MongoDB');
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  /**
   * Read Excel file and convert to JSON
   */
  async readExcelFile(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      this.stats.totalRecords = data.length;
      return data;
    } catch (error) {
      throw new Error(`Failed to read Excel file: ${error.message}`);
    }
  }

  /**
   * Clean and validate data
   */
  async cleanAndValidateData(rawData) {
    const validData = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const record = rawData[i];
      const cleanedRecord = this.cleanRecord(record);
      const validationErrors = this.validateRecord(cleanedRecord);
      
      if (validationErrors.length === 0) {
        validData.push(cleanedRecord);
        this.stats.validRecords++;
      } else {
        this.stats.invalidRecords++;
        this.stats.errors.push(`Row ${i + 2}: ${validationErrors.join(', ')}`);
      }
    }
    
    return validData;
  }

  /**
   * Clean individual record
   */
  cleanRecord(record) {
    return {
      barangay: record.barangay ? record.barangay.toString().toUpperCase().trim() : '',
      municipality: record.municipality ? record.municipality.toString().toUpperCase().trim() : '',
      province: record.province ? record.province.toString().toUpperCase().trim() : '',
      crimeType: record.crimeType ? record.crimeType.toString().toUpperCase().trim() : '',
      confinementDate: this.parseDate(record.confinementDate),
      createdAt: new Date()
    };
  }

  /**
   * Parse date from various formats
   */
  parseDate(dateValue) {
    if (!dateValue) return null;
    
    // Handle Excel date serial numbers
    if (typeof dateValue === 'number') {
      const excelEpoch = new Date(1900, 0, 1);
      return new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000);
    }
    
    // Handle string dates
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    // Handle Date objects
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    return null;
  }

  /**
   * Validate individual record
   */
  validateRecord(record) {
    const errors = [];
    
    // Check required fields
    for (const field of CONFIG.REQUIRED_FIELDS) {
      if (!record[field]) {
        errors.push(`Missing ${field}`);
      }
    }
    
    // Validate crime type
    if (record.crimeType && !CONFIG.VALID_CRIME_TYPES.includes(record.crimeType)) {
      errors.push(`Invalid crime type: ${record.crimeType}`);
    }
    
    // Validate date
    if (record.confinementDate && isNaN(record.confinementDate.getTime())) {
      errors.push('Invalid confinement date');
    }
    
    // Validate date range (not too far in future or past)
    if (record.confinementDate) {
      const now = new Date();
      const tenYearsAgo = new Date(now.getFullYear() - 10, 0, 1);
      const oneYearFromNow = new Date(now.getFullYear() + 1, 11, 31);
      
      if (record.confinementDate < tenYearsAgo) {
        errors.push('Date too far in the past');
      }
      if (record.confinementDate > oneYearFromNow) {
        errors.push('Date too far in the future');
      }
    }
    
    return errors;
  }

  /**
   * Remove duplicate records
   */
  async removeDuplicates(data) {
    const uniqueData = [];
    const seen = new Set();
    
    for (const record of data) {
      const key = `${record.barangay}-${record.municipality}-${record.province}-${record.crimeType}-${record.confinementDate.toISOString()}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueData.push(record);
      } else {
        this.stats.duplicates++;
      }
    }
    
    return uniqueData;
  }

  /**
   * Import data to database
   */
  async importToDatabase(data) {
    if (data.length === 0) {
      console.log('ℹ️  No new data to import');
      return;
    }
    
    try {
      // Import in batches
      for (let i = 0; i < data.length; i += CONFIG.BATCH_SIZE) {
        const batch = data.slice(i, i + CONFIG.BATCH_SIZE);
        
        try {
          const result = await Crime.insertMany(batch, { ordered: false });
          this.stats.newRecords += result.length;
          console.log(`💾 Imported batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}: ${result.length} records`);
        } catch (error) {
          if (error.code === 11000) {
            // Handle duplicate key errors
            console.log(`⚠️  Some records in batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1} already exist`);
          } else {
            throw error;
          }
        }
      }
      
      console.log(`✅ Successfully imported ${this.stats.newRecords} new records`);
      
    } catch (error) {
      throw new Error(`Database import failed: ${error.message}`);
    }
  }

  /**
   * Retrain AI model
   */
  async retrainAIModel() {
    try {
      console.log('🤖 Retraining AI model with new data...');
      
      // Import the enhanced predictive service
      const { EnhancedPredictiveService } = require('../src/services/enhanced-predictive.service');
      const predictiveService = new EnhancedPredictiveService();
      
      // Initialize and train the model
      await predictiveService.initialize();
      
      // Generate new predictions
      await predictiveService.generateAllPredictions();
      
      console.log('✅ AI model retrained successfully');
      
    } catch (error) {
      console.error('⚠️  AI model retraining failed:', error.message);
      console.log('ℹ️  System will continue with existing model');
    }
  }

  /**
   * Generate summary report
   */
  generateSummaryReport() {
    console.log('\n📊 IMPORT SUMMARY REPORT');
    console.log('========================');
    console.log(`Total records processed: ${this.stats.totalRecords}`);
    console.log(`Valid records: ${this.stats.validRecords}`);
    console.log(`Invalid records: ${this.stats.invalidRecords}`);
    console.log(`Duplicate records: ${this.stats.duplicates}`);
    console.log(`New records imported: ${this.stats.newRecords}`);
    console.log(`Errors encountered: ${this.stats.errors.length}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    console.log('\n✅ Import process completed!');
  }
}

// Main execution
async function main() {
  const excelFilePath = process.argv[2];
  
  if (!excelFilePath) {
    console.log('Usage: node scripts/import-new-data.js [excel-file-path]');
    console.log('Example: node scripts/import-new-data.js new-crime-data.xlsx');
    process.exit(1);
  }
  
  const importer = new DataImporter();
  await importer.importData(excelFilePath);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DataImporter;
