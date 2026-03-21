import { NextResponse, type NextRequest } from 'next/server'


export function middleware(request: NextRequest) {
      const pathname = request.nextUrl.pathname
      if (pathname === '/') {
              const hasCookie = request.cookies.getAll().some(c => c.name.includes('-auth-token'))
              return NextResponse.redirect(new URL(hasCookie ? '/dashboard' : '/login', request.url))
      }
      return NextResponse.next()
}

export const config = {
      matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
