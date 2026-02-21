import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

// Browser-only client for client components
// Uses hardcoded credentials for hackathon
export function createBrowserClient() {
  const supabaseUrl = "https://bjsdagwquuontqgvdtdx.supabase.co"
  const supabaseAnonKey = "sb_publishable_9JeQ0326vVqrkbZJdWDHxg_MkDRgNep"

  console.log('🔍 [BROWSER] Using hardcoded Supabase URL:', supabaseUrl.substring(0, 20) + '...')

  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
}
