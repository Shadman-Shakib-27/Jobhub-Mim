// app/api/jobs/[id]/apply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Application } from '@/lib/models/Application';
import { Job } from '@/lib/models/Job';
import { User } from '@/lib/models/User';
import { authenticateRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { message: 'Please login to apply for jobs' },
        { status: 401 }
      );
    }

    if (auth.role !== 'seeker') {
      return NextResponse.json(
        { message: 'Only job seekers can apply for jobs' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const jobId = params.id;
    const body = await request.json();
    
    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { message: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'active') {
      return NextResponse.json(
        { message: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      jobId,
      applicantId: auth.userId,
    });

    if (existingApplication) {
      return NextResponse.json(
        { message: 'You have already applied for this job' },
        { status: 400 }
      );
    }

    // Validate application data
    const { coverLetter, expectedSalary, availableFrom } = body;

    // Create application
    const applicationData = {
      jobId,
      applicantId: auth.userId,
      coverLetter: coverLetter?.trim() || null,
      expectedSalary: expectedSalary ? Number(expectedSalary) : null,
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      status: 'pending',
      appliedAt: new Date(),
    };

    const application = new Application(applicationData);
    const savedApplication = await application.save();

    // Increment applications count on job
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });

    // Populate application with job and user details for response
    const populatedApplication = await Application.findById(savedApplication._id)
      .populate('jobId', 'title company location salary type')
      .populate('applicantId', 'firstName lastName email')
      .lean();

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: populatedApplication,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Apply job error:', error);
    
    // Handle duplicate application error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'You have already applied for this job' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// Get application details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const jobId = params.id;
    
    const application = await Application.findOne({
      jobId,
      applicantId: auth.userId,
    })
    .populate('jobId')
    .populate('applicantId', 'firstName lastName email')
    .lean();

    if (!application) {
      return NextResponse.json(
        { message: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(application);

  } catch (error) {
    console.error('Get application error:', error);
    return NextResponse.json(
      { message: 'Failed to get application' },
      { status: 500 }
    );
  }
}