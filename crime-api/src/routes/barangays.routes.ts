import { Router } from 'express';
import { BarangayController } from '../controllers/barangay.controller';
import { validateNumericParam } from '../middleware/validation.middleware';

const router = Router();
const barangayController = new BarangayController();

// Get all barangays with filtering and pagination
router.get('/', 
  validateNumericParam('page', 1),
  validateNumericParam('limit', 1, 100),
  barangayController.getBarangays 
);

// Search barangays
router.get('/search', barangayController.searchBarangays);

// Get barangays by municipality
router.get('/municipality/:municipality', barangayController.getBarangaysByMunicipality);

// Get barangays by province
router.get('/province/:province', barangayController.getBarangaysByProvince);

// Get barangay by ID
router.get('/:id', barangayController.getBarangayById);

// Create new barangay
router.post('/', barangayController.createBarangay);

// Update barangay
router.put('/:id', barangayController.updateBarangay);

// Delete barangay
router.delete('/:id', barangayController.deleteBarangay);

export default router;
