import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // For hackathon - hardcoded credentials (temporary solution)
  const supabaseUrl = "https://bjsdagwquuontqgvdtdx.supabase.co"
  const supabaseAnonKey = "sb_publishable_9JeQ0326vVqrkbZJdWDHxg_MkDRgNep"

  console.log('🔍 [SERVER] Using hardcoded Supabase URL:', supabaseUrl.substring(0, 20) + '...')

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            )
          } catch {
          }
        },
      },
    }
  )
}
