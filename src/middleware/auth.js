import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function authenticateUser(request) {
  try {
    // 1. Get token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: 'Authorization token required',
        status: 401
      };
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Connect to database
    await connectToDatabase();

    // 4. Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return {
        error: 'User not found',
        status: 401
      };
    }

    // 5. Return user for route handler
    return { user };

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      error: 'Authentication failed',
      status: 401
    };
  }
} 