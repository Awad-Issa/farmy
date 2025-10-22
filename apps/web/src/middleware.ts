import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './i18n';

// Create the i18n middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});

// Public routes that don't require authentication
const publicRoutes = ['/login', '/register'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // First, handle i18n
  const response = intlMiddleware(request);
  
  // Extract locale from pathname (e.g., /en/dashboard -> en)
  const pathnameLocale = pathname.split('/')[1];
  const locale = locales.includes(pathnameLocale as any) ? pathnameLocale : 'en';
  
  // Get the path without locale (e.g., /en/dashboard -> /dashboard)
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathWithoutLocale.startsWith(route));
  
  // Check for auth token in cookies
  const authToken = request.cookies.get('auth_token')?.value;
  
  // If not authenticated and trying to access protected route
  if (!authToken && !isPublicRoute) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If authenticated and trying to access login/register, redirect to dashboard
  if (authToken && isPublicRoute) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  return response;
}

export const config = {
  // Match all pathnames except for static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

