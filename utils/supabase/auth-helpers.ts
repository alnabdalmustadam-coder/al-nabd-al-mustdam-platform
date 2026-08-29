import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_ROLES, INSTRUCTOR_ROLES, normalizeRole } from '@/lib/security/auth'

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
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value }) => {
                request.cookies.set(name, value)
              })
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) => {
                supabaseResponse.cookies.set(name, value, options)
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

    // Resolve effective user role (from app_metadata, user_metadata, or profiles table)
    let userRole = normalizeRole(user?.app_metadata?.role);
    if (user && (!user.app_metadata?.role || userRole === 'STUDENT')) {
      if (user.user_metadata?.role && normalizeRole(user.user_metadata.role) !== 'STUDENT') {
        userRole = normalizeRole(user.user_metadata.role);
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        if (profile?.role) {
          userRole = normalizeRole(profile.role);
        }
      }
    }

    // 2. Protect Admin Dashboard Routes (/dashboard/admin/*)
    if (pathname.startsWith('/dashboard/admin')) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }

      if (!(ADMIN_ROLES as readonly string[]).includes(userRole)) {
        const url = request.nextUrl.clone()
        url.pathname = (INSTRUCTOR_ROLES as readonly string[]).includes(userRole)
          ? '/dashboard/instructor'
          : '/dashboard/student'
        return NextResponse.redirect(url)
      }
    }

    // 3. Protect Instructor Dashboard Routes
    if (pathname.startsWith('/dashboard/instructor')) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
      }

      const isAllowed =
        (ADMIN_ROLES as readonly string[]).includes(userRole) ||
        (INSTRUCTOR_ROLES as readonly string[]).includes(userRole)

      if (!isAllowed) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/student'
        return NextResponse.redirect(url)
      }
    }

    // 4. Protect Student Dashboard Routes (/dashboard/student/*)
    if (pathname.startsWith('/dashboard/student') && !user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // 5. Auto Redirect Authenticated Users Away from Auth Pages
    if (pathname === '/auth/login' || pathname === '/auth/register') {
      if (user) {
        const redirectParam = request.nextUrl.searchParams.get('redirect');
        if (redirectParam && redirectParam.startsWith('/')) {
          // Only honor redirectParam if user role is authorized for it
          const isValidTarget =
            ((ADMIN_ROLES as readonly string[]).includes(userRole) && redirectParam.startsWith('/dashboard/admin')) ||
            ((INSTRUCTOR_ROLES as readonly string[]).includes(userRole) && redirectParam.startsWith('/dashboard/instructor')) ||
            (userRole === 'STUDENT' && redirectParam.startsWith('/dashboard/student'));

          if (isValidTarget) {
            const url = request.nextUrl.clone()
            url.pathname = redirectParam
            url.search = ''
            return NextResponse.redirect(url)
          }
        }

        const url = request.nextUrl.clone()
        if ((ADMIN_ROLES as readonly string[]).includes(userRole)) {
          url.pathname = '/dashboard/admin'
        } else if ((INSTRUCTOR_ROLES as readonly string[]).includes(userRole)) {
          url.pathname = '/dashboard/instructor'
        } else {
          url.pathname = '/dashboard/student'
        }
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error('Proxy updateSession error:', error)
    const { pathname } = request.nextUrl
    if (pathname.startsWith('/dashboard/')) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('message', 'تعذر التحقق من الجلسة')
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }
}
