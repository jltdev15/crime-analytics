import { Request, Response } from 'express';
import { NewPrediction, Recommendation } from '../models';
import { PredictiveService } from '../services/predictive.service';
import { EnhancedPredictiveService } from '../services/enhanced-predictive.service';
import { asyncHandler, CustomError } from '../middleware/error.middleware';

export class PredictiveController {
  private predictiveService: PredictiveService;
  private enhancedPredictiveService: EnhancedPredictiveService;

  constructor() {
    this.predictiveService = new PredictiveService();
    this.enhancedPredictiveService = new EnhancedPredictiveService();
  }

  /**
   * Get 6-month incident forecast
   */
  getIncidentForecast = asyncHandler(async (req: Request, res: Response) => {
    const { barangay, municipality, province, crimeType, months = 6 } = req.query;

    if (!barangay || !municipality || !province || !crimeType) {
      throw new CustomError('Missing required parameters: barangay, municipality, province, crimeType', 400);
    }

    const forecast = await this.enhancedPredictiveService.generateForecast(
      barangay as string,
      municipality as string,
      province as string,
      crimeType as string,
      parseInt(months as string)
    );

    res.json({
      barangay,
      municipality,
      province,
      crimeType,
      forecast,
      generatedAt: new Date().toISOString()
    });
  });

  /**
   * Get risk probabilities and confidence levels
   */
  getRiskAssessment = asyncHandler(async (req: Request, res: Response) => {
    const { barangay, municipality, province, crimeType } = req.query;

    if (!barangay || !municipality || !province || !crimeType) {
      throw new CustomError('Missing required parameters: barangay, municipality, province, crimeType', 400);
    }

    const riskAssessment = await this.enhancedPredictiveService.assessRisk(
      barangay as string,
      municipality as string,
      province as string,
      crimeType as string
    );

    res.json({
      barangay,
      municipality,
      province,
      crimeType,
      ...riskAssessment,
      assessedAt: new Date().toISOString()
    });
  });

  /**
   * Get predictive analytics summary with KPIs
   */
  getPredictiveSummary = asyncHandler(async (req: Request, res: Response) => {
    const [
      totalPredictions,
      highRiskPredictions,
      mediumRiskPredictions,
      lowRiskPredictions,
      avgConfidenceTopLevel,
      avgConfidenceFromForecast,
      topRiskBarangays
    ] = await Promise.all([
      NewPrediction.countDocuments({}),
      NewPrediction.countDocuments({ riskLevel: 'High' }),
      NewPrediction.countDocuments({ riskLevel: 'Medium' }),
      NewPrediction.countDocuments({ riskLevel: 'Low' }),
      // Average of top-level confidence (legacy)
      NewPrediction.aggregate([
        { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
      ]),
      // Prefer average of forecast[].confidence when present
      NewPrediction.aggregate([
        { $unwind: { path: '$forecast', preserveNullAndEmptyArrays: true } },
        { $match: { 'forecast.confidence': { $type: 'number' } } },
        { $group: { _id: null, avgConfidence: { $avg: '$forecast.confidence' } } }
      ]),
      NewPrediction.find({ riskLevel: 'High' })
        .sort({ probability: -1 })
        .limit(5)
        .select('barangay municipality crimeType probability confidence')
    ]);

    // Prefer model performance confidence when available (represents AI accuracy)
    let modelConfidence = 0;
    try {
      const perf = await this.enhancedPredictiveService.getModelPerformance();
      modelConfidence = typeof perf?.neuralNetwork?.confidence === 'number' ? perf.neuralNetwork.confidence : 0;
    } catch (_) {}

    // Calculate predicted change percentage (simplified)
    const predictions = await NewPrediction.find({}).limit(100);
    const predictedChanges = predictions.map(p => {
      if (p.forecast.length >= 2) {
        const firstMonth = p.forecast[0]?.predicted || 0;
        const lastMonth = p.forecast[p.forecast.length - 1]?.predicted || 0;
        return ((lastMonth - firstMonth) / Math.max(1, firstMonth)) * 100;
      }
      return 0;
    });

    const avgPredictedChange = predictedChanges.length > 0 
      ? predictedChanges.reduce((a, b) => a + b, 0) / predictedChanges.length 
      : 0;

    res.json({
      totalPredictions,
      riskDistribution: {
        high: highRiskPredictions,
        medium: mediumRiskPredictions,
        low: lowRiskPredictions
      },
      // Show model confidence (accuracy) when available; else fall back to data-driven averages
      avgConfidence: modelConfidence || (avgConfidenceFromForecast && avgConfidenceFromForecast[0]?.avgConfidence) || (avgConfidenceTopLevel && avgConfidenceTopLevel[0]?.avgConfidence) || 0,
      avgPredictedChange: Math.round(avgPredictedChange * 100) / 100,
      topRiskBarangays: topRiskBarangays.map(p => ({
        barangay: p.barangay,
        municipality: p.municipality,
        crimeType: p.crimeType,
        riskProbability: Math.round(p.probability * 100),
        confidence: Math.round(p.confidence * 100)
      })),
      generatedAt: new Date().toISOString()
    });
  });

  /**
   * Get all predictions with filtering
   */
  getAllPredictions = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.barangay) filter.barangay = { $regex: req.query.barangay, $options: 'i' };
    if (req.query.municipality) filter.municipality = { $regex: req.query.municipality, $options: 'i' };
    if (req.query.province) filter.province = { $regex: req.query.province, $options: 'i' };
    if (req.query.crimeType) filter.crimeType = { $regex: req.query.crimeType, $options: 'i' };
    if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;

