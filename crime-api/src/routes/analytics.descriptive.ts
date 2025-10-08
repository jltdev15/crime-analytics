import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();
const analyticsController = new AnalyticsController();

// Count barangays
router.get('/barangays/count', analyticsController.getBarangayCounts);

// Summary statistics
router.get('/summary', analyticsController.getSummary);

// Top barangays by crime count
router.get('/top/barangays/crime-count', analyticsController.getTopBarangaysByCrimeCount);

// Top barangays by crime rate
router.get('/top/barangays/crime-rate', analyticsController.getTopBarangaysByCrimeRate);

// Crime distribution by barangay
router.get('/distribution', analyticsController.getCrimeDistribution);

// Crime type distribution
router.get('/types/distribution', analyticsController.getCrimeTypeDistribution);

// Low crime rate barangays
router.get('/low/barangays/crime-rate', analyticsController.getLowCrimeRateBarangays);

export default router;


