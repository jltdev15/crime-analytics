import mongoose, { Schema, Document } from 'mongoose';

export interface IForecastPoint {
  month: string;
  predicted: number;
  lower: number;
  upper: number;
  confidence?: number;
  method?: 'neural-network' | 'statistical';
}

export interface IPrediction extends Document {
  barangay: string;
  municipality: string;
  province: string;
  country: string;
  crimeType: string;
  forecast: IForecastPoint[];
  riskLevel: 'Low' | 'Medium' | 'High';
  probability: number;
  confidence: number;
  factors: {
    historicalTrend: number;
    seasonalPattern: number;
    populationDensity: number;
    recentActivity: number;
  };
  accuracy?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ForecastPointSchema = new Schema<IForecastPoint>({
  month: { type: String, required: true },
  predicted: { type: Number, required: true },
  lower: { type: Number, required: true },
  upper: { type: Number, required: true },
  confidence: { type: Number, min: 0, max: 1 },
  method: { type: String, enum: ['neural-network', 'statistical'] }
}, { _id: false });

const PredictionSchema = new Schema<IPrediction>({
  barangay: { type: String, required: true },
  municipality: { type: String, required: true },
  province: { type: String, required: true },
  country: { type: String, required: true, default: 'PHILIPPINES' },
  crimeType: { type: String, required: true },
  forecast: [ForecastPointSchema],
  riskLevel: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    required: true 
  },
  probability: { type: Number, required: true, min: 0, max: 1 },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  factors: {
    historicalTrend: { type: Number, required: true },
    seasonalPattern: { type: Number, required: true },
    populationDensity: { type: Number, required: true },
    recentActivity: { type: Number, required: true }
  },
  accuracy: { type: Number, min: 0, max: 1 },
}, {
  timestamps: true
});

// Indexes for efficient querying
PredictionSchema.index({ barangay: 1, municipality: 1, province: 1, country: 1 });
PredictionSchema.index({ crimeType: 1 });
PredictionSchema.index({ riskLevel: 1 });
PredictionSchema.index({ createdAt: -1 });

export const Prediction = mongoose.model<IPrediction>('Prediction', PredictionSchema);