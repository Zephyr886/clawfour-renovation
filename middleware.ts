import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from './lib/auth'

export function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  const path = request.nextUrl.pathname

  if (path.startsWith('/api/auth/login')) return NextResponse.next()

  if (!token) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', encodeURIComponent(path))
    return NextResponse.redirect(url)
  }

  const payload = verifyToken(token)
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete(COOKIE_NAME)
    return response
  }

  if (path.startsWith('/admin') && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  if (path.startsWith('/homeowner') && payload.role !== 'HOMEOWNER' && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (path.startsWith('/company') && payload.role !== 'COMPANY' && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/homeowner/:path*',
    '/company/:path*',
    '/admin/:path*',
    '/api/timelines/:path*',
    '/api/nodes/:path*',
    '/api/materials/:path*',
    '/api/admin/:path*'
  ],
}
