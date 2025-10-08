import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '../types';

const userSchema = new Schema<IUser>({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'analyst', 'officer', 'viewer'],
    default: 'viewer',
    index: true
  }
}, {
  timestamps: true
});

// Additional indexes for better query performance
userSchema.index({ createdAt: -1 });

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
