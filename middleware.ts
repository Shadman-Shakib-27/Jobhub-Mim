import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ['/seeker', '/employer', '/admin', '/chat'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Auth routes that should redirect if already logged in
  const authRoutes = ['/auth/login', '/auth/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  // Redirect to login if accessing protected route without token
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Redirect to appropriate dashboard if accessing auth routes with token
  if (isAuthRoute && token) {
    // Note: In a real app, you'd decode the JWT to get the user role
    return NextResponse.redirect(new URL('/seeker/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};