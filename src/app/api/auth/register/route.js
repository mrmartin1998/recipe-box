import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // 1. Connect to database
    await connectToDatabase();

    // 2. Get request data
    const { email, password, name } = await request.json();

    // 3. Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      preferences: {
        measurementUnit: 'metric',  // default value
        theme: 'light',            // default value
        notifications: {
          lowStock: true,          // default value
          expiryWarning: true      // default value
        }
      }
    });

    // 7. Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 8. Return response (excluding password)
    const userWithoutPassword = {
      _id: user._id,
      email: user.email,
      name: user.name,
      preferences: user.preferences
    };

    return NextResponse.json({
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}