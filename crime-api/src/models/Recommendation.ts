import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
  barangay: string;
  municipality: string;
  province: string;
  country: string;
  crimeType?: string;
  category: 'patrol' | 'community' | 'investigation' | 'prevention' | 'infrastructure';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  title: string;
  description: string;
  rationale: string;
  expectedImpact: string;
  implementationCost: 'Low' | 'Medium' | 'High';
  timeframe: 'Immediate' | 'Short-term' | 'Medium-term' | 'Long-term';
  successMetrics: string[];
  riskFactors: string[];
  confidence: number;
  status: 'pending' | 'approved' | 'implemented' | 'rejected';
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecommendationSchema = new Schema<IRecommendation>({
  barangay: { type: String, required: true },
  municipality: { type: String, required: true },
  province: { type: String, required: true },
  country: { type: String, required: true, default: 'PHILIPPINES' },
  crimeType: { type: String },
  category: { 
    type: String, 
    enum: ['patrol', 'community', 'investigation', 'prevention', 'infrastructure'],
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  rationale: { type: String, required: true },
  expectedImpact: { type: String, required: true },
  implementationCost: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    required: true 
  },
  timeframe: { 
    type: String, 
    enum: ['Immediate', 'Short-term', 'Medium-term', 'Long-term'], 
    required: true 
  },
  successMetrics: [{ type: String }],
  riskFactors: [{ type: String }],
  confidence: { type: Number, required: true, min: 0, max: 1 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'implemented', 'rejected'], 
    default: 'pending' 
  },
  assignedTo: { type: String },
  notes: { type: String }
}, {
  timestamps: true
});

// Indexes for efficient querying
RecommendationSchema.index({ barangay: 1, municipality: 1, province: 1, country: 1 });
RecommendationSchema.index({ category: 1 });
RecommendationSchema.index({ priority: 1 });
RecommendationSchema.index({ status: 1 });
RecommendationSchema.index({ createdAt: -1 });

export const Recommendation = mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
