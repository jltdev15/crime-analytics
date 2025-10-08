import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DataManagementService } from '../services/data-management.service';

export class DataController {
  private dataService: DataManagementService;

  constructor() {
    this.dataService = new DataManagementService();
  }

  /**
   * Upload and import new crime data
   */
  uploadData = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }

      console.log(`📁 Processing uploaded file: ${req.file.originalname}`);

      // Process the uploaded file
      const result = await this.dataService.processUploadedFile(req.file);

      res.json({
        success: true,
        message: `Successfully imported ${result.newRecords} new ${result.fileType} records`,
        data: {
          totalRecords: result.totalRecords,
          newRecords: result.newRecords,
          invalidRecords: result.invalidRecords,
          duplicates: result.duplicates,
          fileType: result.fileType,
          fileProcessed: req.file.originalname
        }
      });

    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Upload processing failed'
      });
    }
  };

  /**
   * Get system health information
   */
  getSystemHealth = async (req: Request, res: Response): Promise<void> => {
    try {
      const health = await this.dataService.getSystemHealth();

      res.json({
        success: true,
        data: health
      });

    } catch (error: any) {
      console.error('❌ Health check failed:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Health check failed'
      });
    }
  };

  /**
   * Get data statistics
   */
  getDataStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.dataService.getDataStatistics();

      res.json({
        success: true,
        data: stats
      });

    } catch (error: any) {
      console.error('❌ Statistics failed:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Statistics retrieval failed'
      });
    }
  };

  /**
   * Backup data
   */
  backupData = async (req: Request, res: Response): Promise<void> => {
    try {
      const backupInfo = await this.dataService.createBackup();

      res.json({
        success: true,
        message: 'Backup created successfully',
        data: backupInfo
      });

    } catch (error: any) {
      console.error('❌ Backup failed:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Backup failed'
      });
    }
  };

  /**
   * Get recent activity logs
   */
  getRecentActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const activity = await this.dataService.getRecentActivity();

      res.json({
        success: true,
        data: activity
      });

    } catch (error: any) {
      console.error('❌ Activity retrieval failed:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Activity retrieval failed'
      });
    }
  };
}
