import { Crime, Barangay, NewPrediction } from '../models';
import { EnhancedPredictiveService } from './enhanced-predictive.service';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export class DataManagementService {
  private predictiveService: EnhancedPredictiveService;

  constructor() {
    this.predictiveService = new EnhancedPredictiveService();
  }

  /**
   * Process uploaded Excel file (crime data or population data)
   */
  async processUploadedFile(file: Express.Multer.File): Promise<{
    totalRecords: number;
    newRecords: number;
    invalidRecords: number;
    duplicates: number;
    fileType: 'crime' | 'population';
  }> {
    try {
      console.log(`📊 Processing file: ${file.originalname}`);

      // Read Excel file
      if (!file.path) {
        throw new Error('File path is not available');
      }
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('No sheets found in Excel file');
      }
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        throw new Error('Worksheet not found in Excel file');
      }
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      console.log(`📋 Found ${rawData.length} records in Excel file`);

      // Detect file type based on content
      const fileType = this.detectFileType(rawData, file.originalname);
      console.log(`📁 Detected file type: ${fileType}`);

      let importResult: { newRecords: number };
      let cleanedData: any[];
      let uniqueData: any[];

      if (fileType === 'population') {
        // Process population data
        cleanedData = this.cleanAndValidatePopulationData(rawData);
        console.log(`✅ ${cleanedData.length} valid population records after cleaning`);
        
        uniqueData = await this.removeDuplicatePopulation(cleanedData);
        console.log(`🔄 ${uniqueData.length} unique population records after duplicate removal`);
        
        importResult = await this.importPopulationToDatabase(uniqueData);
      } else {
        // Process crime data
        cleanedData = this.cleanAndValidateData(rawData);
        console.log(`✅ ${cleanedData.length} valid crime records after cleaning`);

        uniqueData = await this.removeDuplicates(cleanedData);
        console.log(`🔄 ${uniqueData.length} unique crime records after duplicate removal`);

        importResult = await this.importToDatabase(uniqueData);
      }

      // Retrain AI model
      try {
        console.log('🤖 Retraining AI model with new data...');
        await this.predictiveService.initialize();
        await this.predictiveService.generateAllPredictions();
        console.log('✅ AI model retrained successfully');
      } catch (error) {
        console.error('⚠️ AI model retraining failed:', error);
      }

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      return {
        totalRecords: rawData.length,
        newRecords: importResult.newRecords,
        invalidRecords: rawData.length - cleanedData.length,
        duplicates: cleanedData.length - uniqueData.length,
        fileType
      };

    } catch (error) {
      // Clean up uploaded file on error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  /**
   * Detect file type based on content and filename
   */
  private detectFileType(rawData: any[], filename: string): 'crime' | 'population' {
    const lowerFilename = filename.toLowerCase();
    
    // Check filename for population indicators
    if (lowerFilename.includes('population') || lowerFilename.includes('lubao')) {
      return 'population';
    }
    
    // Check data structure for population indicators
    if (rawData.length > 0) {
      const firstRecord = rawData[0];
      const keys = Object.keys(firstRecord).map(k => k.toLowerCase());
      
      // Population files typically have 'Population' column
      if (keys.includes('population')) {
        return 'population';
      }
      
      // Crime files typically have crime-related columns
      if (keys.includes('crimetype') || keys.includes('confinementdate') || keys.includes('barangay')) {
        return 'crime';
      }
    }
    
    // Default to crime if uncertain
    return 'crime';
  }

  /**
   * Clean and validate population data
   */
  private cleanAndValidatePopulationData(rawData: any[]): any[] {
    const validData: any[] = [];

    for (const record of rawData) {
      const cleanedRecord = {
        name: record.Barangay || record.barangay || record.name ? 
          (record.Barangay || record.barangay || record.name).toString().toUpperCase().trim() : '',
        municipality: record.Municipality || record.municipality || 'LUBAO',
        province: record.Province || record.province || 'PAMPANGA',
        country: record.Country || record.country || 'PHILIPPINES',
        population: this.parsePopulation(record.Population || record.population),
        createdAt: new Date()
      };

      // Validate record
      if (this.validatePopulationRecord(cleanedRecord)) {
        validData.push(cleanedRecord);
      }
    }

    return validData;
  }

  /**
   * Parse population number
   */
  private parsePopulation(popValue: any): number | null {
    if (!popValue) return null;
    
    const num = Number(popValue);
    return isNaN(num) ? null : num;
  }

  /**
   * Validate population record
   */
  private validatePopulationRecord(record: any): boolean {
    // Check required fields
    if (!record.name || !record.population) {
      return false;
    }

    // Validate population is a positive number
    if (typeof record.population !== 'number' || record.population <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Remove duplicate population records
   */
  private async removeDuplicatePopulation(data: any[]): Promise<any[]> {
    const uniqueData: any[] = [];
    const seen = new Set<string>();

    for (const record of data) {
      const key = `${record.name}-${record.municipality}-${record.province}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueData.push(record);
      }
    }

    return uniqueData;
  }

  /**
   * Import population data to database
   */
  private async importPopulationToDatabase(data: any[]): Promise<{ newRecords: number }> {
    if (data.length === 0) {
      return { newRecords: 0 };
    }

    try {
      // Use upsert to update existing barangays or create new ones
      let newRecords = 0;
      
      for (const record of data) {
        const result = await Barangay.updateOne(
          { 
            name: record.name, 
            municipality: record.municipality, 
            province: record.province 
          },
          { 
            $setOnInsert: { 
              name: record.name, 
              municipality: record.municipality, 
              province: record.province, 
              country: record.country,
              createdAt: record.createdAt
            }, 
            $set: { 
              population: record.population,
              updatedAt: new Date()
            } 
          },
          { upsert: true }
        );
        
        if (result.upsertedCount > 0) {
          newRecords++;
        }
      }
      
      console.log(`💾 Imported/Updated ${newRecords} new population records`);
      return { newRecords };
      
    } catch (error: any) {
      throw new Error(`Population import failed: ${error.message}`);
    }
  }

  /**
   * Clean and validate data
   */
  private cleanAndValidateData(rawData: any[]): any[] {
    const validData: any[] = [];
    const validCrimeTypes = ['DRUGS', 'ROBBERY', 'THEFT', 'HOMICIDE', 'FRUSTRATED HOMICIDE', 'ASSAULT', 'BURGLARY'];

    for (const record of rawData) {
      const cleanedRecord = {
        barangay: record.barangay ? record.barangay.toString().toUpperCase().trim() : '',
        municipality: record.municipality ? record.municipality.toString().toUpperCase().trim() : '',
        province: record.province ? record.province.toString().toUpperCase().trim() : '',
        crimeType: record.crimeType ? record.crimeType.toString().toUpperCase().trim() : '',
        confinementDate: this.parseDate(record.confinementDate),
        createdAt: new Date()
      };

      // Validate record
      if (this.validateRecord(cleanedRecord, validCrimeTypes)) {
        validData.push(cleanedRecord);
      }
    }

    return validData;
  }

  /**
   * Parse date from various formats
   */
  private parseDate(dateValue: any): Date | null {
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
  private validateRecord(record: any, validCrimeTypes: string[]): boolean {
    // Check required fields
    if (!record.barangay || !record.municipality || !record.province || !record.crimeType || !record.confinementDate) {
      return false;
    }

    // Validate crime type
    if (!validCrimeTypes.includes(record.crimeType)) {
      return false;
    }

    // Validate date
    if (isNaN(record.confinementDate.getTime())) {
      return false;
    }

    // Validate date range (not too far in future or past)
    const now = new Date();
    const tenYearsAgo = new Date(now.getFullYear() - 10, 0, 1);
    const oneYearFromNow = new Date(now.getFullYear() + 1, 11, 31);

    if (record.confinementDate < tenYearsAgo || record.confinementDate > oneYearFromNow) {
      return false;
    }

    return true;
  }

  /**
   * Remove duplicate records
   */
  private async removeDuplicates(data: any[]): Promise<any[]> {
    const uniqueData: any[] = [];
    const seen = new Set<string>();

    for (const record of data) {
      const key = `${record.barangay}-${record.municipality}-${record.province}-${record.crimeType}-${record.confinementDate.toISOString()}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueData.push(record);
      }
    }

    return uniqueData;
  }

  /**
   * Import data to database
   */
  private async importToDatabase(data: any[]): Promise<{ newRecords: number }> {
    if (data.length === 0) {
      return { newRecords: 0 };
    }

    try {
      const result = await Crime.insertMany(data, { ordered: false });
      console.log(`💾 Imported ${result.length} new records`);
      return { newRecords: result.length };
    } catch (error: any) {
      if (error.code === 11000) {
        // Handle duplicate key errors
        console.log('⚠️ Some records already exist, continuing...');
        return { newRecords: 0 };
      }
      throw error;
    }
  }

  /**
   * Get system health information
   */
  async getSystemHealth(): Promise<any> {
    try {
      const totalCrimes = await Crime.countDocuments();
      const totalBarangays = await Barangay.countDocuments();
      const totalNewPredictions = await NewPrediction.countDocuments();

      // Get latest crime record
      const latestCrime = await Crime.findOne().sort({ createdAt: -1 });
      const lastUpdated = latestCrime ? latestCrime.createdAt : null;

      // Check for missing data
      const missingData = {
        missingBarangay: await Crime.countDocuments({ barangay: { $exists: false } }),
        missingCrimeType: await Crime.countDocuments({ type: { $exists: false } }),
        missingDate: await Crime.countDocuments({ confinementDate: { $exists: false } })
      };

      const totalMissing = Object.values(missingData).reduce((sum, val) => sum + val, 0);
      const dataCompleteness = totalCrimes > 0 ? ((totalCrimes - totalMissing) / totalCrimes * 100) : 100;

      // Calculate overall health
      let overallHealth = 'Excellent';
      if (dataCompleteness < 90) overallHealth = 'Good';
      if (dataCompleteness < 80) overallHealth = 'Fair';
      if (dataCompleteness < 70) overallHealth = 'Poor';
      if (dataCompleteness < 60) overallHealth = 'Critical';

      // Get model status
      let modelStatus = 'Unknown';
      let trainingStatus = 'Unknown';
      let confidenceLevel = 0;

      try {
        const performance = await this.predictiveService.getModelPerformance();
        modelStatus = performance.neuralNetwork.isTrained ? 'Trained' : 'Not Trained';
        trainingStatus = performance.neuralNetwork.isTrained ? 'Completed' : 'Not Started';
        confidenceLevel = Math.round(performance.neuralNetwork.confidence * 100);
      } catch (error) {
        modelStatus = 'Failed';
        trainingStatus = 'Failed';
      }

      return {
        totalCrimes,
        totalBarangays,
        totalNewPredictions,
        lastUpdated,
        overallHealth,
        dataCompleteness: Math.round(dataCompleteness),
        missingRecords: totalMissing,
        modelStatus,
        trainingStatus,
        confidenceLevel
      };

    } catch (error) {
      console.error('Error getting system health:', error);
      throw error;
    }
  }

  /**
   * Get data statistics
   */
  async getDataStatistics(): Promise<any> {
    try {
      const totalCrimes = await Crime.countDocuments();
      const totalBarangays = await Barangay.countDocuments();
      const totalNewPredictions = await NewPrediction.countDocuments();

      // Get date range
      const earliestCrime = await Crime.findOne().sort({ confinementDate: 1 });
      const latestCrime = await Crime.findOne().sort({ confinementDate: -1 });

      // Get crime type distribution
      const crimeTypeDistribution = await Crime.aggregate([
        { $group: { _id: '$crimeType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get top barangays
      const topBarangays = await Crime.aggregate([
        { $group: { _id: '$barangay', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      return {
        totalCrimes,
        totalBarangays,
        totalNewPredictions,
        dateRange: {
          earliest: earliestCrime ? earliestCrime.confinementDate : null,
          latest: latestCrime ? latestCrime.confinementDate : null
        },
        crimeTypeDistribution,
        topBarangays
      };

    } catch (error) {
      console.error('Error getting data statistics:', error);
      throw error;
    }
  }

  /**
   * Create data backup
   */
  async createBackup(): Promise<any> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(process.cwd(), 'backups');
      const backupPath = path.join(backupDir, `backup-${timestamp}`);

      // Create backup directory
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }

      // Backup collections
      const crimes = await Crime.find({});
      const barangays = await Barangay.find({});
      const predictions = await NewPrediction.find({});

      fs.writeFileSync(path.join(backupPath, 'crimes.json'), JSON.stringify(crimes, null, 2));
      fs.writeFileSync(path.join(backupPath, 'barangays.json'), JSON.stringify(barangays, null, 2));
      fs.writeFileSync(path.join(backupPath, 'predictions.json'), JSON.stringify(predictions, null, 2));

      // Create manifest
      const manifest = {
        timestamp,
        backupDate: new Date().toISOString(),
        collections: {
          crimes: crimes.length,
          barangays: barangays.length,
          predictions: predictions.length
        },
        totalRecords: crimes.length + barangays.length + predictions.length,
        backupPath,
        version: '1.0.0'
      };

      fs.writeFileSync(path.join(backupPath, 'manifest.json'), JSON.stringify(manifest, null, 2));

      return {
        backupPath,
        totalRecords: manifest.totalRecords,
        timestamp
      };

    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  /**
   * Get recent activity logs
   */
  async getRecentActivity(): Promise<any[]> {
    // This would typically come from a logging system
    // For now, we'll return some mock data
    return [
      {
        message: 'System initialized',
        timestamp: new Date(),
        type: 'system'
      },
      {
        message: 'Data health check completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        type: 'health'
      }
    ];
  }
}
