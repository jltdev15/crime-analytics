import { Request, Response } from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import Crime from '../models/Crime';
import Barangay from '../models/Barangay';
import { EnhancedPredictiveService } from '../services/enhanced-predictive.service';
import { DataManagementService } from '../services/data-management.service';
import ImportHistory from '../models/ImportHistory';
import mongoose from 'mongoose';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/json' // .json
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel (.xlsx, .xls), CSV, and JSON files are allowed.'));
    }
  }
});

export class DataImportController {
  private enhancedPredictiveService: EnhancedPredictiveService;
  private dataManagementService: DataManagementService;

  constructor() {
    this.enhancedPredictiveService = new EnhancedPredictiveService();
    this.dataManagementService = new DataManagementService();
  }

  /**
   * Upload and import crime data
   */
  public uploadCrimeData = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }

      const { file } = req;
      const { importType = 'append' } = req.body; // 'append' or 'replace'

      console.log(`📁 Processing ${file.originalname} (${file.size} bytes)`);

      // Parse the uploaded file
      let data = await this.parseUploadedFile(file);

      // Normalize header variations to canonical fields before validation
      data = this.normalizeCrimeData(data);
      
      if (!data || data.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No valid data found in the uploaded file'
        });
        return;
      }

      // Validate data structure
      const validationResult = this.validateCrimeData(data);
      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid data structure',
          details: validationResult.errors
        });
        return;
      }

      // Import data to database
      const importResult = await this.importCrimeData(data, importType);

      // Retrain AI model with new data
      let retrainResult = null;
      if (importResult.importedCount > 0) {
        console.log('🤖 Retraining AI model with new data...');
        try {
          await this.enhancedPredictiveService.initialize();
          await this.enhancedPredictiveService.generateAllPredictions();
          // Auto-generate prescriptive recommendations after predictions
          await this.enhancedPredictiveService.generateRecommendations();
          retrainResult = {
            success: true,
            message: 'AI model retrained and recommendations generated successfully'
          };
        } catch (retrainError) {
          console.error('❌ AI retraining failed:', retrainError);
          retrainResult = {
            success: false,
            message: 'AI retraining failed, but data was imported successfully'
          };
        }
      }

      // Record import history
      try {
        await ImportHistory.create({
          type: 'crime_data',
          filename: file.originalname,
          totalRows: importResult.totalRows,
          processedRows: importResult.processedRows,
          importedCount: importResult.importedCount,
          skippedCount: importResult.skippedCount,
          duplicatesSkipped: importResult.duplicatesSkipped,
          retrainedAI: !!(retrainResult && retrainResult.success)
        });
      } catch (_) {}

      // Optionally build a CSV of failed rows for download
      let failedCsv: string | undefined;
      try {
        const failed = (importResult.failedRows || []) as Array<any>;
        if (failed.length > 0) {
          const headers = ['row','reasons','type','confinementDate','barangay','municipality','province'];
          const lines = [headers.join(',')].concat(
            failed.map(r => headers.map(h => String(r[h] ?? '').replace(/,/g, ' ')).join(','))
          );
          failedCsv = lines.join('\n');
        }
      } catch (_) {}

      res.json({
        success: true,
        message: 'Data imported successfully',
        data: {
          ...importResult,
          aiRetraining: retrainResult,
          failedCsv
        }
      });

    } catch (error: any) {
      console.error('❌ Data import failed:', error);
      res.status(500).json({
        success: false,
        error: 'Data import failed',
        details: error.message
      });
    }
  };

  /**
   * Upload and import population data
   */
  public uploadPopulationData = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }

      const { file } = req;

      console.log(`📁 Processing population data: ${file.originalname}`);

      // Parse the uploaded file
      let data = await this.parseUploadedFile(file);

      // Normalize population headers (Barangay/Municipality/Province/Country/Population)
      data = this.normalizePopulationData(data);
      
      if (!data || data.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No valid data found in the uploaded file'
        });
        return;
      }

      // Validate population data structure (relaxed like CLI)
      const validationResult = this.validatePopulationData(data);
      if (!validationResult.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid population data structure',
          details: validationResult.errors
        });
        return;
      }

      // Import population data
      const importResult = await this.importPopulationData(data);

      // Record import history
      try {
        await ImportHistory.create({
          type: 'population_data',
          filename: file.originalname,
          totalRows: importResult.totalRows,
          upsertedCount: importResult.upsertedCount,
          modifiedCount: importResult.modifiedCount
        });
      } catch (_) {}

      res.json({
        success: true,
        message: 'Population data imported successfully',
        data: importResult
      });

    } catch (error: any) {
      console.error('❌ Population data import failed:', error);
      res.status(500).json({
        success: false,
        error: 'Population data import failed',
        details: error.message
      });
    }
  };

  /**
   * Get import templates
   */
  public getImportTemplates = async (req: Request, res: Response) => {
    try {
      const templates = {
        crimeData: {
          filename: 'crime_data_template.xlsx',
          description: 'Template for crime data import',
          requiredFields: [
            'type', 'status', 'gender', 'age', 'civilStatus',
            'confinementDate', 'confinementTime', 'barangay',
            'municipality', 'province', 'country'
          ],
          optionalFields: ['caseId', 'caseNumber'],
          sampleData: [
            {
              type: 'DRUGS',
              status: 'ONGOING',
              gender: 'MALE',
              age: 25,
              civilStatus: 'SINGLE',
              confinementDate: '2024-01-15',
              confinementTime: '14:30',
              barangay: 'SANTA CRUZ',
              municipality: 'LUBAO',
              province: 'PAMPANGA',
              country: 'PHILIPPINES'
            }
          ]
        },
        populationData: {
          filename: 'population_data_template.xlsx',
          description: 'Template for population data import',
          requiredFields: ['name', 'municipality', 'province', 'country', 'population'],
          sampleData: [
            {
              name: 'SANTA CRUZ',
              municipality: 'LUBAO',
              province: 'PAMPANGA',
              country: 'PHILIPPINES',
              population: 5000
            }
          ]
        }
      };

      res.json({
        success: true,
        data: templates
      });

    } catch (error: any) {
      console.error('❌ Failed to get templates:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get import templates',
        details: error.message
      });
    }
  };

  /**
   * Get data import history
   */
  public getImportHistory = async (req: Request, res: Response) => {
    try {
      const docs = await ImportHistory.find({}).sort({ importedAt: -1 }).limit(50).lean();
      const history = docs.map(d => ({
        id: String(d._id),
        type: d.type,
        filename: d.filename,
        importedCount: d.importedCount ?? ((d.upsertedCount || 0) + (d.modifiedCount || 0)),
        status: 'completed',
        importedAt: d.importedAt,
        retrainedAI: d.retrainedAI
      }));

      res.json({ success: true, data: history });

    } catch (error: any) {
      console.error('❌ Failed to get import history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get import history',
        details: error.message
      });
    }
  };

  /**
   * Parse uploaded file based on type
   */
  private async parseUploadedFile(file: Express.Multer.File): Promise<any[]> {
    const buffer = file.buffer;
    const filename = file.originalname.toLowerCase();

    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      return this.parseExcelFile(buffer);
    } else if (filename.endsWith('.csv')) {
      return this.parseCsvFile(buffer);
    } else if (filename.endsWith('.json')) {
      return this.parseJsonFile(buffer);
    } else {
      throw new Error('Unsupported file format');
    }
  }

  /**
   * Parse Excel file
   */
  private parseExcelFile(buffer: Buffer): any[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('No sheets found in Excel file');
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error('Worksheet not found');
    }
    return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  }

  /**
   * Parse CSV file
   */
  private parseCsvFile(buffer: Buffer): any[] {
    const csvContent = buffer.toString('utf-8');
    const lines = csvContent.split('\n');
    const headers = lines[0]?.split(',').map(h => h.trim()) || [];
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    }).filter(row => Object.values(row).some(value => value !== ''));
  }

  /**
   * Normalize common header variants to canonical crime fields
   */
  private normalizeCrimeData(rows: any[]): any[] {
    if (!Array.isArray(rows)) return [];

    const toUpperTrim = (v: any) => (v === null || v === undefined ? '' : String(v).trim());
    const toUpper = (v: any) => (v === null || v === undefined ? '' : String(v).trim().toUpperCase());

    const pickFirst = (obj: any, keys: string[]) => {
      for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== '') return obj[k];
      }
      return undefined;
    };

    const dateFrom = (value: any): string | undefined => {
      if (!value && value !== 0) return undefined;
      let date: Date | undefined;
      if (typeof value === 'number') {
        // Excel serial date: days since 1899-12-30
        const epoch = new Date(Date.UTC(1899, 11, 30));
        const ms = value * 24 * 60 * 60 * 1000;
        date = new Date(epoch.getTime() + ms);
      } else {
        const d = new Date(value);
        if (!isNaN(d.getTime())) date = d;
      }
      if (!date || isNaN(date.getTime())) return undefined;
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    return rows.map(raw => {
      const type = pickFirst(raw, ['type', 'Type', 'TYPE']);
      const status = pickFirst(raw, ['status', 'Status', 'STATUS']);
      const gender = pickFirst(raw, ['gender', 'Gender', 'GENDER']);
      const age = pickFirst(raw, ['age', 'Age', 'AGE']);
      const civilStatus = pickFirst(raw, ['civilStatus', 'Civil Status', 'CIVIL STATUS']);

      const dateRaw = pickFirst(raw, ['confinementDate', 'Confinement Date', 'Confinement', 'CONFINEMENT']);
      const timeRaw = pickFirst(raw, ['confinementTime', 'Time of Confinement', 'TIME OF CONFINEMENT']);

      const barangay = pickFirst(raw, ['barangay', 'Barangay', 'BARANGAY', 'Barangays', 'BARANGAYS']);
      const municipality = pickFirst(raw, ['municipality', 'Municipality', 'MUNICIPALITY', 'Municapality']);
      const province = pickFirst(raw, ['province', 'Province', 'PROVINCE']);
      const country = pickFirst(raw, ['country', 'Country', 'COUNTRY']);

      const caseId = pickFirst(raw, ['caseId', 'case id', 'CASE ID', 'Case ID']);
      const caseNumber = pickFirst(raw, ['caseNumber', 'Case Number', 'CASE NUMBER']);

      const normalized: any = {
        caseId: toUpperTrim(caseId),
        caseNumber: toUpperTrim(caseNumber),
        type: toUpper(type),
        status: toUpper(status),
        gender: toUpper(gender),
        age: age,
        civilStatus: toUpper(civilStatus),
        confinementDate: dateFrom(dateRaw),
        confinementTime: toUpperTrim(timeRaw),
        barangay: toUpper(barangay),
        municipality: toUpper(municipality),
        province: toUpper(province),
        country: toUpper(country) || 'PHILIPPINES'
      };

      return normalized;
    });
  }

  /**
   * Normalize population header variants and defaults like CLI script
   */
  private normalizePopulationData(rows: any[]): any[] {
    if (!Array.isArray(rows)) return [];

    const toUpper = (v: any) => (v === null || v === undefined ? '' : String(v).trim().toUpperCase());
    const toUpperTrim = (v: any) => (v === null || v === undefined ? '' : String(v).trim());
    const num = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 ? n : undefined;
    };

    const pickFirst = (obj: any, keys: string[]) => {
      for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== '') return obj[k];
      }
      return undefined;
    };

    return rows.map(raw => {
      const name = pickFirst(raw, ['name', 'barangay', 'Barangay', 'BARANGAY', 'Barangays', 'BARANGAYS']);
      const municipality = pickFirst(raw, ['municipality', 'Municipality', 'MUNICIPALITY']);
      const province = pickFirst(raw, ['province', 'Province', 'PROVINCE']);
      const country = pickFirst(raw, ['country', 'Country', 'COUNTRY']);
      const population = pickFirst(raw, ['population', 'Population', 'POPULATION']);

      return {
        name: toUpper(name),
        municipality: toUpper(municipality),
        province: toUpper(province),
        country: toUpper(country) || 'PHILIPPINES',
        population: num(population)
      };
    });
  }

  /**
   * Parse JSON file
   */
  private parseJsonFile(buffer: Buffer): any[] {
    const jsonContent = buffer.toString('utf-8');
    const data = JSON.parse(jsonContent);
    return Array.isArray(data) ? data : [data];
  }

  /**
   * Validate crime data structure
   */
  private validateCrimeData(data: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    // Align with CLI importer: do not require status; default will be applied
    const requiredFields = ['type', 'confinementDate', 'barangay', 'municipality', 'province'];

    if (data.length === 0) {
      errors.push('No data rows found');
      return { isValid: false, errors };
    }

    // Check first row for required fields
    const firstRow = data[0];
    const missingFields = requiredFields.filter(field => firstRow && !(field in firstRow));
    
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate data types and values
    data.forEach((row, index) => {
      if (!row.type || typeof row.type !== 'string') {
        errors.push(`Row ${index + 1}: Invalid or missing crime type`);
      }
      
      if (!row.confinementDate) {
        errors.push(`Row ${index + 1}: Missing confinement date`);
      } else {
        const date = new Date(row.confinementDate);
        if (isNaN(date.getTime())) {
          errors.push(`Row ${index + 1}: Invalid date format`);
        }
      }

      if (!row.barangay || typeof row.barangay !== 'string') {
        errors.push(`Row ${index + 1}: Invalid or missing barangay`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate population data structure
   */
  private validatePopulationData(data: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    // Relaxed: require only name and population; others will be defaulted or upserted like CLI
    const requiredFields = ['name', 'population'];

    if (data.length === 0) {
      errors.push('No data rows found');
      return { isValid: false, errors };
    }

    // Check first row for required fields
    const firstRow = data[0];
    const missingFields = requiredFields.filter(field => firstRow && !(field in firstRow));
    
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate data types and values (relaxed)
    data.forEach((row, index) => {
      if (!row.name || typeof row.name !== 'string') {
        errors.push(`Row ${index + 1}: Invalid or missing barangay name`);
      }

      if (row.population === undefined || isNaN(Number(row.population))) {
        errors.push(`Row ${index + 1}: Invalid or missing population number`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Import crime data to database
   */
  private async importCrimeData(data: any[], importType: string): Promise<any> {
    // Match CLI behavior: drop legacy unique indexes on crimes(caseNumber/caseId)
    try {
      const db = mongoose.connection && mongoose.connection.db ? mongoose.connection.db : null;
      if (!db) throw new Error('No DB connection');
      const coll = db.collection('crimes');
      const indexes = await coll.indexes();
      const dropPromises: Promise<any>[] = [];
      const cnIdx = indexes.find(i => i.key && (i.key as any).caseNumber === 1 && (i as any).unique);
      if (cnIdx && cnIdx.name) dropPromises.push(coll.dropIndex(cnIdx.name as string));
      const cidIdx = indexes.find(i => i.key && (i.key as any).caseId === 1 && (i as any).unique);
      if (cidIdx && cidIdx.name) dropPromises.push(coll.dropIndex(cidIdx.name as string));
      if (dropPromises.length) await Promise.allSettled(dropPromises);
    } catch (_) {}

    const processedData: any[] = [];
    const skippedDetails: Array<{ row: number; reasons: string[]; sample: any }> = [];

    data.forEach((row, index) => {
      const reasons: string[] = [];
      const type = row.type?.toString().toUpperCase().trim();
      const barangay = row.barangay?.toString().toUpperCase().trim();
      const municipality = row.municipality?.toString().toUpperCase().trim();
      const province = row.province?.toString().toUpperCase().trim();
      const date = new Date(row.confinementDate);

      if (!type) reasons.push('missing type');
      if (!row.confinementDate || isNaN(date.getTime())) reasons.push('invalid confinementDate');
      if (!barangay) reasons.push('missing barangay');
      if (!municipality) reasons.push('missing municipality');
      if (!province) reasons.push('missing province');

      if (reasons.length > 0) {
        skippedDetails.push({
          row: index + 1,
          reasons,
          sample: {
            type: row.type,
            confinementDate: row.confinementDate,
            barangay: row.barangay,
            municipality: row.municipality,
            province: row.province
          }
        });
        return;
      }

      processedData.push({
        caseId: row.caseId || undefined,
        caseNumber: row.caseNumber || undefined,
        type,
        status: row.status?.toString().toUpperCase().trim() || 'ONGOING',
        gender: row.gender?.toString().toUpperCase().trim() || 'MALE',
        age: parseInt(row.age) || 25,
        civilStatus: row.civilStatus?.toString().toUpperCase().trim() || 'SINGLE',
        confinementDate: date,
        confinementTime: row.confinementTime?.toString().trim() || '12:00',
        barangay,
        municipality,
        province,
        country: row.country?.toString().toUpperCase().trim() || 'PHILIPPINES'
      });
    });

    let importedCount = 0;
    let duplicateSkippedCount = 0;
    const duplicateSamples: Array<{ index?: number; code?: number; errmsg?: string }> = [];
    const duplicateDetails: Array<{ row: number; reasons: string[]; sample: any }> = [];
    if (importType === 'replace') {
      // Clear existing data and import new data
      await Crime.deleteMany({});
      try {
        const res: any = await Crime.collection.insertMany(processedData, { ordered: false });
        if (res && typeof res.insertedCount === 'number') {
          importedCount = res.insertedCount;
        } else {
          importedCount = Array.isArray(res) ? res.length : 0;
        }
      } catch (e: any) {
        // Handle bulk errors gracefully (duplicates, etc.)
        if (e && e.result && typeof e.result.getInsertedIds === 'function') {
          importedCount = e.result.getInsertedIds().length;
          const writeErrors = e.result?.result?.writeErrors || e.writeErrors || [];
          duplicateSkippedCount = Math.max(0, processedData.length - importedCount);
          writeErrors.slice(0, 200).forEach((we: any) => {
            duplicateSamples.push({ index: we.index, code: we.code, errmsg: we.errmsg });
            if (typeof we.index === 'number') {
              const p = processedData[we.index];
              if (p) {
                duplicateDetails.push({
                  row: we.index + 1,
                  reasons: ['duplicate'],
                  sample: {
                    type: p.type,
                    confinementDate: p.confinementDate,
                    barangay: p.barangay,
                    municipality: p.municipality,
                    province: p.province
                  }
                });
              }
            }
          });
        } else if (Array.isArray(e.insertedDocs)) {
          importedCount = e.insertedDocs.length;
          const writeErrors = e.writeErrors || [];
          duplicateSkippedCount = Math.max(0, processedData.length - importedCount);
          writeErrors.slice(0, 200).forEach((we: any) => {
            duplicateSamples.push({ index: we.index, code: we.code, errmsg: we.errmsg });
            if (typeof we.index === 'number') {
              const p = processedData[we.index];
              if (p) {
                duplicateDetails.push({
                  row: we.index + 1,
                  reasons: ['duplicate'],
                  sample: {
                    type: p.type,
                    confinementDate: p.confinementDate,
                    barangay: p.barangay,
                    municipality: p.municipality,
                    province: p.province
                  }
                });
              }
            }
          });
        } else {
          // If truly fatal, rethrow
          throw e;
        }
      }
    } else {
      // Append new data
      try {
        const res: any = await Crime.collection.insertMany(processedData, { ordered: false });
        if (res && typeof res.insertedCount === 'number') {
          importedCount = res.insertedCount;
        } else {
          importedCount = Array.isArray(res) ? res.length : 0;
        }
      } catch (e: any) {
        if (e && e.result && typeof e.result.getInsertedIds === 'function') {
          importedCount = e.result.getInsertedIds().length;
          const writeErrors = e.result?.result?.writeErrors || e.writeErrors || [];
          duplicateSkippedCount = Math.max(0, processedData.length - importedCount);
          writeErrors.slice(0, 20).forEach((we: any) => {
            duplicateSamples.push({ index: we.index, code: we.code, errmsg: we.errmsg });
          });
        } else if (Array.isArray(e.insertedDocs)) {
          importedCount = e.insertedDocs.length;
          const writeErrors = e.writeErrors || [];
          duplicateSkippedCount = Math.max(0, processedData.length - importedCount);
          writeErrors.slice(0, 20).forEach((we: any) => {
            duplicateSamples.push({ index: we.index, code: we.code, errmsg: we.errmsg });
          });
        } else {
          throw e;
        }
      }
    }

    return {
      totalRows: data.length,
      processedRows: processedData.length,
      importedCount,
      skippedCount: Math.max(0, data.length - importedCount),
      skippedDetails,
      duplicatesSkipped: duplicateSkippedCount,
      duplicateSamples,
      failedRows: [...skippedDetails, ...duplicateDetails].map(fr => ({
        row: fr.row,
        reasons: fr.reasons.join('; '),
        type: fr.sample?.type ?? '',
        confinementDate: fr.sample?.confinementDate ?? '',
        barangay: fr.sample?.barangay ?? '',
        municipality: fr.sample?.municipality ?? '',
        province: fr.sample?.province ?? ''
      }))
    };
  }

  /**
   * Import population data to database
   */
  private async importPopulationData(data: any[]): Promise<any> {
    const processedData = data.map(row => ({
      name: row.name?.toString().toUpperCase().trim(),
      // Default like CLI fallback when municipality/province are absent
      municipality: (row.municipality?.toString().toUpperCase().trim()) || 'LUBAO',
      province: (row.province?.toString().toUpperCase().trim()) || 'PAMPANGA',
      country: row.country?.toString().toUpperCase().trim() || 'PHILIPPINES',
      population: parseInt(row.population) || 0
    })).filter(row => row.name);

    // Use upsert to update existing or insert new
    const operations = processedData.map(row => ({
      updateOne: {
        filter: {
          name: row.name,
          municipality: row.municipality,
          province: row.province,
          country: row.country
        },
        update: { $set: row },
        upsert: true
      }
    }));

    const result = await Barangay.bulkWrite(operations, { ordered: false });

    return {
      totalRows: data.length,
      processedRows: processedData.length,
      upsertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount
    };
  }
}

// Export multer middleware for use in routes
export { upload };
