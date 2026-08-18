import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function toSafeByteString(val: string): string {
  if (typeof val !== 'string') return ''
  if (/[^\x00-\x7F]/.test(val)) {
    return encodeURIComponent(val)
  }
  return val
}

function fromSafeByteString(val: string): string {
  if (typeof val !== 'string') return ''
  if (val.includes('%')) {
    try {
      return decodeURIComponent(val)
    } catch {
      return val
    }
  }
  return val
}

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return supabaseResponse;
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            try {
              return request.cookies.getAll().map(c => ({
                name: c.name,
                value: fromSafeByteString(c.value),
              }))
            } catch {
              return []
            }
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value }) => {
                request.cookies.set(name, toSafeByteString(value))
              })
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) => {
                supabaseResponse.cookies.set(name, toSafeByteString(value), options)
              })
            } catch {
              // Ignore cookie set errors
            }
          },
        },
      }
    )

    let user = null;
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch {
      user = null
    }

    const { pathname } = request.nextUrl

    // 1. Legacy /login path redirect to /auth/login
    if (pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    // 2. Protect Admin Dashboard Routes (/dashboard/admin/*)
    if (pathname.startsWith('/dashboard/admin')) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }

      // Check User Role from metadata or fallback
      const userRole = (user.user_metadata?.role || 'STUDENT').toUpperCase();

      // If user is a student, deny access to admin dashboard and redirect to student dashboard
      if (userRole === 'STUDENT' || userRole === 'TRAINEE') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/student'
        return NextResponse.redirect(url)
      }
    }

    // 3. Protect Student Dashboard Routes (/dashboard/student/*)
    if (pathname.startsWith('/dashboard/student')) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }
    }

    // 4. Auto Redirect Authenticated Users Away from Auth Pages (/auth/login, /auth/register)
    if (pathname === '/auth/login' || pathname === '/auth/register') {
      if (user) {
        const redirectParam = request.nextUrl.searchParams.get('redirect');
        if (redirectParam && redirectParam.startsWith('/')) {
          const url = request.nextUrl.clone()
          url.pathname = redirectParam
          url.search = ''
          return NextResponse.redirect(url)
        }

        const userRole = (user.user_metadata?.role || 'STUDENT').toUpperCase();

        const url = request.nextUrl.clone()
        if (userRole === 'ADMIN' || userRole === 'INSTRUCTOR' || userRole === 'TRAINER') {
          url.pathname = '/dashboard/admin'
        } else {
          url.pathname = '/dashboard/student'
        }
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware updateSession error:', error)
    return NextResponse.next({ request })
  }
}
