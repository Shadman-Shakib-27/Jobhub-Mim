// @ts-nocheck
// lib/models/Application.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  jobId: string;
  applicantId: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  coverLetter?: string;
  resumeUrl?: string;
  appliedAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>({
  jobId: {
    type: String,
    required: true,
    ref: 'Job',
  },
  applicantId: {
    type: String,
    required: true,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'],
    default: 'pending',
  },
  coverLetter: String,
  resumeUrl: String,
  appliedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate applications
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

export const Application = mongoose.models.Application || 
  mongoose.model<IApplication>('Application', applicationSchema);