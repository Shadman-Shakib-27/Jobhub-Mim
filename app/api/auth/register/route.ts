import { signToken } from '@/lib/auth';
import { User } from '@/lib/models/User';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    console.log('Register API called'); // Debug log

    await connectDB();
    console.log('Database connected'); // Debug log

    const body = await request.json();
    console.log('Request body:', body); // Debug log

    const { email, password, firstName, lastName, role, companyName } = body;

    // Validation
    if (!email || !password || !firstName || !lastName || !role) {
      console.log('Validation failed: Missing fields'); // Debug log
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log('Validation failed: Password too short'); // Debug log
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (role === 'employer' && !companyName) {
      console.log('Validation failed: Company name missing'); // Debug log
      return NextResponse.json(
        { message: 'Company name is required for employers' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('Checking if user exists:', email); // Debug log
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists'); // Debug log
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user data (password will be hashed by pre-save middleware)
    const userData: any = {
      email: email.toLowerCase().trim(), // Normalize email
      password, // Raw password - will be hashed by User model
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      isVerified: false,
    };

    if (role === 'employer' && companyName) {
      userData.companyName = companyName.trim();
    }

    console.log('Creating user with data:', {
      ...userData,
      password: '[HIDDEN]',
    }); // Debug log

    // Create and save user
    const user = new User(userData);
    const savedUser = await user.save();

    console.log('User created with ID:', savedUser._id); // Debug log

    // Generate JWT
    const token = signToken({
      userId: savedUser._id.toString(),
      role: savedUser.role,
    });

    console.log('Token generated'); // Debug log

    // Format response using model's toJSON transform
    const userResponse = savedUser.toJSON();

    console.log('Sending success response'); // Debug log

    return NextResponse.json(
      {
        token,
        user: userResponse,
      },
      { status: 201 }
    ); // 201 for resource created
  } catch (error: any) {
    console.error('Registration error details:', error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { message: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Server error during registration' },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
