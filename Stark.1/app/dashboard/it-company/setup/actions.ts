"use server"

import { createClient } from "@/lib/supabase/server"

interface SetupResult {
  success: boolean
  error?: string
}

export async function setupITCompany(formData: {
  company_name: string
  voen: string
  residency_status: string
  main_service: string
}): Promise<SetupResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    console.log("[IT COMPANY SETUP] Creating IT company for user:", user.id, formData)

    const { error } = await supabase.from("it_companies").upsert(
      {
        user_id: user.id,
        company_name: formData.company_name,
        voen: formData.voen,
        residency_status: formData.residency_status,
        main_service: formData.main_service,
      },
      { onConflict: "user_id" }
    )

    if (error) {
      console.error("[IT COMPANY SETUP] Insert error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return { success: false, error: error.message }
    }

    console.log("[IT COMPANY SETUP] Success for user:", user.id)
    return { success: true }
  } catch (error) {
    console.error("[IT COMPANY SETUP] Unexpected error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
