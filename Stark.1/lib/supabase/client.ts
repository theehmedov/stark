import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

// Browser client for client components
// Uses hardcoded credentials for hackathon
export function createClient() {
  const supabaseUrl = "https://bjsdagwquuontqgvdtdx.supabase.co"
  const supabaseAnonKey = "sb_publishable_9JeQ0326vVqrkbZJdWDHxg_MkDRgNep"

  console.log('🔍 [CLIENT] Using hardcoded Supabase URL:', supabaseUrl.substring(0, 20) + '...')

  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey)
}
