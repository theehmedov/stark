import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // For hackathon - hardcoded credentials (temporary solution)
  const supabaseUrl = "https://bjsdagwquuontqgvdtdx.supabase.co"
  const supabaseAnonKey = "sb_publishable_9JeQ0326vVqrkbZJdWDHxg_MkDRgNep"

  console.log(' [MIDDLEWARE] Using hardcoded Supabase URL:', supabaseUrl.substring(0, 20) + '...')

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }: any) => {
            request.cookies.set(name, value)
          })

          supabaseResponse = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }: any) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
