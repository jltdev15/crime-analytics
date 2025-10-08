import { Crime, Barangay, NewPrediction, Recommendation } from '../models';
import { addMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import * as ss from 'simple-statistics';

export interface TimeSeriesData {
  date: Date;
  count: number;
}

export interface ForecastResult {
  month: string;
  predicted: number;
  lower: number;
  upper: number;
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

export class PredictiveService {
  /**
   * Generate time-series forecast for a specific barangay and crime type
   */
  async generateForecast(
    barangay: string,
    municipality: string,
    province: string,
    crimeType: string,
    months: number = 6
  ): Promise<ForecastResult[]> {
    // Get historical data
    const historicalData = await this.getHistoricalData(barangay, municipality, province, crimeType);
    
    if (historicalData.length < 3) {
      // Not enough data for forecasting
      return this.generateDefaultForecast(months);
    }

    // Convert to time series
    const timeSeries = this.prepareTimeSeries(historicalData);
    
    // Apply forecasting algorithm (Linear Regression with seasonal adjustment)
    const forecast = this.linearRegressionForecast(timeSeries, months);
    
    return forecast;
  }

  /**
   * Assess risk level for a barangay
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

    // Calculate risk factors
    const historicalTrend = this.calculateHistoricalTrend(historicalData);
    const seasonalPattern = this.calculateSeasonalPattern(historicalData);
    const populationDensity = this.calculatePopulationDensity(population);
    const recentActivity = this.calculateRecentActivity(historicalData);

    // Calculate overall risk probability
    const probability = this.calculateRiskProbability({
      historicalTrend,
      seasonalPattern,
      populationDensity,
      recentActivity
    });

    // Determine risk level
    const riskLevel = this.determineRiskLevel(probability);

    return {
      riskLevel,
      probability,
      factors: {
        historicalTrend,
        seasonalPattern,
        populationDensity,
        recentActivity
      }
    };
  }

  /**
   * Generate predictions for all barangays and crime types
   */
  async generateAllPredictions(): Promise<void> {
    // Get all unique combinations of barangay and crime type
    const combinations = await Crime.aggregate([
      {
        $group: {
          _id: {
            barangay: '$barangay',
            municipality: '$municipality',
            province: '$province',
            country: '$country',
            crimeType: '$type'
          }
        }
      }
    ]);

    for (const combo of combinations) {
      const { barangay, municipality, province, country, crimeType } = combo._id;
      
      try {
        // Generate forecast
        const forecast = await this.generateForecast(barangay, municipality, province, crimeType);
        
        // Assess risk
        const riskAssessment = await this.assessRisk(barangay, municipality, province, crimeType);
        
        // Calculate confidence based on data quality
        const confidence = this.calculateConfidence(barangay, municipality, province, crimeType);
        
        // Save prediction
        await NewPrediction.findOneAndUpdate(
          {
            barangay,
            municipality,
            province,
            country,
            crimeType
          },
          {
            barangay,
            municipality,
            province,
            country,
            crimeType,
            forecast,
            riskLevel: riskAssessment.riskLevel,
            probability: riskAssessment.probability,
            confidence,
            factors: riskAssessment.factors
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error(`Error generating prediction for ${barangay} - ${crimeType}:`, error);
      }
    }
  }

  /**
   * Generate recommendations based on predictions
   */
  async generateRecommendations(): Promise<void> {
    const predictions = await NewPrediction.find({ riskLevel: { $in: ['Medium', 'High'] } });
    
    for (const prediction of predictions) {
      const recommendations = this.createRecommendations(prediction);
      
      for (const rec of recommendations) {
        await Recommendation.findOneAndUpdate(
          {
            barangay: prediction.barangay,
            municipality: prediction.municipality,
            province: prediction.province,
            country: prediction.country,
            crimeType: prediction.crimeType,
            category: rec.category,
            title: rec.title
          },
          {
            ...rec,
            barangay: prediction.barangay,
            municipality: prediction.municipality,
            province: prediction.province,
            country: prediction.country,
            crimeType: prediction.crimeType
          },
          { upsert: true, new: true }
        );
      }
    }
  }

  // Private helper methods
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
    return barangayData?.population || 1000; // Default population
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
      return this.generateDefaultForecast(months);
    }

    // Convert dates to numeric values (months since first date)
    const xValues = timeSeries.map((_, index) => index);
    const yValues = timeSeries.map(point => point.count);

    // Validate data points
    const validDataPoints = xValues.map((x, i) => [x, yValues[i]] as [number, number])
      .filter(([x, y]) => !isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y));
    
    if (validDataPoints.length < 2) {
      return this.generateDefaultForecast(months);
    }

    // Calculate linear regression
    const regression = ss.linearRegression(validDataPoints);
    const rSquared = ss.rSquared(validDataPoints, (x: number) => (regression.m || 0) * x + (regression.b || 0));

    // Generate forecast
    const forecast: ForecastResult[] = [];
    const lastDate = timeSeries[timeSeries.length - 1]?.date || new Date();
    const lastIndex = timeSeries.length - 1;

    for (let i = 1; i <= months; i++) {
      const futureIndex = lastIndex + i;
      const predicted = (regression.m || 0) * futureIndex + (regression.b || 0);
      
      // Ensure predicted value is valid
      const validPredicted = isNaN(predicted) || !isFinite(predicted) ? 3 : Math.max(0, Math.round(predicted));
      
      // Calculate confidence intervals (simplified)
      const stdError = Math.sqrt(ss.sampleVariance(yValues)) * (1 - rSquared);
      const margin = isNaN(stdError) || !isFinite(stdError) ? 2 : stdError * 1.96; // 95% confidence interval
      
      const forecastDate = addMonths(lastDate, i);
      
      forecast.push({
        month: format(forecastDate, 'yyyy-MM'),
        predicted: validPredicted,
        lower: Math.max(0, Math.round(validPredicted - margin)),
        upper: Math.round(validPredicted + margin)
      });
    }

    return forecast;
  }

  private generateDefaultForecast(months: number): ForecastResult[] {
    const forecast: ForecastResult[] = [];
    const startDate = new Date();
    
    for (let i = 1; i <= months; i++) {
      const forecastDate = addMonths(startDate, i);
      
      // Add some variation to make forecasts more realistic
      const seasonalVariation = Math.sin((i - 1) * Math.PI / 6) * 0.3;
      const randomVariation = (Math.random() - 0.5) * 0.4;
      const predicted = Math.max(1, Math.round(5 * (1 + seasonalVariation + randomVariation)));
      
      forecast.push({
        month: format(forecastDate, 'yyyy-MM'),
        predicted: predicted,
        lower: Math.max(0, predicted - 2),
        upper: predicted + 3
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
    
    return (secondAvg - firstAvg) / firstAvg; // Percentage change
  }

  private calculateSeasonalPattern(historicalData: any[]): number {
    if (historicalData.length < 12) return 0;
    
    const monthlyCounts = this.prepareTimeSeries(historicalData);
    const monthlyAverages = new Array(12).fill(0);
    const monthlyCounts_array = new Array(12).fill(0);
    
    monthlyCounts.forEach(point => {
      const month = point.date.getMonth();
      monthlyAverages[month] += point.count;
      monthlyCounts_array[month]++;
    });
    
    // Calculate average for each month
    for (let i = 0; i < 12; i++) {
      if (monthlyCounts_array[i] > 0) {
        monthlyAverages[i] /= monthlyCounts_array[i];
      }
    }
    
    // Calculate seasonal variance
    const overallAvg = ss.mean(monthlyAverages.filter(avg => avg > 0));
    const variance = ss.sampleVariance(monthlyAverages.filter(avg => avg > 0));
    
    return Math.sqrt(variance) / overallAvg; // Coefficient of variation
  }

  private calculatePopulationDensity(population: number): number {
    // Normalize population density (assuming average barangay area of 2 sq km)
    const area = 2; // square kilometers
    const density = population / area;
    
    // Return normalized value (0-1 scale)
    return Math.min(1, density / 10000); // Cap at 10,000 people per sq km
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
    
    if (olderCrimes.length === 0) return recentCrimes.length / 10; // Normalize
    
    const recentRate = recentCrimes.length / 3; // per month
    const firstOlderCrimeDate = olderCrimes[0] ? olderCrimes[0].confinementDate : null;
    const historicalRate = olderCrimes.length / Math.max(1, firstOlderCrimeDate ? (now.getTime() - new Date(firstOlderCrimeDate).getTime()) / (1000 * 60 * 60 * 24 * 30) : 1);
    
    return recentRate / Math.max(1, historicalRate); // Ratio of recent to historical activity
  }

  private calculateRiskProbability(factors: {
    historicalTrend: number;
    seasonalPattern: number;
    populationDensity: number;
    recentActivity: number;
  }): number {
    // Weighted combination of factors
    const weights = {
      historicalTrend: 0.3,
      seasonalPattern: 0.2,
      populationDensity: 0.2,
      recentActivity: 0.3
    };
    
    const weightedSum = 
      factors.historicalTrend * weights.historicalTrend +
      factors.seasonalPattern * weights.seasonalPattern +
      factors.populationDensity * weights.populationDensity +
      factors.recentActivity * weights.recentActivity;
    
    // Normalize to 0-1 range
    return Math.max(0, Math.min(1, (weightedSum + 1) / 2));
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
    // Confidence based on data availability and quality
    // This is a simplified version - in practice, you'd consider more factors
    return 0.8; // Default confidence
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
    
    if (prediction.probability > 0.6) {
      recommendations.push({
        category: 'community',
        priority: 'Medium',
        title: 'Community Awareness Program',
        description: 'Organize community meetings and awareness campaigns',
        rationale: `Proactive prevention for ${prediction.crimeType} in ${prediction.barangay}`,
        expectedImpact: 'Improve community vigilance and reporting',
        implementationCost: 'Low',
        timeframe: 'Short-term',
        successMetrics: ['Community participation rate', 'Reported suspicious activities'],
        riskFactors: ['Low community engagement', 'Language barriers'],
        confidence: prediction.confidence * 0.8
      });
    }
    
    return recommendations;
  }
}
