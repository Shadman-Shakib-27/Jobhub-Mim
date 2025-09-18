import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Application } from '@/lib/models/Application';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const auth = await authenticateRequest(request);
    if (!auth || auth.role !== 'seeker') {
      return NextResponse.json(
        { success: false, message: 'Job seeker authentication required' },
        { status: 401 }
      );
    }

    const applications = await Application.find({ seekerId: auth.userId })
      .populate('jobId', 'title company location type salary status')
      .populate('employerId', 'firstName lastName companyName')
      .sort({ appliedAt: -1 });

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}