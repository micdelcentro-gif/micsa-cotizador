import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
        return NextResponse.next()
}

export const config = {
        matcher: ['/_middleware_disabled'],
}
