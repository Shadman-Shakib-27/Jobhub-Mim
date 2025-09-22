//@ts-nocheck
// lib/models/Application.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  _id: string;
  jobId: string;
  applicantId: string;
  coverLetter?: string;
  resumeUrl?: string;
  expectedSalary?: number;
  availableFrom?: Date;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: Date;
  updatedAt: Date;

  // Populated fields
  job?: any;
  applicant?: any;
}

const applicationSchema = new Schema<IApplication>(
  {
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
    coverLetter: {
      type: String,
      maxlength: 2000,
    },
    resumeUrl: {
      type: String,
    },
    expectedSalary: {
      type: Number,
      min: 0,
    },
    availableFrom: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'rejected', 'hired'],
      default: 'pending',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index to prevent duplicate applications
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });

// Index for queries
applicationSchema.index({ applicantId: 1, appliedAt: -1 });
applicationSchema.index({ jobId: 1, status: 1 });

export const Application =
  mongoose.models.Application ||
  mongoose.model<IApplication>('Application', applicationSchema);
