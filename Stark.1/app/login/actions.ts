"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

interface LoginResult {
  success: boolean
  error?: string
  redirectUrl?: string
}

export async function signIn(email: string, password: string): Promise<LoginResult> {
  try {
    console.log("[LOGIN] Attempting sign in for:", email)
    const supabase = await createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error("[LOGIN] Auth error:", {
        message: signInError.message,
        status: signInError.status,
        code: (signInError as any).code,
      })
      return { success: false, error: signInError.message }
    }

    if (!data.user) {
      console.error("[LOGIN] No user returned after signIn")
      return { success: false, error: "Login failed" }
    }

    console.log("[LOGIN] Auth successful for user:", data.user.id)

    // Log the action (non-blocking — don't let audit failure break login)
    logAction({
      user_id: data.user.id,
      action: "user_login",
      details: { email: data.user.email },
    }).catch((err) => console.error("[LOGIN] Audit log failed (non-critical):", err))

    // Get user profile for role-based redirect
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("[LOGIN] Profile fetch error:", {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
      })
    }

    let redirectUrl = "/dashboard"
    if (profile) {
      console.log("[LOGIN] User role:", profile.role)
      switch (profile.role) {
        case "admin":
          redirectUrl = "/dashboard/admin"
          break
        case "startup":
          redirectUrl = "/dashboard/startup"
          break
        case "investor":
          redirectUrl = "/dashboard/investor"
          break
        case "it_company":
          redirectUrl = "/dashboard/it-company"
          break
        case "individual":
          redirectUrl = "/dashboard/individual"
          break
      }
    } else {
      console.warn("[LOGIN] No profile found — redirecting to /dashboard")
    }

    console.log("[LOGIN] Returning redirectUrl:", redirectUrl)
    return { success: true, redirectUrl }
  } catch (error) {
    console.error("[LOGIN] Unexpected error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

interface LogActionParams {
  user_id: string
  action: string
  details?: Record<string, any>
  ip_address?: string | null
}

async function logAction({
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
