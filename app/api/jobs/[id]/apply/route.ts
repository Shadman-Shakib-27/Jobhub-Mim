import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Job } from '@/lib/models/Job';
import { Application } from '@/lib/models/Application';
import { authenticateRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'seeker') {
      return NextResponse.json(
        { success: false, message: 'Job seeker authentication required' },
        { status: 401 }
      );
    }

    const job = await Job.findById(params.id);
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId: params.id,
      seekerId: auth.userId
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: 'You have already applied to this job' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const application = new Application({
      jobId: params.id,
      seekerId: auth.userId,
      employerId: job.employerId,
      coverLetter: body.coverLetter,
      statusHistory: [{
        status: 'pending',
        updatedAt: new Date(),
        updatedBy: auth.userId
      }]
    });

    await application.save();

    // Update job applications count
    job.applicationsCount += 1;
    await job.save();

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    console.error('Application error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}