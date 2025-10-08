import mongoose, { Schema, Model } from 'mongoose';
import { IPrescription } from '../types';

const prescriptionSchema = new Schema<IPrescription>({
  predictionId: {
    type: Schema.Types.ObjectId,
    ref: 'Prediction',
    required: true,
    index: true
  },
  recommendation: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high'],
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
prescriptionSchema.index({ predictionId: 1, severity: 1 });
prescriptionSchema.index({ createdBy: 1, createdAt: -1 });
prescriptionSchema.index({ severity: 1, createdAt: -1 });

const Prescription: Model<IPrescription> = mongoose.model<IPrescription>('Prescription', prescriptionSchema);

export default Prescription;
