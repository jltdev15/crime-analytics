import { Router } from 'express';
import { PredictiveController } from '../controllers/predictive.controller';
import { validateNumericParam } from '../middleware/validation.middleware';

const router = Router();
const predictiveController = new PredictiveController();

// Predictive Analytics Endpoints
router.get('/incidents', predictiveController.getIncidentForecast);
router.get('/risk', predictiveController.getRiskAssessment);
router.get('/summary', predictiveController.getPredictiveSummary);

// Predictions CRUD
router.get('/predictions', 
  validateNumericParam('page', 1),
  validateNumericParam('limit', 1, 100),
  predictiveController.getAllPredictions
);
router.get('/predictions/:id', predictiveController.getPredictionById);

// Recommendations CRUD
router.get('/recommendations', 
  validateNumericParam('page', 1),
  validateNumericParam('limit', 1, 100),
  predictiveController.getRecommendations
);
router.get('/recommendations/:id', predictiveController.getRecommendationById);
router.put('/recommendations/:id', predictiveController.updateRecommendationStatus);

// Optimized endpoint for grouped view
router.get('/predictions-with-recommendations', 
  validateNumericParam('page', 1),
  validateNumericParam('limit', 1, 100),
  predictiveController.getPredictionsWithRecommendations
);

// Admin endpoints for generating predictions and recommendations
router.post('/generate/predictions', predictiveController.generatePredictions);
router.post('/generate/recommendations', predictiveController.generateRecommendations);

// Model performance endpoint
router.get('/model/performance', predictiveController.getModelPerformance);

// Test neural network training
router.post('/test/training', predictiveController.testNeuralNetworkTraining);

// Debug endpoint
router.get('/debug/combinations', predictiveController.debugCombinations);

// Test single prediction
router.get('/test/single-prediction', predictiveController.testSinglePrediction);

export default router;
