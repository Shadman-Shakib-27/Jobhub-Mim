// @/lib/models/Job.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ISalary {
  min: number;
  max: number;
  currency: string;
}

export interface IJob extends Document {
  _id: string;
  title: string;
  company: string;
  companyId: string; // Reference to User with role 'employer'
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  category: 'skilled' | 'non-skilled' | 'deferred-hire';
  salary: ISalary;
  isRemote: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior';
  description: string;
  requirements?: string[];
  benefits?: string[];
  skills?: string[];
  
  // Category specific fields
  trainingProvided?: boolean; // for non-skilled
  deferredStartMonths?: number; // for deferred-hire
  
  // Status and metadata
  status: 'active' | 'paused' | 'closed';
  applicationsCount: number;
  viewsCount: number;
  postedAt: Date;
  expiresAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const salarySchema = new Schema<ISalary>({
  min: {
    type: Number,
    required: true,
    min: 0,
  },
  max: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'BDT', 'EUR', 'GBP'],
  },
});

const jobSchema = new Schema<IJob>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  company: {
    type: String,
    required: true,
    trim: true,
  },
  companyId: {
    type: String,
    required: true,
    ref: 'User',
  },
  companyLogo: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
  },
  category: {
    type: String,
    required: true,
    enum: ['skilled', 'non-skilled', 'deferred-hire'],
  },
  salary: {
    type: salarySchema,
    required: true,
  },
  isRemote: {
    type: Boolean,
    default: false,
  },
  experienceLevel: {
    type: String,
    required: true,
    enum: ['entry', 'mid', 'senior'],
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  requirements: [String],
  benefits: [String],
  skills: [String],
  
  // Category specific fields
  trainingProvided: {
    type: Boolean,
    default: false,
  },
  deferredStartMonths: {
    type: Number,
    min: 1,
    max: 24,
  },
  
  // Status and metadata
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active',
  },
  applicationsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  viewsCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  postedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for better query performance
jobSchema.index({ status: 1, postedAt: -1 });
jobSchema.index({ companyId: 1 });
jobSchema.index({ category: 1, type: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ title: 'text', description: 'text' });

export const Job = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);