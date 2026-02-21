"use server"

import { createClient } from "@/lib/supabase/server"

interface SetupResult {
  success: boolean
  error?: string
}

export async function setupIndividual(formData: FormData): Promise<SetupResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const subRole = formData.get("sub_role") as string
    const fullName = formData.get("full_name") as string
    const cvFile = formData.get("cv_file") as File | null

    if (!subRole || !["mentor", "jury"].includes(subRole)) {
      return { success: false, error: "Please select a valid role (Mentor or Jury)" }
    }

    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: "Please enter your full name" }
    }

    if (!cvFile || cvFile.size === 0) {
      return { success: false, error: "Please upload your CV (PDF, DOC, or DOCX)" }
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(cvFile.type)) {
      return { success: false, error: "Only PDF, DOC, or DOCX files are allowed" }
    }

    if (cvFile.size > 10 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 10MB" }
    }

    const fileExt = cvFile.name.split(".").pop()?.toLowerCase() || "pdf"
    const filePath = `${user.id}/cv_${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, cvFile, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      console.error("[INDIVIDUAL SETUP] Upload error:", uploadError.message)
      return { success: false, error: `File upload failed: ${uploadError.message}` }
    }

    const { data: urlData } = supabase.storage
      .from("resumes")
      .getPublicUrl(filePath)

    const cvUrl = urlData.publicUrl

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        sub_role: subRole,
        cv_url: cvUrl,
        approval_status: "pending",
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("[INDIVIDUAL SETUP] Profile update error:", {
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
      })
      return { success: false, error: updateError.message }
    }

    console.log("[INDIVIDUAL SETUP] Success for user:", user.id)
    return { success: true }
  } catch (error) {
    console.error("[INDIVIDUAL SETUP] Unexpected error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
