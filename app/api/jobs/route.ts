// @ts-nocheck
// app/api/jobs/route.ts
import { Job } from '@/lib/models/Job';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';
    const experienceLevel = searchParams.get('experienceLevel') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Build query object
    let query: any = {
      status: 'active',
      expiresAt: { $gt: new Date() }, // Only active and not expired jobs
    };

    // Add search filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (experienceLevel && experienceLevel !== 'all') {
      query.experienceLevel = experienceLevel;
    }

    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case 'oldest':
        sort.postedAt = 1;
        break;
      case 'salary-high':
        sort['salary.max'] = -1;
        break;
      case 'salary-low':
        sort['salary.min'] = 1;
        break;
      default: // newest
        sort.postedAt = -1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Job.countDocuments(query),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      jobs,
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
    console.error('Jobs API error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// Create new job (for employers)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'title',
      'company',
      'companyId',
      'location',
      'type',
      'category',
      'salary',
      'experienceLevel',
      'description',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new job
    const job = new Job({
      ...body,
      postedAt: new Date(),
      status: 'active',
    });

    await job.save();

    return NextResponse.json(job.toJSON(), { status: 201 });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { message: 'Failed to create job' },
      { status: 500 }
    );
  }
}
