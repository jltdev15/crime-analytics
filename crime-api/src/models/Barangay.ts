import mongoose, { Schema, Model } from 'mongoose';
import { IBarangay } from '../types';

const barangaySchema = new Schema<IBarangay>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  municipality: {
    type: String,
    required: true,
    trim: true
  },
  province: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'Philippines'
  },
  population: {
    type: Number,
    required: true,
    min: 0
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  }
}, {
  timestamps: true
});

// Compound index for location-based queries
barangaySchema.index({ latitude: 1, longitude: 1 });
barangaySchema.index({ municipality: 1, province: 1 });
barangaySchema.index({ name: 1 });

const Barangay: Model<IBarangay> = mongoose.model<IBarangay>('Barangay', barangaySchema);

export default Barangay;
