"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

interface RegisterResult {
  success: boolean
  error?: string
  redirectTo?: string
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: string
): Promise<RegisterResult> {
  // Validate role against allowed enum values
  const validRoles = ["startup", "investor", "it_company", "individual", "admin"]
  if (!validRoles.includes(role)) {
    console.error(`[REGISTER] Invalid role value: "${role}"`)
    return { success: false, error: `Invalid role: ${role}` }
  }

  try {
    const supabase = await createClient()

    // Step 1: Sign up with metadata for the trigger to use.
    // The handle_new_user() trigger should create the profile row automatically.
    // Step 2 below acts as a fallback upsert in case the trigger is missing or fails.
    console.log(`[REGISTER] Attempting signup for ${email} with role ${role}`)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    if (signUpError) {
      console.error("[REGISTER] Auth signUp error:", {
        message: signUpError.message,
        status: signUpError.status,
        code: (signUpError as any).code,
      })
      return { success: false, error: signUpError.message }
    }

    if (!data.user) {
      console.error("[REGISTER] No user returned after signUp")
      return { success: false, error: "Registration failed — no user created" }
    }

    console.log(`[REGISTER] Auth user created: ${data.user.id}`)

    // Step 2: Explicitly insert the profile row
    // The RLS policy allows INSERT when auth.uid() = id
    // Since we just signed up, the session should be active
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          role: role,
          full_name: fullName,
        },
        { onConflict: "id" }
      )

    if (profileError) {
      console.error("[REGISTER] Profile insert error:", {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      })
      // Don't fail registration entirely — the auth user exists.
      // The profile can be created on next login or by an admin.
      return {
        success: true,
        error: `Account created but profile setup failed: ${profileError.message}. Please contact support.`,
      }
    }

    console.log(`[REGISTER] Profile created for user ${data.user.id} with role ${role}`)

    // Step 3: Log the registration action (non-blocking, don't fail on this)
    try {
      await logAction({
        user_id: data.user.id,
        action: "user_registration",
        details: { email: data.user.email, role },
      })
    } catch (logErr) {
      console.error("[REGISTER] Audit log failed (non-critical):", logErr)
    }

    return { success: true }
  } catch (error) {
    console.error("[REGISTER] Unexpected error:", error)
    return { success: false, error: "An unexpected error occurred during registration" }
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
