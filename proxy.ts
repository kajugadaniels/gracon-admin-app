// Route protection — all protected routes require the admin_session cookie.
// Public routes: /login, /set-password (invite flow).
// Everything else requires an active admin session.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/set-password'];
const SESSION_COOKIE = 'admin_session';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has(SESSION_COOKIE);

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Authenticated admin visiting login → send to dashboard
  if (isPublic && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Unauthenticated admin visiting protected route → send to login
  if (!isPublic && !hasSession) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)).*)',
  ],
};
