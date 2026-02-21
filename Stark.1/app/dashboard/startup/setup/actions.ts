"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { generateStartupId } from "@/lib/utils"

interface SetupResult {
  success: boolean
  error?: string
}

export async function setupStartup(formData: {
  company_name: string
  industry: string
  stage: string
  team_size: number
  pitch_deck_url?: string
}): Promise<SetupResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    console.log("[STARTUP SETUP] Creating startup for user:", user.id, formData)

    // Generate a unique startup_id with simple collision retry
    let startupId = generateStartupId()
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      const { error: insertError } = await supabase
        .from("profiles")
        .update({ startup_id: startupId })
        .eq("id", user.id)
        .eq("role", "startup")
        .is("startup_id", null)

      if (!insertError) {
        break // success
      }

      // If unique constraint violation, retry with a new ID
      if (insertError.code === "23505") {
        attempts += 1
        startupId = generateStartupId()
        continue
      }

      console.error("[STARTUP SETUP] Failed to set startup_id:", insertError)
      return { success: false, error: insertError.message }
    }

    if (attempts >= maxAttempts) {
      console.error("[STARTUP SETUP] Too many collisions generating startup_id")
      return { success: false, error: "Failed to generate unique startup ID" }
    }

    const { error } = await supabase.from("startups").upsert(
      {
        user_id: user.id,
        company_name: formData.company_name,
        industry: formData.industry,
        stage: formData.stage,
        team_size: formData.team_size,
        pitch_deck_url: formData.pitch_deck_url || null,
      },
      { onConflict: "user_id" }
    )

    if (error) {
      console.error("[STARTUP SETUP] Insert error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
      return { success: false, error: error.message }
    }

    console.log("[STARTUP SETUP] Success for user:", user.id, "startup_id:", startupId)
    return { success: true }
  } catch (error) {
    console.error("[STARTUP SETUP] Unexpected error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
