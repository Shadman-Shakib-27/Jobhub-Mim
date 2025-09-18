import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Job } from '@/lib/models/Job';
import { authenticateRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const job = await Job.findById(params.id)
      .populate('employerId', 'firstName lastName companyName avatar companyDescription');

    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    // Increment view count
    job.viewsCount += 1;
    await job.save();

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error('Job fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'employer') {
      return NextResponse.json(
        { success: false, message: 'Employer authentication required' },
        { status: 401 }
      );
    }

    const job = await Job.findOne({ _id: params.id, employerId: auth.userId });
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job not found or unauthorized' },
        { status: 404 }
      );
    }

    const body = await request.json();
    Object.assign(job, body);
    await job.save();

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  } catch (error) {
    console.error('Job update error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'employer') {
      return NextResponse.json(
        { success: false, message: 'Employer authentication required' },
        { status: 401 }
      );
    }

    const job = await Job.findOne({ _id: params.id, employerId: auth.userId });
    if (!job) {
      return NextResponse.json(
        { success: false, message: 'Job not found or unauthorized' },
        { status: 404 }
      );
    }

    await Job.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Job deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}