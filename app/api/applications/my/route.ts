// app/api/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Application } from '@/lib/models/Application';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    
    // Build query
    let query: any = { applicantId: auth.userId };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Get applications with pagination
    const skip = (page - 1) * limit;
    
    // Determine sort order
    let sortOrder: any = { appliedAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortOrder = { appliedAt: 1 };
    } else if (sort === 'status') {
      sortOrder = { status: 1, appliedAt: -1 };
    }
    
    const [applicationsData, total] = await Promise.all([
      Application.find(query)
        .populate({
          path: 'jobId',
          select: 'title company location salary type status postedAt companyLogo description requirements benefits',
        })
        .sort(sortOrder)
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(query),
    ]);
    
    // Transform data to match frontend expectations
    let applications = applicationsData.map(app => ({
      ...app,
      id: app._id?.toString(), // Convert ObjectId to string
      job: app.jobId, // Map jobId to job for frontend consistency
    }));
    
    // Client-side search if search parameter is provided
    if (search) {
      const searchLower = search.toLowerCase();
      applications = applications.filter(app => 
        app.job?.title?.toLowerCase().includes(searchLower) ||
        app.job?.company?.toLowerCase().includes(searchLower)
      );
    }
    
    // Client-side sorting for company names if needed
    if (sort === 'company') {
      applications.sort((a, b) => 
        (a.job?.company || '').localeCompare(b.job?.company || '')
      );
    }
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
    
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { message: 'Failed to get applications' },
      { status: 500 }
    );
  }
}