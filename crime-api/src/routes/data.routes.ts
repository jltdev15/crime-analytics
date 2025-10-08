import { Router } from 'express';
import { DataController } from '../controllers/data.controller';
import multer from 'multer';
import path from 'path';

const router = Router();
const dataController = new DataController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow Excel files
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        path.extname(file.originalname).toLowerCase() === '.xlsx' ||
        path.extname(file.originalname).toLowerCase() === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  }
});

// Data upload endpoint
router.post('/upload', upload.single('file'), dataController.uploadData);

// System health endpoint
router.get('/health', dataController.getSystemHealth);

// Data statistics endpoint
router.get('/statistics', dataController.getDataStatistics);

// Backup data endpoint
router.post('/backup', dataController.backupData);

// Recent activity endpoint
router.get('/activity', dataController.getRecentActivity);

export default router;
