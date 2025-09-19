// app/api/jobs/[id]/apply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Application } from '@/lib/models/Application';
import { Job } from '@/lib/models/Job';
import { authenticateRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'seeker') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const job = await Job.findById(params.id);
    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId: params.id,
      applicantId: auth.userId,
    });

    if (existingApplication) {
      return NextResponse.json(
        { message: 'You have already applied for this job' },
        { status: 400 }
      );
    }

    // Create application
    const application = new Application({
      jobId: params.id,
      applicantId: auth.userId,
      status: 'pending',
      appliedAt: new Date(),
    });

    await application.save();

    // Increment application count
    await Job.findByIdAndUpdate(params.id, {
      $inc: { applicationsCount: 1 }
    });

    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationId: application._id,
    });

  } catch (error) {
    console.error('Apply job error:', error);
    return NextResponse.json(
      { message: 'Failed to submit application' },
      { status: 500 }
    );
  }
}