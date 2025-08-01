import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // Extract tenant from subdomain
  let tenant = 'demo' // Default for localhost
  
  if (hostname.includes('accesswash.org')) {
    tenant = hostname.split('.')[0]
  } else if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // For local development, check if there's a tenant in the path
    const pathSegments = request.nextUrl.pathname.split('/')
    if (pathSegments[1] && pathSegments[1] !== 'api') {
      tenant = pathSegments[1]
    }
  }
  
  // Create response and add tenant header
  const response = NextResponse.next()
  response.headers.set('x-tenant', tenant)
  
  return response
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
}