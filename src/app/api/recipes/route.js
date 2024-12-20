import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/authUtils';

export async function POST(request) {
  return withAuth(request, async (req) => {
    try {
      // req.user is now available with authenticated user data
      const userId = req.user._id;
      
      // Your route logic here...
      
    } catch (error) {
      console.error('Recipe creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create recipe' },
        { status: 500 }
      );
    }
  });
} 