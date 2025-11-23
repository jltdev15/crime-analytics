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
    // Get historical data to calculate realistic baseline for validation
    const historicalData = await this.getHistoricalData(barangay, municipality, province, crimeType);
    
    // Calculate monthly average from time series
    const timeSeries = this.prepareTimeSeries(historicalData);
    const historicalMean = timeSeries.length > 0
      ? timeSeries.map(t => t.count).reduce((a, b) => a + b, 0) / timeSeries.length
      : historicalData.length > 0 
        ? historicalData.length / Math.max(12, timeSeries.length || 12) // Rough estimate if no time series
        : 0;
    const isLowFrequency = historicalMean < 2;
    const fallbackValue = historicalMean > 0 ? Math.max(0, Math.round(historicalMean * 10) / 10) : 0;
    
    try {
      if (this.useNeuralNetwork) {
        // Try neural network first
        const nnForecast = await this.neuralNetworkService.generateForecast(
          barangay, municipality, province, crimeType, months
        );
        
        // Validate neural network output using historical baseline, not default 3
        const validForecast = nnForecast.map((f, index) => {
          let predicted = isNaN(f.predicted) || !isFinite(f.predicted) ? fallbackValue : f.predicted;
          const confidence = isNaN(f.confidence) || !isFinite(f.confidence) ? 0.5 : f.confidence;
          
          // For low-frequency crimes, use minimal variation
          if (index > 0 && !isLowFrequency) {
            const additionalVariation = Math.sin((index * Math.PI) / 3) * 0.05;
            predicted = predicted * (1 + additionalVariation);
          }
          
          // Cap predictions based on historical data
          const maxCap = isLowFrequency 
            ? Math.min(Math.max(historicalMean * 2, 0), 3)
            : Math.max(historicalMean * 1.5, 0);
          predicted = Math.min(predicted, maxCap);
          
          // Round appropriately based on frequency
          const roundedPredicted = historicalMean < 0.5 && historicalMean > 0
            ? Math.round(predicted * 10) / 10
            : Math.max(0, Math.round(predicted));
          
          return {
            month: f.month,
            predicted: roundedPredicted,
            lower: Math.max(0, historicalMean < 0.5 && historicalMean > 0 
              ? Math.round((roundedPredicted * 0.8) * 10) / 10 
              : Math.round(roundedPredicted * 0.8)),
            upper: historicalMean < 0.5 && historicalMean > 0
              ? Math.round((roundedPredicted * 1.2) * 10) / 10
              : Math.round(roundedPredicted * 1.2),
            confidence: Math.min(1, Math.max(0, isLowFrequency ? confidence * 0.8 : confidence)),
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
      // Calculate monthly average instead of using total count
      // This prevents inflating predictions for low-frequency crimes
      const timeSeries = this.prepareTimeSeries(historicalData);
      let baseValue = 0;
      
      if (timeSeries.length > 0) {
        // Use average monthly count
        const monthlyCounts = timeSeries.map(t => t.count);
        baseValue = monthlyCounts.reduce((a, b) => a + b, 0) / monthlyCounts.length;
      } else if (historicalData.length > 0) {
        // Rough estimate: total cases / estimated months of data (assume at least 1 month)
        // For very few cases, use a conservative estimate
        baseValue = historicalData.length / Math.max(1, timeSeries.length || 1);
      }
      
      // Don't force minimum of 1 - allow 0 for crimes that rarely occur
      baseValue = Math.max(0, Math.round(baseValue * 10) / 10);
      const isLowFrequency = baseValue < 2;
      
      return this.generateDefaultForecast(months, baseValue, isLowFrequency);
    }

    const timeSeries = this.prepareTimeSeries(historicalData);
    const forecast = this.linearRegressionForecast(timeSeries, months);
    
    // Determine if low-frequency for confidence adjustment
    const monthlyCounts = timeSeries.map(t => t.count);
    const avgMonthly = monthlyCounts.length > 0 
      ? monthlyCounts.reduce((a, b) => a + b, 0) / monthlyCounts.length 
      : 0;
    const isLowFrequency = avgMonthly < 2;
    
    return forecast.map(f => ({
      ...f,
      confidence: isLowFrequency ? 0.6 : 0.8,
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
    // Calculate historical statistics for realistic capping
    const historicalCounts = timeSeries.map(t => t.count);
    const historicalMean = historicalCounts.length > 0 ? ss.mean(historicalCounts) : 0;
    const historicalMax = historicalCounts.length > 0 ? Math.max(...historicalCounts) : 0;
    const historicalMin = historicalCounts.length > 0 ? Math.min(...historicalCounts) : 0;
    
    // Determine if this is a low-frequency crime (average < 2 per month)
    const isLowFrequency = historicalMean < 2;
    
    if (timeSeries.length < 2) {
      // Use actual average, not a default of 3
      const avgValue = historicalMean > 0 ? Math.max(0, Math.round(historicalMean * 10) / 10) : 0;
      return this.generateDefaultForecast(months, avgValue, isLowFrequency);
    }

    const xValues = timeSeries.map((_, index) => index);
    const yValues = timeSeries.map(point => point.count);

    // Validate data points
    const validDataPoints = xValues.map((x, i) => [x, yValues[i]] as [number, number])
      .filter(([x, y]) => !isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y));
    
    if (validDataPoints.length < 2) {
      // Use actual average instead of default 3
      const avgValue = historicalMean > 0 ? Math.max(0, Math.round(historicalMean * 10) / 10) : 0;
      return this.generateDefaultForecast(months, avgValue, isLowFrequency);
    }

    const regression = ss.linearRegression(validDataPoints);
    const rSquared = ss.rSquared(validDataPoints, (x: number) => (regression.m || 0) * x + (regression.b || 0));

    const forecast: ForecastResult[] = [];
    const lastDate = timeSeries[timeSeries.length - 1]?.date || new Date();
    const lastIndex = timeSeries.length - 1;

    for (let i = 1; i <= months; i++) {
      const futureIndex = lastIndex + i;
      let predicted = (regression.m || 0) * futureIndex + (regression.b || 0);
      
      // For low-frequency crimes, use minimal or no seasonal variation
      // For higher frequency crimes, apply seasonal variation
      if (!isLowFrequency) {
        const monthOfYear = addMonths(lastDate, i).getMonth();
        const seasonalVariation = Math.sin((monthOfYear / 12) * 2 * Math.PI) * 0.2;
        predicted = predicted * (1 + seasonalVariation);
      } else {
        // For low-frequency crimes, use very minimal variation (max 10%)
        const monthOfYear = addMonths(lastDate, i).getMonth();
        const seasonalVariation = Math.sin((monthOfYear / 12) * 2 * Math.PI) * 0.05;
        predicted = predicted * (1 + seasonalVariation);
      }
      
      // Cap predictions based on historical data to prevent unrealistic inflation
      // For low-frequency crimes, cap at 2x the historical max or 3, whichever is lower
      // For higher frequency crimes, cap at 1.5x the historical max
      const maxCap = isLowFrequency 
        ? Math.min(Math.max(historicalMax * 2, historicalMean * 2), 3)
        : Math.max(historicalMax * 1.5, historicalMean * 1.5);
      
      // Ensure predicted value is valid and capped
      let validPredicted = isNaN(predicted) || !isFinite(predicted) 
        ? Math.max(0, Math.round(historicalMean * 10) / 10) 
        : Math.max(0, Math.round(predicted));
      
      // Apply cap
      validPredicted = Math.min(validPredicted, maxCap);
      
      // For very low averages (< 0.5), round to nearest 0.1 to allow fractional predictions
      if (historicalMean < 0.5) {
        validPredicted = Math.round(validPredicted * 10) / 10;
      } else {
        validPredicted = Math.round(validPredicted);
      }
      
      const stdError = Math.sqrt(ss.sampleVariance(yValues)) * (1 - rSquared);
      const margin = isNaN(stdError) || !isFinite(stdError) 
        ? Math.max(0.1, historicalMean * 0.3) 
        : Math.max(0.1, stdError * 1.96);
      
      const forecastDate = addMonths(lastDate, i);
      
      forecast.push({
        month: format(forecastDate, 'yyyy-MM'),
        predicted: validPredicted,
        lower: Math.max(0, Math.round((validPredicted - margin) * 10) / 10),
        upper: Math.round((validPredicted + margin) * 10) / 10,
        confidence: isLowFrequency ? 0.6 : 0.8, // Lower confidence for low-frequency crimes
        method: 'statistical'
      });
    }

    return forecast;
  }

  private generateDefaultForecast(months: number, baseValue: number = 0, isLowFrequency: boolean = false): ForecastResult[] {
    const forecast: ForecastResult[] = [];
    const startDate = new Date();
    
    // Ensure baseValue is a valid number, but don't default to 3 - use 0 for no data
    const validBaseValue = isNaN(baseValue) || baseValue < 0 ? 0 : baseValue;
    
    // For low-frequency crimes, use minimal variations
    // For higher frequency crimes, use normal variations
    const trend = isLowFrequency ? 0 : 0.1; // No trend for low-frequency crimes
    const seasonalAmplitude = isLowFrequency ? 0.1 : 0.4; // Minimal seasonal variation for low-frequency
    const randomAmplitude = isLowFrequency ? 0.1 : 0.3; // Minimal random variation for low-frequency
    
    for (let i = 1; i <= months; i++) {
      const forecastDate = addMonths(startDate, i);
      
      // Create variations based on crime frequency
      const monthOfYear = forecastDate.getMonth(); // 0-11
      const seasonalVariation = Math.sin((monthOfYear / 12) * 2 * Math.PI) * seasonalAmplitude;
      const trendVariation = trend * i; // Gradual trend over time (only for higher frequency)
      const randomVariation = (Math.random() - 0.5) * randomAmplitude; // Random variation
      
      // Combine all variations
      const totalVariation = seasonalVariation + trendVariation + randomVariation;
      
      // For very low base values (< 0.5), allow fractional predictions
      let predicted: number;
      if (validBaseValue < 0.5 && validBaseValue > 0) {
        predicted = Math.max(0, validBaseValue * (1 + totalVariation));
        predicted = Math.round(predicted * 10) / 10; // Round to 1 decimal
      } else {
        predicted = Math.max(0, Math.round(validBaseValue * (1 + totalVariation)));
      }
      
      // Cap predictions for low-frequency crimes
      if (isLowFrequency && validBaseValue > 0) {
        predicted = Math.min(predicted, Math.max(validBaseValue * 2, 2));
      }
      
      // Ensure all values are valid numbers
      const validPredicted = isNaN(predicted) ? validBaseValue : predicted;
      
      // Calculate bounds with appropriate precision
      let validLower: number;
      let validUpper: number;
      
      if (validBaseValue < 0.5 && validBaseValue > 0) {
        validLower = Math.max(0, Math.round((validPredicted - Math.max(0.1, validPredicted * 0.3)) * 10) / 10);
        validUpper = Math.round((validPredicted + Math.max(0.1, validPredicted * 0.3)) * 10) / 10;
      } else {
        validLower = Math.max(0, Math.round(validPredicted - Math.max(0.5, validPredicted * 0.3)));
        validUpper = Math.round(validPredicted + Math.max(0.5, validPredicted * 0.3));
      }
      
      forecast.push({
        month: format(forecastDate, 'yyyy-MM'),
        predicted: validPredicted,
        lower: validLower,
        upper: validUpper,
        confidence: isLowFrequency ? 0.5 : 0.6, // Lower confidence for low-frequency or no data
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
      const recommendations = await this.createRecommendations(prediction);
      
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

  private async createRecommendations(prediction: any): Promise<any[]> {
    const recommendations = [];
    
    // Gather barangay-specific data for personalized recommendations
    const [historicalData, barangayInfo, municipalityStats, crimePatterns] = await Promise.all([
      this.getHistoricalData(prediction.barangay, prediction.municipality, prediction.province, prediction.crimeType),
      this.getPopulation(prediction.barangay, prediction.municipality, prediction.province).then(async (pop) => {
        const barangay = await Barangay.findOne({
          name: prediction.barangay,
          municipality: prediction.municipality,
          province: prediction.province
        });
        return { population: pop, barangay };
      }),
      this.getMunicipalityCrimeStats(prediction.municipality, prediction.province),
      this.analyzeCrimePatterns(prediction.barangay, prediction.municipality, prediction.province, prediction.crimeType)
    ]);
    
    const population = barangayInfo?.population || 1000;
    const populationDensity = population > 0 ? population / 1000 : 1; // per 1000 people
    const totalCrimes = historicalData.length;
    const crimeRate = population > 0 ? (totalCrimes / population) * 1000 : 0;
    const municipalityAvgRate = municipalityStats.avgCrimeRate || 0;
    const isAboveAverage = crimeRate > municipalityAvgRate * 1.2;
    
    // Analyze forecast trend
    const forecastTrend = prediction.forecast && prediction.forecast.length >= 2
      ? ((prediction.forecast[prediction.forecast.length - 1].predicted - prediction.forecast[0].predicted) / 
         Math.max(1, prediction.forecast[0].predicted)) * 100
      : 0;
    const isIncreasing = forecastTrend > 10;
    
    // Determine priority based on multiple factors
    const priorityScore = (prediction.riskLevel === 'High' ? 3 : 1) + 
                         (isAboveAverage ? 2 : 0) + 
                         (isIncreasing ? 1 : 0) +
                         (prediction.probability > 0.7 ? 1 : 0);
    const finalPriority = priorityScore >= 5 ? 'Critical' : 
                          priorityScore >= 4 ? 'High' : 
                          priorityScore >= 2 ? 'Medium' : 'Low';
    
    // 1. PATROL RECOMMENDATIONS (based on crime patterns and risk level)
    if (prediction.riskLevel === 'High' || isAboveAverage) {
      const peakHours = crimePatterns.peakHours || [];
      const peakDays = crimePatterns.peakDays || [];
      
      let patrolDescription = 'Deploy additional police patrols';
      let patrolRationale = `High risk prediction (${(prediction.probability * 100).toFixed(1)}%) for ${prediction.crimeType} in ${prediction.barangay}`;
      
      if (peakHours.length > 0) {
        const hoursStr = peakHours.slice(0, 3).join(', ');
        patrolDescription += ` during peak hours (${hoursStr})`;
        patrolRationale += `. Historical data shows peak activity during ${hoursStr}`;
      }
      
      if (peakDays.length > 0) {
        patrolDescription += `, especially on ${peakDays[0]}`;
      }
      
      if (populationDensity > 5) {
        patrolDescription += '. High population density area requires increased visibility';
        patrolRationale += `. High population density (${Math.round(populationDensity * 1000)} per km²) increases risk`;
      }
      
      recommendations.push({
        category: 'patrol',
        priority: finalPriority,
        title: isAboveAverage ? 'Enhanced Patrol Coverage for High-Crime Area' : 'Increase Patrol Frequency',
        description: patrolDescription,
        rationale: patrolRationale + (isIncreasing ? '. Forecast shows increasing trend' : ''),
        expectedImpact: isAboveAverage 
          ? `Reduce crime incidents by 25-35% in this high-crime area (current rate: ${crimeRate.toFixed(2)} per 1000, vs municipality avg: ${municipalityAvgRate.toFixed(2)})`
          : 'Reduce crime incidents by 20-30%',
        implementationCost: populationDensity > 5 ? 'High' : 'Medium',
        timeframe: prediction.riskLevel === 'High' ? 'Immediate' : 'Short-term',
        successMetrics: [
          'Reduction in reported incidents',
          'Response time improvement',
          `Crime rate reduction to below ${(municipalityAvgRate * 1.1).toFixed(2)} per 1000`
        ],
        riskFactors: ['Resource constraints', 'Community resistance', populationDensity > 5 ? 'High population density requires more resources' : ''],
        confidence: prediction.confidence
      });
    }
    
    // 2. COMMUNITY AWARENESS (tailored to barangay needs)
    if (prediction.riskLevel === 'Medium' || prediction.riskLevel === 'High') {
      const priority = prediction.riskLevel === 'High' ? 'High' : 'Medium';
      const timeframe = prediction.riskLevel === 'High' ? 'Immediate' : 'Short-term';
      
      let communityDescription = 'Organize community meetings and awareness campaigns';
      let communityRationale = `Proactive prevention for ${prediction.crimeType} in ${prediction.barangay} (${prediction.riskLevel} risk)`;
      
      // Customize based on crime type
      if (prediction.crimeType && prediction.crimeType.toUpperCase().includes('THEFT')) {
        communityDescription = 'Organize community watch programs and property protection workshops';
        communityRationale += '. Theft prevention requires community vigilance';
      } else if (prediction.crimeType && prediction.crimeType.toUpperCase().includes('ASSAULT')) {
        communityDescription = 'Organize conflict resolution workshops and community mediation programs';
        communityRationale += '. Assault prevention requires addressing root causes';
      }
      
      if (population > 5000) {
        communityDescription += '. Large community requires multiple sessions across different zones';
      }
      
      recommendations.push({
        category: 'community',
        priority: priority,
        title: `${prediction.barangay} Community Safety Program`,
        description: communityDescription,
        rationale: communityRationale + (totalCrimes > 10 ? `. ${totalCrimes} historical cases indicate ongoing concern` : ''),
        expectedImpact: `Improve community vigilance and reporting. Target: ${Math.round(population * 0.1)} active participants`,
        implementationCost: population > 5000 ? 'Medium' : 'Low',
        timeframe: timeframe,
        successMetrics: [
          'Community participation rate (target: 10% of population)',
          'Reported suspicious activities increase',
          'Community satisfaction survey scores'
        ],
        riskFactors: ['Low community engagement', 'Language barriers', population > 5000 ? 'Large population requires more resources' : ''],
        confidence: prediction.confidence * 0.8
      });
    }
    
    // 3. INFRASTRUCTURE RECOMMENDATIONS (for high-density or high-crime areas)
    if (isAboveAverage || populationDensity > 5) {
      recommendations.push({
        category: 'infrastructure',
        priority: isAboveAverage ? 'High' : 'Medium',
        title: `Security Infrastructure Enhancement for ${prediction.barangay}`,
        description: `Install security cameras, improve street lighting, and establish security checkpoints in high-risk areas`,
        rationale: `${prediction.barangay} has ${isAboveAverage ? 'above-average' : 'high-density'} crime rate (${crimeRate.toFixed(2)} per 1000) requiring infrastructure improvements`,
        expectedImpact: `Reduce crime by 15-25% through deterrence. Focus on ${crimePatterns.hotspotAreas?.length || 0} identified hotspot areas`,
        implementationCost: 'High',
        timeframe: 'Medium-term',
        successMetrics: [
          'Number of security cameras installed',
          'Street lighting coverage improvement',
          'Crime reduction in monitored areas',
          'Community safety perception improvement'
        ],
        riskFactors: ['Budget constraints', 'Maintenance requirements', 'Privacy concerns'],
        confidence: prediction.confidence * 0.75
      });
    }
    
    // 4. CRIME-SPECIFIC RECOMMENDATIONS
    const seriousCrimes = ['RAPE', 'MURDER', 'HOMICIDE', 'ASSAULT', 'DRUGS', 'DRUG POSSESSION', 'DRUG TRAFFICKING'];
    if (prediction.crimeType && seriousCrimes.includes(prediction.crimeType.toUpperCase())) {
      const crimeType = prediction.crimeType.toUpperCase();
      let title = 'Enhanced Investigation Protocol';
      let description = 'Implement specialized investigation procedures and victim support services';
      let expectedImpact = 'Improve case resolution and victim support';
      
      if (crimeType.includes('DRUG')) {
        title = `Drug Enforcement Strategy for ${prediction.barangay}`;
        description = `Implement specialized drug investigation procedures, community outreach, and rehabilitation programs`;
        expectedImpact = `Improve drug case resolution and community safety. Target: ${Math.round(totalCrimes * 0.3)} cases resolved`;
      } else if (crimeType.includes('RAPE') || crimeType.includes('ASSAULT')) {
        title = `Victim Support and Protection Program for ${prediction.barangay}`;
        description = `Establish victim support services, safe reporting mechanisms, and specialized investigation units`;
        expectedImpact = 'Improve victim support and case resolution rates';
      }
      
      recommendations.push({
        category: 'investigation',
        priority: finalPriority,
        title: title,
        description: description,
        rationale: `Serious crime type (${prediction.crimeType}) in ${prediction.barangay} requires enhanced investigation protocols. ${totalCrimes} historical cases indicate ongoing concern`,
        expectedImpact: expectedImpact,
        implementationCost: 'High',
        timeframe: 'Immediate',
        successMetrics: [
          'Case resolution rate improvement',
          'Community safety perception',
          'Evidence collection quality',
          'Victim satisfaction scores'
        ],
        riskFactors: ['Resource requirements', 'Training needs', 'Specialized personnel availability'],
        confidence: prediction.confidence * 0.9
      });
    }
    
    // 5. PREVENTION PROGRAMS (crime-type specific)
    if (prediction.crimeType && prediction.crimeType.toUpperCase().includes('DRUG')) {
      recommendations.push({
        category: 'prevention',
        priority: prediction.riskLevel === 'High' ? 'High' : 'Medium',
        title: `Drug Prevention Program for ${prediction.barangay}`,
        description: `Implement community drug awareness programs, youth engagement activities, and rehabilitation support`,
        rationale: `Drug-related crime (${prediction.crimeType}) in ${prediction.barangay} requires preventive community measures. ${totalCrimes} cases indicate need for intervention`,
        expectedImpact: `Reduce drug-related incidents by 20-30% through community education and early intervention`,
        implementationCost: 'Medium',
        timeframe: 'Short-term',
        successMetrics: [
          `Community participation (target: ${Math.round(population * 0.15)} people)`,
          'Drug awareness levels (pre/post surveys)',
          'Reported incidents reduction',
          'Youth engagement program participation'
        ],
        riskFactors: ['Community resistance', 'Resource allocation', 'Stigma around drug issues'],
        confidence: prediction.confidence * 0.7
      });
    }
    
    // 6. TARGETED INTERVENTION (for increasing trends)
    if (isIncreasing && forecastTrend > 15) {
      recommendations.push({
        category: 'prevention',
        priority: 'High',
        title: `Urgent Intervention for Rising ${prediction.crimeType} in ${prediction.barangay}`,
        description: `Implement immediate intervention measures to address the ${forecastTrend.toFixed(1)}% projected increase in ${prediction.crimeType}`,
        rationale: `Forecast shows significant increase (${forecastTrend.toFixed(1)}%) in ${prediction.crimeType} for ${prediction.barangay}. Immediate action required`,
        expectedImpact: `Prevent forecasted increase and stabilize crime rates`,
        implementationCost: 'High',
        timeframe: 'Immediate',
        successMetrics: [
          'Prevent forecasted crime increase',
          'Stabilize crime rate',
          'Response time to incidents',
          'Community engagement in prevention'
        ],
        riskFactors: ['Urgent resource allocation needed', 'Coordination challenges', 'Time constraints'],
        confidence: prediction.confidence * 0.85
      });
    }
    
    return recommendations;
  }
  
  // Helper method to get municipality crime statistics
  private async getMunicipalityCrimeStats(municipality: string, province: string): Promise<any> {
    try {
      const allCrimes = await Crime.find({ municipality, province });
      const barangays = await Barangay.find({ municipality, province });
      const totalPopulation = barangays.reduce((sum, b) => sum + (b.population || 0), 0);
      const totalCrimes = allCrimes.length;
      const avgCrimeRate = totalPopulation > 0 ? (totalCrimes / totalPopulation) * 1000 : 0;
      
      return {
        totalCrimes,
        totalPopulation,
        avgCrimeRate,
        barangayCount: barangays.length
      };
    } catch (error) {
      console.error('Error getting municipality stats:', error);
      return { totalCrimes: 0, totalPopulation: 0, avgCrimeRate: 0, barangayCount: 0 };
    }
  }
  
  // Helper method to analyze crime patterns
  private async analyzeCrimePatterns(barangay: string, municipality: string, province: string, crimeType: string): Promise<any> {
    try {
      const crimes = await Crime.find({ barangay, municipality, province, type: crimeType });
      
      // Analyze time patterns
      const hourCounts = new Map<number, number>();
      const dayCounts = new Map<number, number>();
      
      crimes.forEach(crime => {
        if (crime.confinementDate) {
          const date = new Date(crime.confinementDate);
          const hour = date.getHours();
          const day = date.getDay();
          
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
          dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
        }
      });
      
      // Get peak hours (top 3)
      const peakHours = Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => `${hour}:00`);
      
      // Get peak days
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const peakDays = Array.from(dayCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([day]) => dayNames[day]);
      
      return {
        peakHours,
        peakDays,
        totalCrimes: crimes.length,
        hotspotAreas: [] // Could be enhanced with location clustering
      };
    } catch (error) {
      console.error('Error analyzing crime patterns:', error);
      return { peakHours: [], peakDays: [], totalCrimes: 0, hotspotAreas: [] };
    }
  }
}
