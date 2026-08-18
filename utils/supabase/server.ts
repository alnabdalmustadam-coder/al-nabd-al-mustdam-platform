import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          try {
            return cookieStore.getAll().map(c => ({
              name: c.name,
              value: fromSafeByteString(c.value),
            }))
          } catch {
            return []
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, toSafeByteString(value), options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
