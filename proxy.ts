import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/auth-helpers'

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (error) {
    console.error('Proxy execution error:', error)
    return NextResponse.next({ request })
  }
}

// Fallback for middleware naming
export async function middleware(request: NextRequest) {
  return proxy(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
