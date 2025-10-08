import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Get summary statistics
   */
  getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const summary = await this.analyticsService.getSummaryStats();
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get top barangays by crime count
   */
  getTopBarangaysByCrimeCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topBarangays = await this.analyticsService.getTopBarangaysByCrimeCount(limit);
      res.json(topBarangays);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get top barangays by crime rate
   */
  getTopBarangaysByCrimeRate = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topBarangays = await this.analyticsService.getTopBarangaysByCrimeRate(limit);
      res.json(topBarangays);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get crime distribution by barangay
   */
  getCrimeDistribution = async (req: Request, res: Response): Promise<void> => {
    try {
      const distribution = await this.analyticsService.getCrimeDistribution();
      res.json(distribution);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get crime type distribution
   */
  getCrimeTypeDistribution = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        barangay: req.query.barangay as string,
        municipality: req.query.municipality as string,
        province: req.query.province as string
      };
      const distribution = await this.analyticsService.getCrimeTypeDistribution(filters);
      res.json(distribution);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get barangay counts
   */
  getBarangayCounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const counts = await this.analyticsService.getBarangayCounts();
      res.json(counts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  /**
   * Get barangays with low crime rate
   */
  getLowCrimeRateBarangays = async (req: Request, res: Response): Promise<void> => {
    try {
      const threshold = Number(req.query.threshold) || 1;
      const lowRateBarangays = await this.analyticsService.getLowCrimeRateBarangays(threshold);
      res.json(lowRateBarangays);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}
