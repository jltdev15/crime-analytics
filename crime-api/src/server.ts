import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection
import connectDB from './config/database';

// Import models
import { User, Barangay, Crime, Prescription, AuditLog } from './models';

// Import routes
import descriptiveAnalyticsRoutes from './routes/analytics.descriptive';
import crimesRoutes from './routes/crimes.routes';
import barangaysRoutes from './routes/barangays.routes';
import predictiveRoutes from './routes/predictive.routes';
import dataRoutes from './routes/data.routes';
import dataImportRoutes from './routes/data-import.routes';

// Import middleware
import { errorHandler } from './middleware/error.middleware';

// Import types
import { ApiResponse } from './types';

const app = express();
const PORT: number = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Crime Analytics API is running!',
    data: {
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  };
  res.json(response);
});

// Health check route
app.get('/health', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'API is healthy',
    data: {
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  };
  res.json(response);
});

// API routes
app.use('/api/analytics/descriptive', descriptiveAnalyticsRoutes);
app.use('/api/crimes', crimesRoutes);
app.use('/api/barangays', barangaysRoutes);
app.use('/api/predict', predictiveRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/import', dataImportRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    message: 'Route not found',
    error: `Path ${req.originalUrl} not found `
  };
  res.status(404).json(response);
});

// Connect to database and start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Crime Analytics API server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
