import { createClient } from '@/lib/supabase/server'

interface LogActionParams {
  user_id: string
  action: string
  details?: Record<string, any>
  ip_address?: string | null
}

export async function logAction({
  user_id,
  action,
  details = {},
  ip_address = null,
}: LogActionParams): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('audit_logs').insert({
      user_id,
      action,
      details,
      ip_address,
    })

    if (error) {
      console.error('Error logging action:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in logAction:', error)
    return { success: false, error: 'Failed to log action' }
  }
}

export async function getUserAuditLogs(
  user_id: string,
  limit: number = 50
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching audit logs:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getUserAuditLogs:', error)
    return { data: null, error: 'Failed to fetch audit logs' }
  }
}
