#!/usr/bin/env node

/**
 * Data Backup Script
 * 
 * This script creates backups of all crime analytics data
 * including crimes, barangays, and predictions.
 * 
 * Usage:
 *   node scripts/backup-data.js [backup-directory]
 * 
 * Example:
 *   node scripts/backup-data.js backups/
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const { Crime, Barangay, Prediction } = require('../src/models');

// Configuration
const CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/crime-analytics',
  DEFAULT_BACKUP_DIR: 'backups'
};

class DataBackup {
  constructor(backupDir = CONFIG.DEFAULT_BACKUP_DIR) {
    this.backupDir = backupDir;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupPath = path.join(this.backupDir, `backup-${this.timestamp}`);
  }

  /**
   * Main backup function
   */
  async backupData() {
    try {
      console.log('💾 Starting data backup process...');
      
      // Connect to database
      await this.connectToDatabase();
      
      // Create backup directory
      await this.createBackupDirectory();
      
      // Backup each collection
      await this.backupCollection('crimes', Crime);
      await this.backupCollection('barangays', Barangay);
      await this.backupCollection('predictions', Prediction);
      
      // Create backup manifest
      await this.createBackupManifest();
      
      // Display summary
      this.displayBackupSummary();
      
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
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
   * Create backup directory
   */
  async createBackupDirectory() {
    try {
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
        console.log(`📁 Created backup directory: ${this.backupDir}`);
      }
      
      if (!fs.existsSync(this.backupPath)) {
        fs.mkdirSync(this.backupPath, { recursive: true });
        console.log(`📁 Created backup folder: ${this.backupPath}`);
      }
    } catch (error) {
      throw new Error(`Failed to create backup directory: ${error.message}`);
    }
  }

  /**
   * Backup a specific collection
   */
  async backupCollection(collectionName, Model) {
    try {
      console.log(`📊 Backing up ${collectionName}...`);
      
      // Get all documents
      const documents = await Model.find({});
      
      // Convert to JSON
      const jsonData = JSON.stringify(documents, null, 2);
      
      // Write to file
      const filePath = path.join(this.backupPath, `${collectionName}.json`);
      fs.writeFileSync(filePath, jsonData);
      
      console.log(`✅ Backed up ${documents.length} ${collectionName} records`);
      
      return {
        collection: collectionName,
        count: documents.length,
        filePath: filePath
      };
      
    } catch (error) {
      console.error(`❌ Failed to backup ${collectionName}:`, error.message);
      throw error;
    }
  }

  /**
   * Create backup manifest
   */
  async createBackupManifest() {
    try {
      console.log('📋 Creating backup manifest...');
      
      const manifest = {
        timestamp: this.timestamp,
        backupDate: new Date().toISOString(),
        collections: {
          crimes: await Crime.countDocuments(),
          barangays: await Barangay.countDocuments(),
          predictions: await Prediction.countDocuments()
        },
        totalRecords: await Crime.countDocuments() + await Barangay.countDocuments() + await Prediction.countDocuments(),
        backupPath: this.backupPath,
        version: '1.0.0'
      };
      
      const manifestPath = path.join(this.backupPath, 'manifest.json');
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      
      console.log('✅ Backup manifest created');
      
    } catch (error) {
      console.error('❌ Failed to create manifest:', error.message);
    }
  }

  /**
   * Display backup summary
   */
  displayBackupSummary() {
    console.log('\n📊 BACKUP SUMMARY');
    console.log('==================');
    console.log(`Backup Date: ${new Date().toISOString()}`);
    console.log(`Backup Path: ${this.backupPath}`);
    console.log(`Total Files: 4 (3 collections + 1 manifest)`);
    console.log('\n✅ Backup completed successfully!');
    console.log('\n💡 To restore data, use: node scripts/restore-data.js <backup-path>');
  }
}

// Main execution
async function main() {
  const backupDir = process.argv[2] || CONFIG.DEFAULT_BACKUP_DIR;
  const backup = new DataBackup(backupDir);
  await backup.backupData();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DataBackup;
