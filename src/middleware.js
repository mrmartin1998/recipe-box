import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const protectedPaths = [
  '/dashboard',
  '/recipes',
  '/shopping-lists',
  '/meal-plans',
  '/profile',
  '/settings'
]

const publicPaths = ['/', '/login', '/register']

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  )
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path
  )

  // For protected routes, we'll let the client-side handle the auth check
  if (isProtectedPath) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 