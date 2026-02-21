import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = "https://bjsdagwquuontqgvdtdx.supabase.co"
const supabaseAnonKey = "sb_publishable_9JeQ0326vVqrkbZJdWDHxg_MkDRgNep"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Collect cookies that need to be set on any response (including redirects)
  let cookiesToReturn: { name: string; value: string; options?: any }[] = []

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          // Store cookies so we can apply them to ANY response (including redirects)
          cookiesToReturn = cookiesToSet
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Helper: apply stored cookies to a redirect response
  function redirectWithCookies(url: string): NextResponse {
    const redirectResponse = NextResponse.redirect(new URL(url, request.url))
    cookiesToReturn.forEach(({ name, value, options }) =>
      redirectResponse.cookies.set(name, value, options)
    )
    return redirectResponse
  }

  // Refresh the session — this updates auth cookies
  const { data: { user } } = await supabase.auth.getUser()

  console.log("[MIDDLEWARE]", path, "| user:", user?.id ?? "NONE")

  // Dashboard routes: require auth + role-based routing
  if (path.startsWith('/dashboard')) {
    if (!user) {
      console.log("[MIDDLEWARE] No session — redirect to /login")
      return redirectWithCookies('/login')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, sub_role')
      .eq('id', user.id)
      .single()

    console.log("[MIDDLEWARE] profile:", profile?.role ?? "NULL", "| error:", profileError?.message ?? "none")

    if (!profile) {
      // Allow through — dashboard/page.tsx will show fallback UI
      return response
    }

    // Shared routes accessible by any authenticated user (skip role-based redirect)
    const sharedPaths = ['/dashboard/explore']
    if (sharedPaths.some((sp) => path.startsWith(sp))) {
      return response
    }

    // Special-case: allow judging workspace for judges and jury members.
    if (path.startsWith('/dashboard/judge')) {
      const isJudge = profile.role === 'judge' || (profile.role === 'individual' && profile.sub_role === 'jury')
      if (isJudge) {
        return response
      }
    }

    const roleBasedPaths: Record<string, string> = {
      admin: '/dashboard/admin',
      judge: '/dashboard/judge',
      startup: '/dashboard/startup',
      investor: '/dashboard/investor',
      it_company: '/dashboard/it-company',
      individual: '/dashboard/individual',
    }

    const normalizedRole = profile.role?.replace(/-/g, '_')
    const expectedPath = normalizedRole ? roleBasedPaths[normalizedRole] : undefined

    // If role is unknown/null, allow through and let the app handle it.
    if (!expectedPath) {
      console.log("[MIDDLEWARE] Unknown role — allow through:", profile.role)
      return response
    }

    // Only redirect when the user hits /dashboard root, or tries to access another role's base path.
    if (path === '/dashboard' || !path.startsWith(expectedPath)) {
      console.log("[MIDDLEWARE] Redirecting to", expectedPath)
      return redirectWithCookies(expectedPath)
    }
  }

  // Login/Register routes: redirect authenticated users to their dashboard
  if ((path === '/login' || path === '/register') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      const roleBasedPaths: Record<string, string> = {
        admin: '/dashboard/admin',
        startup: '/dashboard/startup',
        investor: '/dashboard/investor',
        it_company: '/dashboard/it-company',
        individual: '/dashboard/individual',
      }
      const normalizedRole = profile.role?.replace(/-/g, '_')
      const target = normalizedRole ? roleBasedPaths[normalizedRole] : undefined
      if (target) {
        console.log("[MIDDLEWARE] Authenticated user on /login — redirect to", target)
        return redirectWithCookies(target)
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
