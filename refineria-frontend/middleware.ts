import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('goldtrack_session')?.value;
  const path = request.nextUrl.pathname;

  if (!sessionCookie && path !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (sessionCookie) {
    const payload = decodeJwtPayload(sessionCookie);

    if (!payload) {
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('goldtrack_session');
      return res;
    }

    if (path === '/login') {
      return NextResponse.redirect(
        new URL(payload.role === 'SUPERADMIN' || payload.role === 'OWNER' ? '/' : '/transacciones', request.url)
      );
    }

    if (path === '/' && payload.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/transacciones', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
