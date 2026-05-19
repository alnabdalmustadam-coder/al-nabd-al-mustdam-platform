import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const cleanHeaders = new Headers(request.headers)
  const rawCookie = cleanHeaders.get('cookie')
  if (rawCookie) {
    // Safely encode any non-ASCII characters in the cookie header to prevent ByteString crashes
    const cleanCookie = rawCookie.replace(/[^\x00-\x7F]/g, (char) => encodeURIComponent(char))
    cleanHeaders.set('cookie', cleanCookie)
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: cleanHeaders,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(c => ({
            ...c,
            value: decodeURIComponent(c.value)
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => 
            request.cookies.set(name, encodeURIComponent(value))
          )
          supabaseResponse = NextResponse.next({
            request: {
              headers: cleanHeaders,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, encodeURIComponent(value), options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Protected Routes Logic
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'TRAINEE'

    if (pathname.startsWith('/dashboard/admin') && role !== 'ADMIN') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${role.toLowerCase()}`
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/dashboard/trainer') && role !== 'TRAINER' && role !== 'ADMIN') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${role.toLowerCase()}`
      return NextResponse.redirect(url)
    }
    
    if (pathname === '/dashboard') {
      const url = request.nextUrl.clone()
      url.pathname = `/dashboard/${role.toLowerCase()}`
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
    if (user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
