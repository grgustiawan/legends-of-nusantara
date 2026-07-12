import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let role = request.cookies.get('auth_role')?.value;
  const userId = request.cookies.get('user_id')?.value;

  if (role === 'player' && !userId) {
    role = undefined;
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/videos') ||
    pathname.startsWith('/sounds') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const isRootOrLogin = pathname === '/' || pathname === '/login';
  const isAdminLogin = pathname === '/admin/login';
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isPlayerRoute = ['/menu', '/gacha', '/inventory', '/trade', '/profile', '/showcase'].some((route) => pathname.startsWith(route));

  if (!role) {
    if (isAdminRoute) {
      const res = NextResponse.redirect(new URL('/admin/login', request.url));
      res.cookies.delete('auth_role');
      return res;
    }
    if (isPlayerRoute) {
      const res = NextResponse.redirect(new URL('/', request.url));
      res.cookies.delete('auth_role');
      return res;
    }

    const response = NextResponse.next();
    if (request.cookies.has('auth_role')) {
      response.cookies.delete('auth_role');
    }
    return response;
  }

  if (role === 'admin') {
    if (isPlayerRoute || isRootOrLogin || isAdminLogin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (role === 'player') {
    if (isAdminRoute || isAdminLogin || isRootOrLogin) {
      return NextResponse.redirect(new URL('/menu', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
