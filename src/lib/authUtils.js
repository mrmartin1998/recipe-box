import { NextResponse } from 'next/server';
import { authenticateUser } from '@/middleware/auth';

export async function withAuth(request, handler) {
  // 1. Authenticate user
  const authResult = await authenticateUser(request);
  
  // 2. Check for authentication errors
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  // 3. Add user to request and continue
  request.user = authResult.user;
  return handler(request);
} 