    const [predictions, total] = await Promise.all([
      NewPrediction.find(filter)
        .sort({ probability: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NewPrediction.countDocuments(filter)
    ]);

    res.json({
      predictions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  /**
   * Get recommendations
   */
  getRecommendations = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.barangay) filter.barangay = { $regex: req.query.barangay, $options: 'i' };
    if (req.query.municipality) filter.municipality = { $regex: req.query.municipality, $options: 'i' };
    if (req.query.province) filter.province = { $regex: req.query.province, $options: 'i' };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.status) filter.status = req.query.status;

    const [recommendations, total] = await Promise.all([
      Recommendation.find(filter)
        .sort({ priority: 1, confidence: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Recommendation.countDocuments(filter)
    ]);

    res.json({
      recommendations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  });

  /**
   * Get predictions with their recommendations grouped together
   */
  getPredictionsWithRecommendations = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Filter for predictions
    const predictionFilter: any = {};
    if (req.query.barangay) predictionFilter.barangay = { $regex: req.query.barangay, $options: 'i' };
    if (req.query.municipality) predictionFilter.municipality = { $regex: req.query.municipality, $options: 'i' };
    if (req.query.province) predictionFilter.province = { $regex: req.query.province, $options: 'i' };
    if (req.query.crimeType) predictionFilter.crimeType = { $regex: req.query.crimeType, $options: 'i' };
    if (req.query.riskLevel) predictionFilter.riskLevel = req.query.riskLevel;

    // Filter for recommendations
    const recommendationFilter: any = {};
    if (req.query.category) recommendationFilter.category = req.query.category;
    if (req.query.priority) recommendationFilter.priority = req.query.priority;
    if (req.query.status) recommendationFilter.status = req.query.status;

    // Get predictions
    const [predictions, totalPredictions] = await Promise.all([
      NewPrediction.find(predictionFilter)
        .sort({ probability: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NewPrediction.countDocuments(predictionFilter)
    ]);

    // Get all recommendations for these predictions
    const predictionIds = predictions.map(p => ({
      barangay: p.barangay,
      municipality: p.municipality,
      province: p.province,
      crimeType: p.crimeType
    }));

    const recommendations = await Recommendation.find({
      $or: predictionIds.map(id => ({
        barangay: id.barangay,
        municipality: id.municipality,
        province: id.province,
        crimeType: id.crimeType,
        ...recommendationFilter
      }))
    }).lean();

    // Group recommendations by prediction
    const groupedData = predictions.map(prediction => {
      const predictionRecommendations = recommendations.filter(rec => 
        rec.barangay === prediction.barangay &&
        rec.municipality === prediction.municipality &&
        rec.province === prediction.province &&
        rec.crimeType === prediction.crimeType
      );

      return {
        prediction,
        recommendations: predictionRecommendations
      };
    });

    res.json({
      predictions: groupedData,
      pagination: {
        page,
        limit,
        total: totalPredictions,
        pages: Math.ceil(totalPredictions / limit)
      }
    });
  });

  /**
   * Generate new predictions (admin endpoint)
   */
  generatePredictions = asyncHandler(async (req: Request, res: Response) => {
    await this.enhancedPredictiveService.generateAllPredictions();
    res.json({ 
      message: 'Enhanced predictions generated successfully',
      generatedAt: new Date().toISOString()
    });
  });

  /**
   * Generate new recommendations (admin endpoint)
   */
  generateRecommendations = asyncHandler(async (req: Request, res: Response) => {
    await this.enhancedPredictiveService.generateRecommendations();
    res.json({ 
      message: 'Enhanced recommendations generated successfully',
      generatedAt: new Date().toISOString()
    });
  });

  /**
   * Get model performance information
   */
  getModelPerformance = asyncHandler(async (req: Request, res: Response) => {
    const performance = await this.enhancedPredictiveService.getModelPerformance();
    res.json(performance);
  });

  /**
   * Test neural network training directly
   */
  testNeuralNetworkTraining = asyncHandler(async (req: Request, res: Response) => {
    try {
      console.log('🧪 Testing neural network training...');
      await this.enhancedPredictiveService.initialize();
      const performance = await this.enhancedPredictiveService.getModelPerformance();
      res.json({
        message: 'Neural network training test completed',
        performance,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Neural network training test failed:', error);
      res.status(500).json({
        message: 'Neural network training test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

  /**
   * Get prediction by ID
   */
  getPredictionById = asyncHandler(async (req: Request, res: Response) => {
    const prediction = await NewPrediction.findById(req.params.id);
    
    if (!prediction) {
      throw new CustomError('Prediction not found', 404);
    }

    res.json(prediction);
  });

  /**
   * Get recommendation by ID
   */
  getRecommendationById = asyncHandler(async (req: Request, res: Response) => {
    const recommendation = await Recommendation.findById(req.params.id);
    
    if (!recommendation) {
      throw new CustomError('Recommendation not found', 404);
    }

    res.json(recommendation);
  });

  /**
   * Update recommendation status
   */
  updateRecommendationStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, notes, assignedTo } = req.body;
    
    const recommendation = await Recommendation.findByIdAndUpdate(
      req.params.id,
      { status, notes, assignedTo },
      { new: true, runValidators: true }
    );

    if (!recommendation) {
      throw new CustomError('Recommendation not found', 404);
    }

    res.json(recommendation);
  });

  /**
   * Debug endpoint to test aggregation query
   */
  debugCombinations = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.enhancedPredictiveService.debugCombinations();
    res.json({
      success: true,
      message: 'Combinations debug completed',
      data: result
    });
  });

  /**
   * Test single prediction generation
   */
  testSinglePrediction = asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await this.enhancedPredictiveService.testSinglePrediction();
      res.json({
        success: true,
        message: 'Single prediction test completed',
        data: result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
        stack: error.stack
      });
    }
  });
}
