import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from './authUtils';

export async function withAuth(request, handler) {
  const token = getTokenFromHeader(request);
  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  request.user = { _id: decoded.userId };
  return handler(request);
} 