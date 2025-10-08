import { Router } from 'express';
import { DataImportController, upload } from '../controllers/data-import.controller';

const router = Router();
const dataImportController = new DataImportController();

// Data Import Endpoints
router.post('/crime-data', upload.single('file'), dataImportController.uploadCrimeData);
router.post('/population-data', upload.single('file'), dataImportController.uploadPopulationData);

// Template and History Endpoints
router.get('/templates', dataImportController.getImportTemplates);
router.get('/history', dataImportController.getImportHistory);

export default router;
