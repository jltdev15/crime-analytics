import { Document, Types } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'analyst' | 'officer' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

// Barangay Types
export interface IBarangay extends Document {
  _id: Types.ObjectId;
  name: string;
  municipality: string;
  province: string;
  country: string;
  population: number;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}

// Crime Types
export interface IPerson {
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  civilStatus: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'DIVORCED' | 'SEPARATED';
}

export interface IConfinement {
  date: Date;
  time: string; // HH:MM format
}

export interface ILocation {
  barangayId: Types.ObjectId;
  latitude: number;
  longitude: number;
}

export interface ICrime extends Document {
  _id: Types.ObjectId;
  caseId?: string;
  caseNumber?: string;
  type: string;
  status: 'RELEASED' | 'ONGOING';
  // Person fields (flat structure)
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  age: number;
  civilStatus: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'DIVORCED' | 'SEPARATED';
  // Confinement fields (flat structure)
  confinementDate: Date;
  confinementTime: string;
  // Location fields (flat structure)
  barangay: string;
  municipality: string;
  province: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

// Prediction Types
export interface IPrediction extends Document {
  _id: Types.ObjectId;
  crimeType: string;
  barangayId: Types.ObjectId;
  predictionDate: Date;
  predictedCount: number;
  modelVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

// Prescription Types
export interface IPrescription extends Document {
  _id: Types.ObjectId;
  predictionId: Types.ObjectId;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log Types
export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  action: string;
  targetCollection: string;
  targetId: Types.ObjectId;
  timestamp: Date;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Database Connection Types
export interface DatabaseConfig {
  uri: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
  };
}
