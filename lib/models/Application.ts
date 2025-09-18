import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  _id: string;
  jobId: string;
  seekerId: string;
  employerId: string;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'interviewed' | 'offered' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  resume?: string;
  appliedAt: Date;
  statusHistory: Array<{
    status: string;
    updatedAt: Date;
    updatedBy: string;
    notes?: string;
  }>;
  feedback?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>({
  jobId: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  seekerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  employerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected', 'withdrawn'],
    default: 'pending',
  },
  coverLetter: {
    type: String,
    maxlength: 2000,
  },
  resume: String,
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  statusHistory: [{
    status: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  }],
  feedback: {
    type: String,
    maxlength: 1000,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
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

// Ensure unique application per job per user
applicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });

export const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', applicationSchema);