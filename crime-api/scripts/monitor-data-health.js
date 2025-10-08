#!/usr/bin/env node

/**
 * Data Health Monitoring Script
 * 
 * This script monitors the health and quality of crime data,
 * checks for data freshness, and generates reports.
 * 
 * Usage:
 *   node scripts/monitor-data-health.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { Crime, Barangay, Prediction } = require('../src/models');

// Configuration
const CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/crime-analytics',
  DATA_FRESHNESS_THRESHOLD_DAYS: 30,
  MIN_RECORDS_THRESHOLD: 100
};

class DataHealthMonitor {
  constructor() {
    this.report = {
      timestamp: new Date(),
      dataQuality: {},
      dataFreshness: {},
      modelStatus: {},
      recommendations: []
    };
  }

  /**
   * Main monitoring function
   */
  async monitorDataHealth() {
    try {
      console.log('🔍 Starting data health monitoring...');
      
      // Connect to database
      await this.connectToDatabase();
      
      // Check data quality
      await this.checkDataQuality();
      
      // Check data freshness
      await this.checkDataFreshness();
      
      // Check model status
      await this.checkModelStatus();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Display report
      this.displayReport();
      
    } catch (error) {
      console.error('❌ Monitoring failed:', error.message);
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
   * Check data quality metrics
   */
  async checkDataQuality() {
    console.log('📊 Checking data quality...');
    
    const totalCrimes = await Crime.countDocuments();
    const totalBarangays = await Barangay.countDocuments();
    const totalPredictions = await Prediction.countDocuments();
    
    // Check for missing data
    const missingData = {
      missingBarangay: await Crime.countDocuments({ barangay: { $exists: false } }),
      missingCrimeType: await Crime.countDocuments({ crimeType: { $exists: false } }),
      missingDate: await Crime.countDocuments({ confinementDate: { $exists: false } }),
      missingMunicipality: await Crime.countDocuments({ municipality: { $exists: false } }),
      missingProvince: await Crime.countDocuments({ province: { $exists: false } })
    };
    
    // Check data completeness
    const completeness = {
      barangay: ((totalCrimes - missingData.missingBarangay) / totalCrimes * 100).toFixed(2),
      crimeType: ((totalCrimes - missingData.missingCrimeType) / totalCrimes * 100).toFixed(2),
      date: ((totalCrimes - missingData.missingDate) / totalCrimes * 100).toFixed(2),
      municipality: ((totalCrimes - missingData.missingMunicipality) / totalCrimes * 100).toFixed(2),
      province: ((totalCrimes - missingData.missingProvince) / totalCrimes * 100).toFixed(2)
    };
    
    // Check for invalid dates
    const invalidDates = await Crime.countDocuments({
      confinementDate: { $exists: true, $not: { $type: 'date' } }
    });
    
    // Check for future dates
    const futureDates = await Crime.countDocuments({
      confinementDate: { $gt: new Date() }
    });
    
    // Check for very old dates (before 2010)
    const oldDates = await Crime.countDocuments({
      confinementDate: { $lt: new Date('2010-01-01') }
    });
    
    this.report.dataQuality = {
      totalCrimes,
      totalBarangays,
      totalPredictions,
      missingData,
      completeness,
      invalidDates,
      futureDates,
      oldDates,
      overallHealth: this.calculateOverallHealth(completeness, missingData, totalCrimes)
    };
  }

  /**
   * Check data freshness
   */
  async checkDataFreshness() {
    console.log('🕒 Checking data freshness...');
    
    // Get latest crime record
    const latestCrime = await Crime.findOne().sort({ createdAt: -1 });
    const latestCrimeDate = latestCrime ? latestCrime.createdAt : null;
    
    // Get latest prediction
    const latestPrediction = await Prediction.findOne().sort({ createdAt: -1 });
    const latestPredictionDate = latestPrediction ? latestPrediction.createdAt : null;
    
    // Calculate days since last update
    const daysSinceLastCrime = latestCrimeDate ? 
      Math.floor((new Date() - latestCrimeDate) / (1000 * 60 * 60 * 24)) : null;
    
    const daysSinceLastPrediction = latestPredictionDate ? 
      Math.floor((new Date() - latestPredictionDate) / (1000 * 60 * 60 * 24)) : null;
    
    // Check data volume trends
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const crimesLast30Days = await Crime.countDocuments({
      createdAt: { $gte: last30Days }
    });
    
    const predictionsLast30Days = await Prediction.countDocuments({
      createdAt: { $gte: last30Days }
    });
    
    this.report.dataFreshness = {
      latestCrimeDate,
      latestPredictionDate,
      daysSinceLastCrime,
      daysSinceLastPrediction,
      crimesLast30Days,
      predictionsLast30Days,
      isDataFresh: daysSinceLastCrime ? daysSinceLastCrime <= CONFIG.DATA_FRESHNESS_THRESHOLD_DAYS : false
    };
  }

  /**
   * Check model status
   */
  async checkModelStatus() {
    console.log('🤖 Checking model status...');
    
    try {
      // Import the enhanced predictive service
      const { EnhancedPredictiveService } = require('../src/services/enhanced-predictive.service');
      const predictiveService = new EnhancedPredictiveService();
      
      // Get model performance
      const performance = await predictiveService.getModelPerformance();
      
      this.report.modelStatus = {
        ...performance,
        isModelHealthy: performance.neuralNetwork.isTrained && performance.hybrid.isActive
      };
      
    } catch (error) {
      this.report.modelStatus = {
        error: error.message,
        isModelHealthy: false
      };
    }
  }

  /**
   * Calculate overall data health score
   */
  calculateOverallHealth(completeness, missingData, totalCrimes) {
    const completenessScore = Object.values(completeness).reduce((sum, val) => sum + parseFloat(val), 0) / 5;
    const missingDataScore = Object.values(missingData).reduce((sum, val) => sum + val, 0) / totalCrimes * 100;
    
    const healthScore = Math.max(0, completenessScore - missingDataScore);
    
    if (healthScore >= 90) return 'Excellent';
    if (healthScore >= 80) return 'Good';
    if (healthScore >= 70) return 'Fair';
    if (healthScore >= 60) return 'Poor';
    return 'Critical';
  }

  /**
   * Generate recommendations based on findings
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Data quality recommendations
    if (this.report.dataQuality.overallHealth === 'Critical' || this.report.dataQuality.overallHealth === 'Poor') {
      recommendations.push({
        priority: 'High',
        category: 'Data Quality',
        message: 'Data quality is below acceptable levels. Review and clean data immediately.',
        action: 'Run data cleaning scripts and validate all records'
      });
    }
    
    // Data freshness recommendations
    if (!this.report.dataFreshness.isDataFresh) {
      recommendations.push({
        priority: 'Medium',
        category: 'Data Freshness',
        message: `Data is ${this.report.dataFreshness.daysSinceLastCrime} days old. Consider updating with new data.`,
        action: 'Import new crime data and retrain the model'
      });
    }
    
    // Model status recommendations
    if (!this.report.modelStatus.isModelHealthy) {
      recommendations.push({
        priority: 'High',
        category: 'Model Health',
        message: 'AI model is not functioning properly. Check training status.',
        action: 'Retrain the AI model and verify predictions'
      });
    }
    
    // Data volume recommendations
    if (this.report.dataQuality.totalCrimes < CONFIG.MIN_RECORDS_THRESHOLD) {
      recommendations.push({
        priority: 'Medium',
        category: 'Data Volume',
        message: `Only ${this.report.dataQuality.totalCrimes} crime records available. More data needed for accurate predictions.`,
        action: 'Import additional historical crime data'
      });
    }
    
    // Missing data recommendations
    Object.entries(this.report.dataQuality.missingData).forEach(([field, count]) => {
      if (count > 0) {
        recommendations.push({
          priority: 'Medium',
          category: 'Data Completeness',
          message: `${count} records missing ${field} field.`,
          action: `Review and fill missing ${field} data`
        });
      }
    });
    
    this.report.recommendations = recommendations;
  }

  /**
   * Display comprehensive report
   */
  displayReport() {
    console.log('\n📊 DATA HEALTH MONITORING REPORT');
    console.log('==================================');
    console.log(`Generated: ${this.report.timestamp.toISOString()}`);
    
    // Data Quality Section
    console.log('\n📈 DATA QUALITY');
    console.log('----------------');
    console.log(`Total Crimes: ${this.report.dataQuality.totalCrimes}`);
    console.log(`Total Barangays: ${this.report.dataQuality.totalBarangays}`);
    console.log(`Total Predictions: ${this.report.dataQuality.totalPredictions}`);
    console.log(`Overall Health: ${this.report.dataQuality.overallHealth}`);
    
    console.log('\nData Completeness:');
    Object.entries(this.report.dataQuality.completeness).forEach(([field, percentage]) => {
      console.log(`  ${field}: ${percentage}%`);
    });
    
    console.log('\nMissing Data:');
    Object.entries(this.report.dataQuality.missingData).forEach(([field, count]) => {
      if (count > 0) {
        console.log(`  ${field}: ${count} records`);
      }
    });
    
    // Data Freshness Section
    console.log('\n🕒 DATA FRESHNESS');
    console.log('------------------');
    console.log(`Latest Crime: ${this.report.dataFreshness.latestCrimeDate ? this.report.dataFreshness.latestCrimeDate.toISOString() : 'N/A'}`);
    console.log(`Latest Prediction: ${this.report.dataFreshness.latestPredictionDate ? this.report.dataFreshness.latestPredictionDate.toISOString() : 'N/A'}`);
    console.log(`Days Since Last Crime: ${this.report.dataFreshness.daysSinceLastCrime || 'N/A'}`);
    console.log(`Days Since Last Prediction: ${this.report.dataFreshness.daysSinceLastPrediction || 'N/A'}`);
    console.log(`Data Fresh: ${this.report.dataFreshness.isDataFresh ? '✅ Yes' : '❌ No'}`);
    console.log(`Crimes Last 30 Days: ${this.report.dataFreshness.crimesLast30Days}`);
    console.log(`Predictions Last 30 Days: ${this.report.dataFreshness.predictionsLast30Days}`);
    
    // Model Status Section
    console.log('\n🤖 MODEL STATUS');
    console.log('----------------');
    if (this.report.modelStatus.error) {
      console.log(`❌ Error: ${this.report.modelStatus.error}`);
    } else {
      console.log(`Neural Network Trained: ${this.report.modelStatus.neuralNetwork?.isTrained ? '✅ Yes' : '❌ No'}`);
      console.log(`Hybrid System Active: ${this.report.modelStatus.hybrid?.isActive ? '✅ Yes' : '❌ No'}`);
      console.log(`Model Healthy: ${this.report.modelStatus.isModelHealthy ? '✅ Yes' : '❌ No'}`);
    }
    
    // Recommendations Section
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-------------------');
    if (this.report.recommendations.length === 0) {
      console.log('✅ No issues found. System is healthy!');
    } else {
      this.report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.category}: ${rec.message}`);
        console.log(`   Action: ${rec.action}`);
      });
    }
    
    console.log('\n✅ Monitoring completed!');
  }
}

// Main execution
async function main() {
  const monitor = new DataHealthMonitor();
  await monitor.monitorDataHealth();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = DataHealthMonitor;
