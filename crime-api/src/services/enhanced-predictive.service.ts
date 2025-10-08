import { Crime, Barangay, NewPrediction, Recommendation } from '../models';
import { addMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import * as ss from 'simple-statistics';
import { NeuralNetworkService } from './neural-network.service';

export interface TimeSeriesData {
  date: Date;
  count: number;
}

export interface ForecastResult {
  month: string;
  predicted: number;
  lower: number;
  upper: number;
  confidence: number;
  method: 'neural-network' | 'statistical';
}

export interface RiskAssessment {
  riskLevel: 'Low' | 'Medium' | 'High';
  probability: number;
  factors: {
    historicalTrend: number;
    seasonalPattern: number;
    populationDensity: number;
    recentActivity: number;
  };
}

export class EnhancedPredictiveService {
  private neuralNetworkService: NeuralNetworkService;
  private useNeuralNetwork: boolean = true;

  constructor() {
    this.neuralNetworkService = new NeuralNetworkService();
  }

  /**
   * Initialize and train the neural network
   */
  async initialize(): Promise<void> {
    if (this.useNeuralNetwork) {
      try {
        console.log('🧠 Starting neural network training...');
        const result = await this.neuralNetworkService.trainModel();
        console.log('✅ Neural network initialized successfully');
        console.log(`📊 Training result: ${JSON.stringify(result)}`);
      } catch (error) {
        console.error('❌ Neural network initialization failed, falling back to statistical methods:', error);
        this.useNeuralNetwork = false;
      }
    }
  }

  /**
   * Generate enhanced forecast using neural network or statistical methods
   */
  async generateForecast(
    barangay: string,
    municipality: string,
    province: string,
    crimeType: string,
    months: number = 6
  ): Promise<ForecastResult[]> {
    try {
      if (this.useNeuralNetwork) {
        // Try neural network first
        const nnForecast = await this.neuralNetworkService.generateForecast(
          barangay, municipality, province, crimeType, months
        );
        
        // Validate neural network output and keep variation minimal for stability
        const validForecast = nnForecast.map((f, index) => {
          let predicted = isNaN(f.predicted) || !isFinite(f.predicted) ? 3 : f.predicted;
          const confidence = isNaN(f.confidence) || !isFinite(f.confidence) ? 0.5 : f.confidence;
          
          // Minimal seasonal smoothing only
          if (index > 0) {
            const additionalVariation = Math.sin((index * Math.PI) / 3) * 0.05;
            predicted = Math.max(1, Math.round(predicted * (1 + additionalVariation)));
          }
          
          return {
            month: f.month,
            predicted: Math.max(0, Math.round(predicted)),
            lower: Math.max(0, Math.round(predicted * 0.8)),
            upper: Math.round(predicted * 1.2),
            confidence: Math.min(1, Math.max(0, confidence)),
            method: 'neural-network' as const
          };
        });
        
        return validForecast;
      }
    } catch (error) {
      console.error('Neural network forecast failed, using statistical method:', error);
    }

    // Fallback to statistical method
    console.log('⚠️ Neural network not trained. Using statistical fallback.');
    const statisticalForecast = await this.generateStatisticalForecast(barangay, municipality, province, crimeType, months);
    
    // Ensure statistical forecast has method field
    return statisticalForecast.map((f: any) => ({
      ...f,
      method: 'statistical' as const
    }));
  }

  /**
   * Statistical forecasting method (original implementation)
   */
  private async generateStatisticalForecast(
    barangay: string,
    municipality: string,
    province: string,
    crimeType: string,
    months: number
  ): Promise<ForecastResult[]> {
    const historicalData = await this.getHistoricalData(barangay, municipality, province, crimeType);
    
    if (historicalData.length < 3) {
      // Use actual crime count as base value for more realistic forecasts
      const baseValue = Math.max(1, Math.min(10, historicalData.length));
      return this.generateDefaultForecast(months, baseValue);
    }

    const timeSeries = this.prepareTimeSeries(historicalData);
    const forecast = this.linearRegressionForecast(timeSeries, months);
    
    return forecast.map(f => ({
      ...f,
      confidence: 0.8,
      method: 'statistical' as const
    }));
  }

  /**
   * Enhanced risk assessment with neural network insights
   */
  async assessRisk(
    barangay: string,
    municipality: string,
    province: string,
    crimeType: string
  ): Promise<RiskAssessment> {
    const [historicalData, population] = await Promise.all([
      this.getHistoricalData(barangay, municipality, province, crimeType),
      this.getPopulation(barangay, municipality, province)
    ]);

    // Calculate traditional risk factors
    const historicalTrend = this.calculateHistoricalTrend(historicalData);
    const seasonalPattern = this.calculateSeasonalPattern(historicalData);
    const populationDensity = this.calculatePopulationDensity(population);
    const recentActivity = this.calculateRecentActivity(historicalData);

    // Enhanced risk calculation with neural network insights
    let enhancedProbability = this.calculateRiskProbability({
      historicalTrend,
      seasonalPattern,
      populationDensity,
      recentActivity
    });

    // If neural network is available, enhance the probability calculation
    if (this.useNeuralNetwork) {
      try {
        const nnForecast = await this.neuralNetworkService.generateForecast(
          barangay, municipality, province, crimeType, 1
        );
        
        if (nnForecast.length > 0) {
          // Use neural network confidence to adjust risk probability
          const nnConfidence = nnForecast[0]?.confidence || 0;
          const nnPrediction = nnForecast[0]?.predicted || 0;
          
          // If neural network predicts high crime and has high confidence, increase risk
          if (nnPrediction > 10 && nnConfidence > 0.7) {
            enhancedProbability = Math.min(1, enhancedProbability * 1.2);
          }
        }
      } catch (error) {
        console.error('Neural network risk assessment failed:', error);
      }
    }

    const riskLevel = this.determineRiskLevel(enhancedProbability);

    return {
      riskLevel,
      probability: enhancedProbability,
      factors: {
        historicalTrend,
        seasonalPattern,
        populationDensity,
        recentActivity
      }
    };
  }

  /**
   * Generate all predictions with enhanced methods
   */
  async generateAllPredictions(): Promise<void> {
    console.log('🚀 Generating enhanced predictions...');
    
    // Clear existing predictions first
    await NewPrediction.deleteMany({});
    console.log('🗑️ Cleared existing predictions');
    
    // Initialize neural network if not already done
    if (this.useNeuralNetwork) {
      await this.initialize();
    }

    const combinations = await Crime.aggregate([
      {
        $group: {
          _id: {
            barangay: '$barangay',
            municipality: '$municipality',
            province: '$province',
            country: '$country',
            crimeType: '$type'
          },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gte: 2 } // Only combinations with at least 2 records
        }
      }
    ]);

    console.log(`📊 Found ${combinations.length} combinations with sufficient data`);
    console.log('Sample combinations:', combinations.slice(0, 3));

    let successCount = 0;
    let neuralNetworkCount = 0;
    let processedCount = 0;

    for (const combo of combinations) {
      const { barangay, municipality, province, country, crimeType } = combo._id;
      processedCount++;
      
      try {
        const forecast = await this.generateForecast(barangay, municipality, province, crimeType);
        const riskAssessment = await this.assessRisk(barangay, municipality, province, crimeType);
        // Set top-level confidence as the average of forecast confidences when available
        const avgForecastConfidence = forecast && forecast.length > 0
          ? (forecast.map(f => Number(f.confidence) || 0).reduce((a, b) => a + b, 0) / forecast.length)
          : this.calculateConfidence(barangay, municipality, province, crimeType);
        
        // Count neural network usage
        if (forecast.length > 0 && forecast[0]?.method === 'neural-network') {
          neuralNetworkCount++;
        }

        await NewPrediction.create({
          barangay,
          municipality,
          province,
          country,
          crimeType,
          forecast: forecast.map(f => ({
            month: f.month,
            predicted: f.predicted,
            lower: f.lower,
            upper: f.upper,
            confidence: f.confidence,
            method: f.method
          })),
          riskLevel: riskAssessment.riskLevel,
          probability: riskAssessment.probability,
          confidence: avgForecastConfidence,
          factors: riskAssessment.factors
        });
        
        successCount++;
      } catch (error: any) {
        console.error(`❌ Error generating prediction for ${barangay} - ${crimeType}:`, error?.message || 'Unknown error');
      }
    }

    console.log(`✅ Enhanced predictions generated: ${successCount} total, ${neuralNetworkCount} using neural network`);
    console.log(`📊 Processed ${processedCount} combinations, ${successCount} successful, ${processedCount - successCount} failed`);
  }

  /**
   * Debug method to test aggregation query
   */
  async debugCombinations(): Promise<any> {
    try {
      console.log('🔍 Debugging combinations query...');
      
      // Test the aggregation query
      const combinations = await Crime.aggregate([
        {
          $group: {
            _id: {
              barangay: '$barangay',
              municipality: '$municipality',
              province: '$province',
              country: '$country',
              crimeType: '$type'
            },
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            count: { $gte: 2 } // Only combinations with at least 2 records
          }
        }
      ]);

      console.log(`📊 Found ${combinations.length} combinations with sufficient data`);
      
      // Also get total combinations without filter
      const allCombinations = await Crime.aggregate([
        {
          $group: {
            _id: {
              barangay: '$barangay',
              municipality: '$municipality',
              province: '$province',
              country: '$country',
              crimeType: '$type'
            },
            count: { $sum: 1 }
          }
        }
      ]);

      console.log(`📊 Total combinations: ${allCombinations.length}`);

      return {
        totalCombinations: allCombinations.length,
        filteredCombinations: combinations.length,
        sampleCombinations: combinations.slice(0, 5),
        allCombinationsSample: allCombinations.slice(0, 5)
      };
    } catch (error: any) {
      console.error('❌ Error in debugCombinations:', error);
      throw error;
    }
  }

  /**
   * Test single prediction generation
   */
  async testSinglePrediction(): Promise<any> {
    try {
      console.log('🧪 Testing single prediction generation...');
      
      // Get one combination with sufficient data
      const combinations = await Crime.aggregate([
        {
          $group: {
            _id: {
              barangay: '$barangay',
              municipality: '$municipality',
              province: '$province',
              country: '$country',
              crimeType: '$type'
            },
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            count: { $gte: 2 }
          }
        },
        {
          $limit: 1
        }
      ]);

      if (combinations.length === 0) {
        throw new Error('No combinations found with sufficient data');
      }

      const combo = combinations[0];
      const { barangay, municipality, province, country, crimeType } = combo._id;
      
      console.log(`🧪 Testing with: ${barangay} - ${crimeType}`);
      
      // Test each step
      const forecast = await this.generateForecast(barangay, municipality, province, crimeType);
      console.log('✅ Forecast generated:', forecast.length, 'months');
      
      const riskAssessment = await this.assessRisk(barangay, municipality, province, crimeType);
      console.log('✅ Risk assessment generated:', riskAssessment.riskLevel, riskAssessment.probability);
      
      const confidence = this.calculateConfidence(barangay, municipality, province, crimeType);
      console.log('✅ Confidence calculated:', confidence);
      
      // Test database creation
      const predictionData = {
        barangay,
        municipality,
        province,
        country,
        crimeType,
        forecast: forecast.map(f => ({
          month: f.month,
          predicted: f.predicted,
          lower: f.lower,
          upper: f.upper
        })),
        riskLevel: riskAssessment.riskLevel,
        probability: riskAssessment.probability,
        confidence,
        factors: riskAssessment.factors
      };
      
      console.log('🧪 Attempting to create prediction in database...');
      const createdPrediction = await NewPrediction.create(predictionData);
      console.log('✅ Prediction created successfully:', createdPrediction._id);
      
      return {
        success: true,
        predictionId: createdPrediction._id,
        barangay,
        crimeType,
        riskLevel: riskAssessment.riskLevel,
        probability: riskAssessment.probability,
        forecastMonths: forecast.length
      };
    } catch (error: any) {
      console.error('❌ Error in testSinglePrediction:', error);
      throw error;
    }
  }

  /**
   * Get model performance summary
   */
  async getModelPerformance(): Promise<any> {
    const neuralNetworkInfo = this.neuralNetworkService.getModelInfo();
    
    return {
      neuralNetwork: {
        enabled: this.useNeuralNetwork,
        ...neuralNetworkInfo
      },
      statistical: {
        enabled: true,
        method: 'Linear Regression with Seasonal Adjustment',
        library: 'simple-statistics'
      },
      hybrid: {
        enabled: true,
        description: 'Neural network with statistical fallback'
      }
    };
  }

  // Private helper methods (same as original implementation)
  private async getHistoricalData(
    barangay: string,
    municipality: string,
    province: string,
    crimeType: string
  ): Promise<any[]> {
    return await Crime.find({
      barangay,
      municipality,
      province,
      type: crimeType
    }).sort({ confinementDate: 1 });
  }

  private async getPopulation(
    barangay: string,
    municipality: string,
    province: string
  ): Promise<number> {
    const barangayData = await Barangay.findOne({
      name: barangay,
      municipality,
      province
    });
    return barangayData?.population || 1000;
  }

  private prepareTimeSeries(historicalData: any[]): TimeSeriesData[] {
    const monthlyData = new Map<string, number>();
    
    historicalData.forEach(crime => {
      // Use the correct field name from the updated model
      const date = crime.confinementDate;
      if (!date || isNaN(new Date(date).getTime())) {
        console.warn('Invalid date found in crime data:', date);
        return; // Skip invalid dates
      }
      
      try {
        const monthKey = format(startOfMonth(new Date(date)), 'yyyy-MM');
        monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + 1);
      } catch (error) {
        console.warn('Error processing date:', date, error);
        return; // Skip problematic dates
      }
    });

    return Array.from(monthlyData.entries()).map(([dateStr, count]) => ({
      date: new Date(dateStr + '-01'),
      count
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private linearRegressionForecast(timeSeries: TimeSeriesData[], months: number): ForecastResult[] {
    if (timeSeries.length < 2) {
      // Use average of time series data as base value
      const avgValue = timeSeries.length > 0 ? Math.round(ss.mean(timeSeries.map(t => t.count))) : 3;
      return this.generateDefaultForecast(months, Math.max(1, avgValue));
    }

    const xValues = timeSeries.map((_, index) => index);
    const yValues = timeSeries.map(point => point.count);

    // Validate data points
    const validDataPoints = xValues.map((x, i) => [x, yValues[i]] as [number, number])
      .filter(([x, y]) => !isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y));
    
    if (validDataPoints.length < 2) {
      return this.generateDefaultForecast(months, 3);
    }

    const regression = ss.linearRegression(validDataPoints);
    const rSquared = ss.rSquared(validDataPoints, (x: number) => (regression.m || 0) * x + (regression.b || 0));

    const forecast: ForecastResult[] = [];
    const lastDate = timeSeries[timeSeries.length - 1]?.date || new Date();
    const lastIndex = timeSeries.length - 1;

    for (let i = 1; i <= months; i++) {
      const futureIndex = lastIndex + i;
      let predicted = (regression.m || 0) * futureIndex + (regression.b || 0);
      
      // Add seasonal variation to make it more realistic
      const monthOfYear = addMonths(lastDate, i).getMonth();
      const seasonalVariation = Math.sin((monthOfYear / 12) * 2 * Math.PI) * 0.2;
      predicted = predicted * (1 + seasonalVariation);
      
      // Ensure predicted value is valid
      const validPredicted = isNaN(predicted) || !isFinite(predicted) ? 3 : Math.max(0, Math.round(predicted));
      
      const stdError = Math.sqrt(ss.sampleVariance(yValues)) * (1 - rSquared);
      const margin = isNaN(stdError) || !isFinite(stdError) ? 2 : stdError * 1.96;
      
      const forecastDate = addMonths(lastDate, i);
      
      forecast.push({
        month: format(forecastDate, 'yyyy-MM'),
        predicted: validPredicted,
        lower: Math.max(0, Math.round(validPredicted - margin)),
        upper: Math.round(validPredicted + margin),
        confidence: 0.8,
        method: 'statistical'
      });
    }

    return forecast;
  }

  private generateDefaultForecast(months: number, baseValue: number = 3): ForecastResult[] {
    const forecast: ForecastResult[] = [];
    const startDate = new Date();
    
    // Ensure baseValue is a valid number
    const validBaseValue = isNaN(baseValue) || baseValue <= 0 ? 3 : Math.max(1, baseValue);
    
    // Create a more realistic trend with seasonal patterns
    const trend = 0.1; // Slight upward trend
    const seasonalAmplitude = 0.4; // Seasonal variation amplitude
    
    for (let i = 1; i <= months; i++) {
      const forecastDate = addMonths(startDate, i);
      
      // Create more realistic variations
      const monthOfYear = forecastDate.getMonth(); // 0-11
      const seasonalVariation = Math.sin((monthOfYear / 12) * 2 * Math.PI) * seasonalAmplitude;
      const trendVariation = trend * i; // Gradual trend over time
      const randomVariation = (Math.random() - 0.5) * 0.3; // Reduced random variation
      
      // Combine all variations
      const totalVariation = seasonalVariation + trendVariation + randomVariation;
      const predicted = Math.max(1, Math.round(validBaseValue * (1 + totalVariation)));
      
      // Ensure all values are valid numbers
      const validPredicted = isNaN(predicted) ? 3 : predicted;
      const validLower = Math.max(0, validPredicted - Math.max(1, Math.round(validPredicted * 0.3)));
      const validUpper = validPredicted + Math.max(1, Math.round(validPredicted * 0.4));
      
      forecast.push({
        month: format(forecastDate, 'yyyy-MM'),
        predicted: validPredicted,
        lower: validLower,
        upper: validUpper,
        confidence: 0.6,
        method: 'statistical'
      });
    }

    return forecast;
  }

  private calculateHistoricalTrend(historicalData: any[]): number {
    if (historicalData.length < 2) return 0;
    
    const monthlyCounts = this.prepareTimeSeries(historicalData);
    if (monthlyCounts.length < 2) return 0;
    
    const firstHalf = monthlyCounts.slice(0, Math.floor(monthlyCounts.length / 2));
    const secondHalf = monthlyCounts.slice(Math.floor(monthlyCounts.length / 2));
    
    const firstAvg = ss.mean(firstHalf.map(p => p.count));
    const secondAvg = ss.mean(secondHalf.map(p => p.count));
    
    return (secondAvg - firstAvg) / firstAvg;
  }

  private calculateSeasonalPattern(historicalData: any[]): number {
    if (historicalData.length < 12) return 0;
    
    const monthlyCounts = this.prepareTimeSeries(historicalData);
    if (monthlyCounts.length === 0) return 0; // No valid time series data
    
    const monthlyAverages = new Array(12).fill(0);
    const monthlyCounts_array = new Array(12).fill(0);
    
    monthlyCounts.forEach(point => {
      const month = point.date.getMonth();
      monthlyAverages[month] += point.count;
      monthlyCounts_array[month]++;
    });
    
    for (let i = 0; i < 12; i++) {
      if (monthlyCounts_array[i] > 0) {
        monthlyAverages[i] /= monthlyCounts_array[i];
      }
    }
    
    const validAverages = monthlyAverages.filter(avg => avg > 0);
    if (validAverages.length === 0) return 0; // No valid averages
    
    const overallAvg = ss.mean(validAverages);
    const variance = ss.sampleVariance(validAverages);
    
    return Math.sqrt(variance) / overallAvg;
  }

  private calculatePopulationDensity(population: number): number {
    const area = 2; // square kilometers
    const density = population / area;
    return Math.min(1, density / 10000);
  }

  private calculateRecentActivity(historicalData: any[]): number {
    if (historicalData.length === 0) return 0;
    
    const now = new Date();
    const threeMonthsAgo = addMonths(now, -3);
    
    const recentCrimes = historicalData.filter(crime => {
      const date = crime.confinementDate;
      return date && new Date(date) >= threeMonthsAgo;
    });
    
    const olderCrimes = historicalData.filter(crime => {
      const date = crime.confinementDate;
      return date && new Date(date) < threeMonthsAgo;
    });
    
    if (olderCrimes.length === 0) return recentCrimes.length / 10;
    
    const recentRate = recentCrimes.length / 3;
    const firstOlderCrimeDate = olderCrimes[0] ? olderCrimes[0].confinementDate : null;
    const historicalRate = olderCrimes.length / Math.max(1, firstOlderCrimeDate ? (now.getTime() - new Date(firstOlderCrimeDate).getTime()) / (1000 * 60 * 60 * 24 * 30) : 1);
    
    return recentRate / Math.max(1, historicalRate);
  }

  private calculateRiskProbability(factors: {
    historicalTrend: number;
    seasonalPattern: number;
    populationDensity: number;
    recentActivity: number;
  }): number {
    // Add some randomness and variation to create more diverse risk levels
    const baseProbability = 0.5; // Base probability
    
    // Calculate weighted factors
    const weights = {
      historicalTrend: 0.25,
      seasonalPattern: 0.15,
      populationDensity: 0.3,
      recentActivity: 0.3
    };
    
    const weightedSum = 
      factors.historicalTrend * weights.historicalTrend +
      factors.seasonalPattern * weights.seasonalPattern +
      factors.populationDensity * weights.populationDensity +
      factors.recentActivity * weights.recentActivity;
    
    // Add some variation based on population density and recent activity
    const variation = (factors.populationDensity - 0.5) * 0.3 + (factors.recentActivity - 0.5) * 0.2;
    
    // Calculate final probability with more variation
    const finalProbability = baseProbability + weightedSum * 0.3 + variation;
    
    return Math.max(0.1, Math.min(0.9, finalProbability));
  }

  private determineRiskLevel(probability: number): 'Low' | 'Medium' | 'High' {
    if (probability < 0.3) return 'Low';
    if (probability < 0.7) return 'Medium';
    return 'High';
  }

  private calculateConfidence(
    barangay: string,
    municipality: string,
    province: string,
    crimeType: string
  ): number {
    return 0.8;
  }

  /**
   * Generate recommendations (same as original)
   */
  async generateRecommendations(): Promise<void> {
    console.log('🚀 Generating enhanced recommendations...');
    
    // Clear all existing recommendations first to avoid stale data
    await Recommendation.deleteMany({});
    console.log('🗑️ Cleared existing recommendations');
    
    const predictions = await NewPrediction.find({ riskLevel: { $in: ['Medium', 'High'] } });
    console.log(`📊 Found ${predictions.length} predictions to generate recommendations for`);
    
    let totalRecommendations = 0;
    
    for (const prediction of predictions) {
      const recommendations = this.createRecommendations(prediction);
      
      for (const rec of recommendations) {
        await Recommendation.create({
          ...rec,
          barangay: prediction.barangay,
          municipality: prediction.municipality,
          province: prediction.province,
          country: prediction.country,
          crimeType: prediction.crimeType,
          status: 'pending' // Set default status
        });
        totalRecommendations++;
      }
    }
    
    console.log(`✅ Generated ${totalRecommendations} recommendations for ${predictions.length} predictions`);
  }

  private createRecommendations(prediction: any): any[] {
    const recommendations = [];
    
    if (prediction.riskLevel === 'High') {
      recommendations.push({
        category: 'patrol',
        priority: 'High',
        title: 'Increase Patrol Frequency',
        description: 'Deploy additional police patrols during peak hours',
        rationale: `High risk prediction (${(prediction.probability * 100).toFixed(1)}%) for ${prediction.crimeType} in ${prediction.barangay}`,
        expectedImpact: 'Reduce crime incidents by 20-30%',
        implementationCost: 'Medium',
        timeframe: 'Immediate',
        successMetrics: ['Reduction in reported incidents', 'Response time improvement'],
        riskFactors: ['Resource constraints', 'Community resistance'],
        confidence: prediction.confidence
      });
    }
    
    // Generate community awareness for Medium and High risk predictions
    if (prediction.riskLevel === 'Medium' || prediction.riskLevel === 'High') {
      const priority = prediction.riskLevel === 'High' ? 'High' : 'Medium';
      const timeframe = prediction.riskLevel === 'High' ? 'Immediate' : 'Short-term';
      
      recommendations.push({
        category: 'community',
        priority: priority,
        title: 'Community Awareness Program',
        description: 'Organize community meetings and awareness campaigns',
        rationale: `Proactive prevention for ${prediction.crimeType} in ${prediction.barangay} (${prediction.riskLevel} risk)`,
        expectedImpact: 'Improve community vigilance and reporting',
        implementationCost: 'Low',
        timeframe: timeframe,
        successMetrics: ['Community participation rate', 'Reported suspicious activities'],
        riskFactors: ['Low community engagement', 'Language barriers'],
        confidence: prediction.confidence * 0.8
      });
    }
    
    // Add crime-specific recommendations for serious crimes
    const seriousCrimes = ['RAPE', 'MURDER', 'HOMICIDE', 'ASSAULT', 'DRUGS', 'DRUG POSSESSION', 'DRUG TRAFFICKING'];
    if (prediction.crimeType && seriousCrimes.includes(prediction.crimeType.toUpperCase())) {
      const crimeType = prediction.crimeType.toUpperCase();
      let title = 'Enhanced Investigation Protocol';
      let description = 'Implement specialized investigation procedures and victim support services';
      let expectedImpact = 'Improve case resolution and victim support';
      
      // Customize recommendations based on crime type
      if (crimeType.includes('DRUG')) {
        title = 'Drug Enforcement Protocol';
        description = 'Implement specialized drug investigation procedures and community outreach';
        expectedImpact = 'Improve drug case resolution and community safety';
      }
      
      recommendations.push({
        category: 'investigation',
        priority: prediction.riskLevel === 'High' ? 'High' : 'Medium',
        title: title,
        description: description,
        rationale: `Serious crime type (${prediction.crimeType}) requires enhanced investigation protocols`,
        expectedImpact: expectedImpact,
        implementationCost: 'High',
        timeframe: 'Immediate',
        successMetrics: ['Case resolution rate', 'Community safety', 'Evidence collection quality'],
        riskFactors: ['Resource requirements', 'Training needs'],
        confidence: prediction.confidence * 0.9
      });
    }
    
    // Add drug-specific prevention recommendations
    if (prediction.crimeType && prediction.crimeType.toUpperCase().includes('DRUG')) {
      recommendations.push({
        category: 'prevention',
        priority: prediction.riskLevel === 'High' ? 'High' : 'Medium',
        title: 'Drug Prevention Program',
        description: 'Implement community drug awareness and prevention programs',
        rationale: `Drug-related crime (${prediction.crimeType}) requires preventive community measures`,
        expectedImpact: 'Reduce drug-related incidents through community education',
        implementationCost: 'Medium',
        timeframe: 'Short-term',
        successMetrics: ['Community participation', 'Drug awareness levels', 'Reported incidents'],
        riskFactors: ['Community resistance', 'Resource allocation'],
        confidence: prediction.confidence * 0.7
      });
    }
    
    return recommendations;
  }
}
