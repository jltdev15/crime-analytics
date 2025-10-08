import { Router } from 'express';
import { CrimeController } from '../controllers/crime.controller';
import { validateNumericParam } from '../middleware/validation.middleware';

const router = Router();
const crimeController = new CrimeController();

// Get all crimes with filtering and pagination
router.get('/', crimeController.getCrimes);

// Get crime by ID
router.get('/:id', crimeController.getCrimeById);

// Create new crime
router.post('/', crimeController.createCrime);

// Update crime
router.put('/:id', crimeController.updateCrime);

// Delete crime
router.delete('/:id', crimeController.deleteCrime);

// Get crime statistics by date range
router.get('/stats/date-range', 
  validateNumericParam('page', 1),
  validateNumericParam('limit', 1, 100),
  crimeController.getCrimeStatsByDateRange
);

export default router;
