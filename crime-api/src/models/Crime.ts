import mongoose, { Schema, Model } from 'mongoose';
import { ICrime, IPerson, IConfinement, ILocation } from '../types';

const personSchema = new Schema<IPerson>({
  gender: {
    type: String,
    required: true,
    enum: ['MALE', 'FEMALE', 'OTHER']
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 150
  },
  civilStatus: {
    type: String,
    required: true,
    enum: ['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED']
  }
}, { _id: false });

const confinementSchema = new Schema<IConfinement>({
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  }
}, { _id: false });

const locationSchema = new Schema<ILocation>({
  barangayId: {
    type: Schema.Types.ObjectId,
    ref: 'Barangay',
    required: true,
    index: true
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
}, { _id: false });

const crimeSchema = new Schema<ICrime>({
  caseId: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true
  },
  caseNumber: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['RELEASED', 'ONGOING'],
    default: 'ONGOING'
  },
  // Person fields (flat structure)
  gender: {
    type: String,
    required: true,
    enum: ['MALE', 'FEMALE', 'OTHER']
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 150
  },
  civilStatus: {
    type: String,
    required: true,
    enum: ['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED']
  },
  // Confinement fields (flat structure)
  confinementDate: {
    type: Date,
    required: true,
    index: true
  },
  confinementTime: {
    type: String,
    required: true
  },
  // Location fields (flat structure)
  barangay: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  municipality: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  province: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'PHILIPPINES'
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
crimeSchema.index({ type: 1, status: 1 });
crimeSchema.index({ barangay: 1, municipality: 1, province: 1, createdAt: -1 });
crimeSchema.index({ confinementDate: -1 });
crimeSchema.index({ barangay: 1, municipality: 1, province: 1, type: 1 });

const Crime: Model<ICrime> = mongoose.model<ICrime>('Crime', crimeSchema);

export default Crime;
