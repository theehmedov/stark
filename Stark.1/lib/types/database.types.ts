export type UserRole = 'admin' | 'startup' | 'investor' | 'it_company' | 'individual'

export type SubRole = 'mentor' | 'jury'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  sub_role: SubRole | null
  cv_url: string | null
  approval_status: ApprovalStatus
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  details: Record<string, any> | null
  ip_address: string | null
  created_at: string
}
