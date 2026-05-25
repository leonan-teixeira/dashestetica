import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/admin/login'];
const ADMIN_PATHS = ['/admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has('app_authed');
  const isAdmin = request.cookies.has('app_admin');
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p));

  // Admin routes: require app_admin cookie
  if (isAdminPath && !pathname.startsWith('/admin/login')) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Admin login: redirect to admin panel if already admin
  if (pathname.startsWith('/admin/login') && isAdmin) {
    return NextResponse.redirect(new URL('/admin/clinicas', request.url));
  }

  // Regular login: redirect to dashboard if already authenticated
  if (hasSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protected routes: require app_authed cookie
  if (!hasSession && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
};
