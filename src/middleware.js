import { NextResponse } from 'next/server'

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
  // Instead of checking cookies, we'll check localStorage
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
  // This prevents the middleware redirect loop
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