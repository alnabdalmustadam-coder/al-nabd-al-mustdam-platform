import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/auth-helpers'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/register',
    '/login',
  ],
}
